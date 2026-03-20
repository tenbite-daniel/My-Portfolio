'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProfileSidebar } from '@/components/profile-sidebar'
import { AboutSection } from '@/components/about-section'
import { ResumeSection } from '@/components/resume-section'
import { PortfolioSection } from '@/components/portfolio-section'
import { BlogSection } from '@/components/blog-section'
import { ContactSection } from '@/components/contact-section-new'
import { ThemeToggle } from '@/components/theme-toggle'
import { CaseStudiesSection } from '@/components/case-studies-section'
import { ResumeDownload } from '@/components/resume-download'
import { profileData, aboutData, contactData } from '@/lib/portfolio-data'

import type { ReactNode } from 'react'

interface HomeClientProps {
  profile: typeof profileData
  aboutDescription: string[]
  aboutServices?: { icon: string; title: string; description: string }[]
  aboutClients?: { name: string; logo: string }[]
  aboutShowClients?: boolean
  showMetrics?: boolean
  showBlog?: boolean
  showCaseStudies?: boolean
  initialProjects?: { _id?: string; title: string; category: string; image: string; description: string; tech: string[]; liveUrl: string; githubUrl: string; metrics?: Record<string, string> }[] | null
  testimonials: { name: string; email: string; text: string; avatar?: string }[]
  resumeData?: { experience: { title: string; period: string; description: string }[]; education: { title: string; period: string; description: string }[]; skills: { name: string; level: number }[]; cvUrl?: string | null }
  githubSection: ReactNode
}

export function HomeClient({ profile, aboutDescription, aboutServices, aboutClients, aboutShowClients, showMetrics = true, showBlog = true, showCaseStudies = true, initialProjects, testimonials, resumeData: resumeDoc, githubSection }: HomeClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState(() => searchParams.get('tab') ?? 'about')
  const [activePostSlug, setActivePostSlug] = useState<string | null>(() => searchParams.get('post'))
  const cvUrl = resumeDoc?.cvUrl ?? null
  const publicTabs = ['about', 'projects', 'github', 'resume', ...(showBlog ? ['blog'] : []), ...(showCaseStudies ? ['case studies'] : []), 'contact']
  const navRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  const updateUrl = (tab: string, post?: string | null) => {
    const params = new URLSearchParams()
    if (tab !== 'about') params.set('tab', tab)
    if (post) params.set('post', post)
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '/', { scroll: false })
  }

  const handleTabClick = (section: string) => {
    setActiveSection(section)
    setActivePostSlug(null)
    updateUrl(section)
    const nav = navRef.current
    if (nav) {
      const btn = nav.querySelector(`[data-section="${section}"]`) as HTMLElement
      if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
    setTimeout(() => {
      const main = mainRef.current
      if (!main) return
      const top = main.getBoundingClientRect().top + window.scrollY - 28
      window.scrollTo({ top, behavior: 'smooth' })
    }, 50)
  }

  const handlePostSelect = (slug: string | null) => {
    setActivePostSlug(slug)
    updateUrl(activeSection, slug)
  }

  useEffect(() => {
    const tab = searchParams.get('tab') ?? 'about'
    const post = searchParams.get('post')
    setActiveSection(tab)
    setActivePostSlug(post)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:py-6 lg:pr-6 lg:pl-[22rem]">
      <div className="fixed top-0 left-0 right-0 h-7 bg-background z-40" />
      <div className="fixed top-1 right-1 md:top-2 md:right-2 z-50">
        <ThemeToggle />
      </div>

      {/* Fixed Sidebar - desktop only */}
      <div className="hidden lg:block fixed top-6 left-6 bottom-6 w-80 z-40">
        <ProfileSidebar data={profile} />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden mb-3 sm:mb-4">
        <ProfileSidebar data={profile} />
      </div>

      <div className="mx-auto max-w-5xl">
        <main ref={mainRef} className="bg-card rounded-xl md:rounded-2xl border border-border">
          <div className="sticky top-7 z-30 border-b border-border overflow-hidden">
            <div className="absolute -top-7 left-0 right-0 h-7 bg-background" />
            <div className="relative bg-card">
              <nav ref={navRef} className="bg-card flex items-center gap-1 sm:gap-2 md:gap-3 p-3 sm:p-4 md:p-6 overflow-x-auto scrollbar-hide">
                {publicTabs.map((section) => (
                  <button
                    key={section}
                    data-section={section}
                    onClick={() => handleTabClick(section)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors whitespace-nowrap flex-shrink-0 ${
                      activeSection === section
                        ? 'text-foreground bg-accent/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    {section}
                  </button>
                ))}
                <a
                  href={cvUrl ? '/api/resume-cv?preview=1' : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`ml-auto flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap bg-accent text-accent-foreground transition-opacity ${!cvUrl ? 'opacity-40 pointer-events-none' : 'hover:opacity-90'}`}
                >
                  Preview Resume
                </a>
              </nav>
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent lg:hidden" />
            </div>
          </div>

          <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-8">
            {activeSection === 'about' && <AboutSection data={aboutData} initialDescription={aboutDescription} initialServices={aboutServices} initialClients={aboutClients} initialShowClients={aboutShowClients} initialTestimonials={testimonials} />}
            {activeSection === 'projects' && <PortfolioSection initialShowMetrics={showMetrics} initialProjects={initialProjects} />}
            {activeSection === 'case studies' && showCaseStudies && <CaseStudiesSection />}
            {activeSection === 'blog' && showBlog && <BlogSection activePostSlug={activePostSlug} onPostSelect={handlePostSelect} />}
            {activeSection === 'github' && githubSection}
            {activeSection === 'resume' && (
              <div className="space-y-8">
                <ResumeDownload cvUrl={cvUrl} />
                <ResumeSection data={resumeDoc} />
              </div>
            )}
            {activeSection === 'contact' && <ContactSection data={contactData} />}
          </div>
        </main>
      </div>
    </div>
  )
}
