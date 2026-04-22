import { Play, Trash2, Download, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import type { OutputFormat } from '@/types/converter'

interface ConversionControlsProps {
  outputFormat: OutputFormat
  onOutputFormatChange: (format: OutputFormat) => void
  onConvert: () => void
  onClear: () => void
  onDownloadAll: () => void
  isConverting: boolean
  hasFiles: boolean
  hasPendingFiles: boolean
  hasCompletedFiles: boolean
  completedCount: number
  totalCount: number
}

export function ConversionControls({
  outputFormat,
  onOutputFormatChange,
  onConvert,
  onClear,
  onDownloadAll,
  isConverting,
  hasFiles,
  hasPendingFiles,
  hasCompletedFiles,
  completedCount,
  totalCount,
}: ConversionControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-xl bg-muted/50 border">
      {/* Format Selector */}
      <div className="flex items-center gap-2">
        <Image className="size-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Convert to:
        </span>
        <Select
          value={outputFormat}
          onValueChange={(value) => onOutputFormatChange(value as OutputFormat)}
          disabled={isConverting}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jpeg">JPG</SelectItem>
            <SelectItem value="png">PNG</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Progress indicator */}
      {isConverting && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          <span>
            Converting {completedCount}/{totalCount}...
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {hasCompletedFiles && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadAll}
            disabled={isConverting}
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Download All</span>
          </Button>
        )}

        {hasFiles && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={isConverting}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
          >
            <Trash2 className="size-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}

        <Button
          size="sm"
          onClick={onConvert}
          disabled={!hasPendingFiles || isConverting}
          className="min-w-[100px]"
        >
          {isConverting ? (
            <>
              <Spinner className="size-4" />
              Converting...
            </>
          ) : (
            <>
              <Play className="size-4" />
              Convert
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
