import { useState, useCallback, useRef, useEffect } from 'react'
import { heicTo } from 'heic-to'
import type { ConversionFile, OutputFormat } from '../types/converter'

const MAX_CONCURRENT = 2 // Limit concurrent conversions to avoid memory issues
const DEFAULT_QUALITY = 0.92

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}-${Math.random().toString(36).slice(2, 11)}`
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function useImageConverter() {
  const [files, setFiles] = useState<ConversionFile[]>([])
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg')
  const [isConverting, setIsConverting] = useState(false)

  const blobUrlsRef = useRef<Set<string>>(new Set())
  const abortRef = useRef(false)
  const isConvertingRef = useRef(false)
  const filesRef = useRef<ConversionFile[]>(files)

  useEffect(() => {
    filesRef.current = files
  }, [files])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    const blobUrls = blobUrlsRef.current

    return () => {
      // Signal abort to prevent ongoing conversions from creating new blob URLs
      abortRef.current = true
      blobUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const heicFiles = fileArray.filter((file) => {
      const ext = file.name.toLowerCase()
      return ext.endsWith('.heic') || ext.endsWith('.heif')
    })

    const conversionFiles: ConversionFile[] = heicFiles.map((file) => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
      outputBlobUrl: null,
      outputBlob: null,
      error: null,
      thumbnailUrl: null,
    }))

    setFiles((prev) => [...prev, ...conversionFiles])
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file) {
        // Revoke blob URLs
        if (file.outputBlobUrl) {
          URL.revokeObjectURL(file.outputBlobUrl)
          blobUrlsRef.current.delete(file.outputBlobUrl)
        }
        if (file.thumbnailUrl) {
          URL.revokeObjectURL(file.thumbnailUrl)
          blobUrlsRef.current.delete(file.thumbnailUrl)
        }
      }
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const clearFiles = useCallback(() => {
    // Signal abort for any ongoing conversions
    abortRef.current = true

    // Revoke all tracked blob URLs (includes any URLs not yet reflected in state)
    blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    blobUrlsRef.current.clear()

    setFiles([])
    setIsConverting(false)
    isConvertingRef.current = false

    // Reset abort flag after a tick
    setTimeout(() => {
      abortRef.current = false
    }, 0)
  }, [])

  const updateFile = useCallback(
    (id: string, updates: Partial<ConversionFile>) => {
      setFiles((prev) =>
        prev.map((file) => (file.id === id ? { ...file, ...updates } : file))
      )
    },
    []
  )

  const convertFile = useCallback(
    async (file: ConversionFile, format: OutputFormat): Promise<void> => {
      updateFile(file.id, { status: 'converting', progress: 50 })

      try {
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'

        const convertedBlob = await heicTo({
          blob: file.file,
          type: mimeType,
          quality: DEFAULT_QUALITY,
        })

        const blobUrl = URL.createObjectURL(convertedBlob)
        blobUrlsRef.current.add(blobUrl)

        // Check if conversion was aborted
        if (abortRef.current) {
          URL.revokeObjectURL(blobUrl)
          blobUrlsRef.current.delete(blobUrl)
          return
        }
        updateFile(file.id, {
          status: 'completed',
          progress: 100,
          outputBlob: convertedBlob,
          outputBlobUrl: blobUrl,
        })
      } catch (err) {
        // Check if conversion was aborted
        if (abortRef.current) return

        updateFile(file.id, {
          status: 'error',
          progress: 0,
          error: err instanceof Error ? err.message : 'Conversion failed',
        })
      }
    },
    [updateFile]
  )

  const convert = useCallback(async () => {
    // Guard against concurrent invocations using ref (synchronous check)
    if (isConvertingRef.current) return
    isConvertingRef.current = true

    // Read from ref to get latest files state, avoiding stale closure
    const pendingFiles = filesRef.current.filter((f) => f.status === 'pending')
    if (pendingFiles.length === 0) {
      isConvertingRef.current = false
      return
    }

    setIsConverting(true)

    // Process files in batches to limit concurrency
    const queue = [...pendingFiles]
    const activePromises: Promise<void>[] = []

    while (queue.length > 0 || activePromises.length > 0) {
      // Check for abort
      if (abortRef.current) break

      // Fill up to MAX_CONCURRENT
      while (queue.length > 0 && activePromises.length < MAX_CONCURRENT) {
        const file = queue.shift()!
        const promise: Promise<void> = convertFile(file, outputFormat).finally(() => {
          const index = activePromises.indexOf(promise)
          if (index > -1) activePromises.splice(index, 1)
        })
        activePromises.push(promise)
      }

      // Wait for at least one to complete before continuing
      if (activePromises.length > 0) {
        await Promise.race(activePromises)
      }
    }

    setIsConverting(false)
    isConvertingRef.current = false
  }, [outputFormat, convertFile])

  const downloadFile = useCallback((file: ConversionFile) => {
    if (!file.outputBlobUrl || !file.outputBlob) return

    const extension =
      file.outputBlob.type === 'image/png'
        ? 'png'
        : file.outputBlob.type === 'image/jpeg'
          ? 'jpg'
          : 'jpg'
    const baseName = file.name.replace(/\.(heic|heif)$/i, '')
    const downloadName = `${baseName}.${extension}`

    const link = document.createElement('a')
    link.href = file.outputBlobUrl
    link.download = downloadName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  const downloadAll = useCallback(() => {
    // Read from ref to get latest files state, avoiding stale closure
    const completedFiles = filesRef.current.filter((f) => f.status === 'completed')
    completedFiles.forEach((file, index) => {
      // Stagger downloads to avoid browser blocking
      setTimeout(() => downloadFile(file), index * 100)
    })
  }, [downloadFile])

  const generateThumbnail = useCallback(
    async (id: string): Promise<string | null> => {
      // Read from ref to get latest files state, avoiding stale closure
      const file = filesRef.current.find((f) => f.id === id)
      if (!file || file.thumbnailUrl) return file?.thumbnailUrl || null

      try {
        const thumbnailBlob = await heicTo({
          blob: file.file,
          type: 'image/jpeg',
          quality: 0.3, // Low quality for thumbnail
        })

        const thumbnailUrl = URL.createObjectURL(thumbnailBlob)
        blobUrlsRef.current.add(thumbnailUrl)
        // Check if component unmounted during conversion
        if (abortRef.current) {
          URL.revokeObjectURL(thumbnailUrl)
          blobUrlsRef.current.delete(thumbnailUrl)
          return null
        }
        updateFile(id, { thumbnailUrl })
        return thumbnailUrl
      } catch {
        return null
      }
    },
    [updateFile]
  )

  const hasFiles = files.length > 0
  const hasPendingFiles = files.some((f) => f.status === 'pending')
  const hasCompletedFiles = files.some((f) => f.status === 'completed')
  const completedCount = files.filter((f) => f.status === 'completed').length
  const totalCount = files.length

  return {
    files,
    outputFormat,
    setOutputFormat,
    isConverting,
    addFiles,
    removeFile,
    clearFiles,
    convert,
    downloadFile,
    downloadAll,
    generateThumbnail,
    formatFileSize,
    hasFiles,
    hasPendingFiles,
    hasCompletedFiles,
    completedCount,
    totalCount,
  }
}
