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

  const prevCompletedCount = useRef(0)

  // Show toast when all conversions complete
  useEffect(() => {
    if (
      !isConverting &&
      completedCount > 0 &&
      completedCount > prevCompletedCount.current
    ) {
      const errorCount = files.filter((f) => f.status === 'error').length
      if (errorCount === 0) {
        toast.success(`Successfully converted ${completedCount} file${completedCount > 1 ? 's' : ''}`)
      } else {
        toast.warning(
          `Converted ${completedCount} file${completedCount > 1 ? 's' : ''}, ${errorCount} failed`
        )
      }
    }
    prevCompletedCount.current = completedCount
  }, [isConverting, completedCount, files])

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
                onClear={clearFiles}
                onDownloadAll={downloadAll}
                isConverting={isConverting}
                hasFiles={hasFiles}
                hasPendingFiles={hasPendingFiles}
                hasCompletedFiles={hasCompletedFiles}
                completedCount={completedCount}
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
