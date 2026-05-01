'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface NavData {
  showBlog: boolean
  showCaseStudies: boolean
  cvUrl: string | null
}

export function NavBar({ activePage }: { activePage?: string }) {
  const [nav, setNav] = useState<NavData>({ showBlog: true, showCaseStudies: true, cvUrl: null })

  useEffect(() => {
    fetch('/api/nav')
      .then((r) => r.json())
      .then(setNav)
      .catch(() => {})
  }, [])

  return (
    <nav className="bg-card flex items-center gap-1 sm:gap-2 md:gap-3 p-3 sm:p-4 md:p-6 overflow-x-auto scrollbar-hide">
      <Link
        href="/?tab=about"
        className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors whitespace-nowrap flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
      >
        about
      </Link>
      <Link
        href="/projects"
        className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors whitespace-nowrap flex-shrink-0 ${
          activePage === 'projects' ? 'text-foreground bg-accent/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        }`}
      >
        projects
      </Link>
      {(['github', 'resume', 'contact'] as const).map((section) => (
        <Link
          key={section}
          href={`/?tab=${section}`}
          className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors whitespace-nowrap flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          {section}
        </Link>
      ))}
      {nav.showCaseStudies && (
        <Link
          href="/?tab=case studies"
          className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors whitespace-nowrap flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          case studies
        </Link>
      )}
      {nav.showBlog && (
        <Link
          href="/blog"
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors whitespace-nowrap flex-shrink-0 ${
            activePage === 'blog' ? 'text-foreground bg-accent/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          blog
        </Link>
      )}
      <Link
        href={nav.cvUrl ? '/api/resume-cv?preview=1' : '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={`ml-auto flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap bg-accent text-accent-foreground transition-opacity ${!nav.cvUrl ? 'opacity-40 pointer-events-none' : 'hover:opacity-90'}`}
      >
        Preview Resume
      </Link>
    </nav>
  )
}
