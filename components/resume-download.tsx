'use client'

import { Download, FileText } from 'lucide-react'

export function ResumeDownload({ cvUrl }: { cvUrl?: string | null }) {
  const previewHref = cvUrl || null
  return (
    <div className="bg-gradient-to-br from-accent/5 via-secondary to-background rounded-lg border border-accent/20 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">Download My Resume</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Get a comprehensive overview of my experience, skills, and achievements.
            </p>
          </div>
        </div>
        {previewHref && (
          <a
            href="/api/resume-cv"
            download="Tenbite Daniel Resume.pdf"
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm md:text-base whitespace-nowrap flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        )}
      </div>
    </div>
  )
}
