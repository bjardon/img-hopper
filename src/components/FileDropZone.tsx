import { useCallback, useRef, useState } from 'react'
import { Upload, FileImage, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileDropZoneProps {
  onFilesSelected: (files: FileList | File[]) => void
  disabled?: boolean
  collapsed?: boolean
}

export function FileDropZone({ onFilesSelected, disabled, collapsed }: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      if (disabled) return

      const { files } = e.dataTransfer
      if (files && files.length > 0) {
        onFilesSelected(files)
      }
    },
    [disabled, onFilesSelected]
  )

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }, [disabled])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        inputRef.current?.click()
      }
    },
    [disabled]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target
      if (files && files.length > 0) {
        onFilesSelected(files)
      }
      // Reset input to allow selecting the same file again
      e.target.value = ''
    },
    [onFilesSelected]
  )

  // Collapsed version - compact add more files button
  if (collapsed) {
    return (
      <div
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={cn(
          'relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragOver && 'border-primary bg-primary/10',
          disabled && 'opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent',
          !isDragOver && !disabled && 'border-border'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".heic,.HEIC,.heif,.HEIF,image/heic,image/heif"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex items-center justify-center gap-2 py-3 px-4">
          <Plus className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            {isDragOver ? 'Drop files here' : 'Add more files'}
          </span>
        </div>
      </div>
    )
  }

  // Expanded version - full dropzone
  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      className={cn(
        'relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300',
        'hover:border-primary/50 hover:bg-primary/5',
        isDragOver && 'border-primary bg-primary/10 scale-[1.02]',
        disabled && 'opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent',
        !isDragOver && !disabled && 'border-border'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".heic,.HEIC,.heif,.HEIF,image/heic,image/heif"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center py-12 px-6 gap-4">
        <div
          className={cn(
            'p-4 rounded-full transition-colors duration-300',
            isDragOver ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'
          )}
        >
          {isDragOver ? (
            <FileImage className="size-8 text-primary" />
          ) : (
            <Upload className="size-8 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>

        <div className="text-center space-y-2">
          <p className="text-lg font-medium">
            {isDragOver ? 'Drop your files here' : 'Drop HEIC files here'}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse your computer
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
          <span className="px-2 py-1 rounded bg-muted">.heic</span>
          <span className="px-2 py-1 rounded bg-muted">.heif</span>
        </div>
      </div>
    </div>
  )
}
