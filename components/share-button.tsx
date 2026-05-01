'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

export function ShareButton({ url }: { url: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(url).then(() => toast.success('Link copied to clipboard!'))}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-secondary border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
    >
      <Share2 className="w-3.5 h-3.5" />
      Share
    </button>
  )
}
