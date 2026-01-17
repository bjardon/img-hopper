export type OutputFormat = 'jpeg' | 'png'

export type ConversionStatus = 'pending' | 'converting' | 'completed' | 'error'

export interface ConversionFile {
  id: string
  file: File
  name: string
  size: number
  status: ConversionStatus
  progress: number
  outputBlobUrl: string | null
  outputBlob: Blob | null
  error: string | null
  thumbnailUrl: string | null
}
