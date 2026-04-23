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
    return null
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
