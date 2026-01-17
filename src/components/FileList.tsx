import { FileImage } from 'lucide-react'
import { FileItem } from './FileItem'
import type { ConversionFile } from '@/types/converter'

interface FileListProps {
  files: ConversionFile[]
  onRemove: (id: string) => void
  onDownload: (file: ConversionFile) => void
  onGenerateThumbnail: (id: string) => Promise<string | null>
  formatFileSize: (bytes: number) => string
}

export function FileList({
  files,
  onRemove,
  onDownload,
  onGenerateThumbnail,
  formatFileSize,
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <FileImage className="size-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No files yet</p>
        <p className="text-sm text-muted-foreground/70">
          Drop some HEIC files to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          onRemove={onRemove}
          onDownload={onDownload}
          onGenerateThumbnail={onGenerateThumbnail}
          formatFileSize={formatFileSize}
        />
      ))}
    </div>
  )
}
