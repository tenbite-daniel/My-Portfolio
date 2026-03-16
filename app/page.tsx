'use client'

import { useState, useRef } from 'react'
import { ProfileSidebar } from '@/components/profile-sidebar'
import { AboutSection } from '@/components/about-section'
import { ResumeSection } from '@/components/resume-section'
import { PortfolioSection } from '@/components/portfolio-section'
import { BlogSection } from '@/components/blog-section'
import { ContactSection } from '@/components/contact-section-new'
import { ThemeToggle } from '@/components/theme-toggle'
import { GitHubSection } from '@/components/github-section'
import { CaseStudiesSection } from '@/components/case-studies-section'
import { ResumeDownload } from '@/components/resume-download'
import {
  profileData,
  aboutData,
  resumeData,
  portfolioData,
  blogData,
  contactData,
} from '@/lib/portfolio-data'

export default function Home() {
  const [activeSection, setActiveSection] = useState('about')
  const navRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  const handleTabClick = (section: string) => {
    setActiveSection(section)
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

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:py-6 lg:pr-6 lg:pl-[22rem]">
      {/* Covers viewport top so scrolled content doesn't show above the card */}
      <div className="fixed top-0 left-0 right-0 h-7 bg-background z-40" />
      <div className="fixed top-1 right-1 md:top-2 md:right-2 z-50">
        <ThemeToggle />
      </div>

      {/* Fixed Sidebar - desktop only */}
      <div className="hidden lg:block fixed top-6 left-6 bottom-6 w-80 z-40">
        <ProfileSidebar data={profileData} />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden mb-3 sm:mb-4">
        <ProfileSidebar data={profileData} />
      </div>

      <div className="mx-auto max-w-5xl">
        <main ref={mainRef} className="bg-card rounded-xl md:rounded-2xl border border-border">
          {/* Navigation - sticky */}
          <div className="sticky top-7 z-30 border-b border-border overflow-hidden">
            {/* Covers the gap above the sticky nav so content doesn't show through */}
            <div className="absolute -top-7 left-0 right-0 h-7 bg-background" />
            <div className="relative bg-card">
              <nav ref={navRef} className="bg-card flex items-center gap-1 sm:gap-2 md:gap-3 p-3 sm:p-4 md:p-6 overflow-x-auto scrollbar-hide">
                {['about', 'portfolio', 'github', 'resume', 'blog', 'case studies', 'contact'].map((section) => (
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
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
                >
                  Preview Resume
                </a>
              </nav>
              {/* Scroll hint gradient - only on mobile */}
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent lg:hidden" />
            </div>
          </div>

          <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-8">
            {activeSection === 'about' && <AboutSection data={aboutData} />}
            {activeSection === 'portfolio' && <PortfolioSection data={portfolioData} />}
            {activeSection === 'case studies' && <CaseStudiesSection />}
            {activeSection === 'blog' && <BlogSection />}
            {activeSection === 'github' && <GitHubSection />}
            {activeSection === 'resume' && (
              <div className="space-y-8">
                <ResumeDownload />
                <ResumeSection data={resumeData} />
              </div>
            )}
            {activeSection === 'contact' && <ContactSection data={contactData} />}
          </div>
        </main>
      </div>
    </div>
  )
}
