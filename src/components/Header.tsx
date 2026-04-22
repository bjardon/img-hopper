import { ImageIcon, ShieldCheck } from 'lucide-react'

export function Header() {
  return (
    <header className="text-center space-y-4">
      <div className="flex items-center justify-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <div className="relative aspect-square bg-gradient-to-br from-primary/80 to-primary/50 p-3 rounded-2xl shadow-lg">
            <ImageIcon className="size-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Image Hopper
        </h1>
      </div>
      <p className="text-muted-foreground text-lg max-w-md mx-auto">
        Convert HEIC images to JPG or PNG instantly
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="size-4 text-emerald-500" />
        <span>100% local — your images never leave your device</span>
      </div>
    </header>
  )
}
