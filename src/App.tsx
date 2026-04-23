import { Toaster, toast } from 'sonner'
import { useEffect, useRef } from 'react'
import { Header } from './components/Header'
import { FileDropZone } from './components/FileDropZone'
import { FileList } from './components/FileList'
import { ConversionControls } from './components/ConversionControls'
import { useImageConverter } from './hooks/useImageConverter'

function App() {
  const {
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
  } = useImageConverter()
  const errorCount = files.filter((f) => f.status === 'error').length
  const processedCount = completedCount + errorCount

  const prevIsConvertingRef = useRef(false)
  const batchStartCountsRef = useRef({ completed: 0, errors: 0 })
  const cancelledBatchRef = useRef(false)

  const handleClear = () => {
    cancelledBatchRef.current = isConverting
    clearFiles()
  }

  // Show toast when all conversions complete
  useEffect(() => {
    if (isConverting && !prevIsConvertingRef.current) {
      cancelledBatchRef.current = false
      batchStartCountsRef.current = {
        completed: completedCount,
        errors: errorCount,
      }
    }

    if (!isConverting && prevIsConvertingRef.current) {
      const completedDelta =
        completedCount - batchStartCountsRef.current.completed
      const errorDelta = errorCount - batchStartCountsRef.current.errors
      const processedCount = completedDelta + errorDelta

      if (cancelledBatchRef.current || processedCount <= 0) {
        cancelledBatchRef.current = false
        prevIsConvertingRef.current = isConverting
        return
      }

      if (errorDelta === 0) {
        toast.success(`Successfully converted ${completedDelta} file${completedDelta > 1 ? 's' : ''}`)
      } else if (completedDelta === 0) {
        toast.error(`Failed to convert ${errorDelta} file${errorDelta > 1 ? 's' : ''}`)
      } else {
        toast.warning(
          `Processed ${processedCount} file${processedCount > 1 ? 's' : ''}: ${completedDelta} succeeded, ${errorDelta} failed`
        )
      }
    }

    prevIsConvertingRef.current = isConverting
  }, [isConverting, completedCount, errorCount, files])

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-8">
          <Header />

          <div className="space-y-4">
            <FileDropZone
              onFilesSelected={addFiles}
              disabled={isConverting}
            />

            {hasFiles && (
              <ConversionControls
                outputFormat={outputFormat}
                onOutputFormatChange={setOutputFormat}
                onConvert={convert}
                onClear={handleClear}
                onDownloadAll={downloadAll}
                isConverting={isConverting}
                hasFiles={hasFiles}
                hasPendingFiles={hasPendingFiles}
                hasCompletedFiles={hasCompletedFiles}
                processedCount={processedCount}
                totalCount={totalCount}
              />
            )}

            <FileList
              files={files}
              onRemove={removeFile}
              onDownload={downloadFile}
              onGenerateThumbnail={generateThumbnail}
              formatFileSize={formatFileSize}
            />
          </div>
        </div>
      </main>

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </div>
  )
}

export default App
