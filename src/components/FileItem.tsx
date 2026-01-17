import { useState, useCallback } from 'react'
import {
  FileImage,
  X,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { ConversionFile } from '@/types/converter'

interface FileItemProps {
  file: ConversionFile
  onRemove: (id: string) => void
  onDownload: (file: ConversionFile) => void
  onGenerateThumbnail: (id: string) => Promise<string | null>
  formatFileSize: (bytes: number) => string
}

export function FileItem({
  file,
  onRemove,
  onDownload,
  onGenerateThumbnail,
  formatFileSize,
}: FileItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false)

  const handleExpand = useCallback(async () => {
    if (!isExpanded && !file.thumbnailUrl && !isLoadingThumbnail) {
      setIsLoadingThumbnail(true)
      await onGenerateThumbnail(file.id)
      setIsLoadingThumbnail(false)
    }
    setIsExpanded(!isExpanded)
  }, [isExpanded, file.thumbnailUrl, file.id, isLoadingThumbnail, onGenerateThumbnail])

  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Pending',
      variant: 'secondary' as const,
      color: 'text-muted-foreground',
    },
    converting: {
      icon: Spinner,
      label: 'Converting...',
      variant: 'default' as const,
      color: 'text-primary',
    },
    completed: {
      icon: CheckCircle2,
      label: 'Done',
      variant: 'default' as const,
      color: 'text-emerald-500',
    },
    error: {
      icon: AlertCircle,
      label: 'Error',
      variant: 'destructive' as const,
      color: 'text-destructive',
    },
  }

  const status = statusConfig[file.status]
  const StatusIcon = status.icon
  const isConverting = file.status === 'converting'
  const isCompleted = file.status === 'completed'
  const hasError = file.status === 'error'

  // Use converted image as preview if available, otherwise use thumbnail
  const previewUrl = file.outputBlobUrl || file.thumbnailUrl

  return (
    <div
      className={cn(
        'group rounded-xl border bg-card transition-all duration-200',
        'hover:shadow-md hover:border-primary/20',
        hasError && 'border-destructive/30 bg-destructive/5'
      )}
    >
      <div className="flex items-center gap-4 p-4">
        {/* File Icon / Preview */}
        <button
          onClick={handleExpand}
          className={cn(
            'relative shrink-0 size-12 rounded-lg overflow-hidden',
            'bg-muted flex items-center justify-center',
            'transition-all hover:ring-2 hover:ring-primary/30'
          )}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={file.name}
              className="size-full object-cover"
            />
          ) : isLoadingThumbnail ? (
            <Spinner className="size-5 text-muted-foreground" />
          ) : (
            <FileImage className="size-5 text-muted-foreground" />
          )}
        </button>

        {/* File Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{file.name}</p>
            <Badge
              variant={status.variant}
              className={cn(
                'shrink-0',
                isCompleted && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              )}
            >
              <StatusIcon
                className={cn('size-3', isConverting && 'animate-spin')}
              />
              {status.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
          {hasError && file.error && (
            <p className="text-sm text-destructive">{file.error}</p>
          )}
          {isConverting && (
            <Progress value={file.progress} className="h-1.5 mt-2" />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {isCompleted && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onDownload(file)}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              <Download className="size-4" />
            </Button>
          )}
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleExpand}
            className="text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onRemove(file.id)}
            disabled={isConverting}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Preview */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="rounded-lg overflow-hidden bg-muted/50 border">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={file.name}
                className="w-full max-h-64 object-contain"
              />
            ) : isLoadingThumbnail ? (
              <div className="flex items-center justify-center h-40">
                <Spinner className="size-6 text-muted-foreground" />
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <FileImage className="size-12" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
