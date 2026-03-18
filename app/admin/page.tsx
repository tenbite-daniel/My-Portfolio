'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { AdminDashboard } from '@/components/admin/dashboard'
import { AdminSettings } from '@/components/admin/settings'
import { LogOut } from 'lucide-react'
import {
  profileData,
  aboutData,
  resumeData,
  blogData,
  contactData,
} from '@/lib/portfolio-data'

type ProfileData = typeof profileData

const PUBLIC_TABS = ['about', 'projects', 'github', 'resume', 'blog', 'case studies', 'contact']
const ADMIN_TABS = ['dashboard', ...PUBLIC_TABS, 'settings']

export default function AdminPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarProfile, setSidebarProfile] = useState<ProfileData>(profileData)
  const [aboutDescription, setAboutDescription] = useState<string[] | null>(null)
  const [aboutTestimonials, setAboutTestimonials] = useState<{ name: string; email: string; text: string; avatar?: string }[] | null>(null)
  const [showMetrics, setShowMetrics] = useState(true)
  const navRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then(({ profile: p }) => {
        if (p) setSidebarProfile({ ...profileData, ...p, social: { ...profileData.social, ...p.social } })
      })

    fetch('/api/admin/about')
      .then((r) => r.json())
      .then(({ about }) => {
        if (about?.description?.length) setAboutDescription(about.description)
        if (typeof about?.showMetrics === 'boolean') setShowMetrics(about.showMetrics)
      })
      .catch(() => {})

    fetch('/api/admin/testimonials?status=approved')
      .then((r) => r.json())
      .then(({ testimonials }) => { if (testimonials?.length) setAboutTestimonials(testimonials) })
      .catch(() => {})
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail
      setSidebarProfile((prev) => ({ ...prev, ...p, social: { ...prev.social, ...p.social } }))
    }
    window.addEventListener('profile-updated', handler)
    return () => window.removeEventListener('profile-updated', handler)
  }, [])

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

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:py-6 lg:pr-6 lg:pl-[22rem]">
      <div className="fixed top-0 left-0 right-0 h-7 bg-background z-40" />
      <div className="fixed top-1 right-3 md:top-1 md:right-1 z-50 flex items-center gap-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors border border-border"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
        <ThemeToggle />
      </div>

      {/* Fixed Sidebar - desktop only */}
      <div className="hidden lg:block fixed top-6 left-6 bottom-6 w-80 z-40">
        <ProfileSidebar data={sidebarProfile} />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden mb-3 sm:mb-4">
        <ProfileSidebar data={sidebarProfile} />
      </div>

      <div className="mx-auto max-w-5xl">
        <main ref={mainRef} className="bg-card rounded-xl md:rounded-2xl border border-border">
          {/* Navigation - sticky */}
          <div className="sticky top-7 z-30 border-b border-border overflow-hidden">
            <div className="absolute -top-7 left-0 right-0 h-7 bg-background" />
            <div className="relative bg-card">
              <nav ref={navRef} className="bg-card flex items-center gap-0.5 px-2 py-3 sm:px-3 sm:py-4 md:px-4 md:py-5 overflow-x-auto scrollbar-hide">
                {ADMIN_TABS.map((section) => (
                  <button
                    key={section}
                    data-section={section}
                    onClick={() => handleTabClick(section)}
                    className={`px-2 py-1.5 rounded-lg text-xs md:text-sm font-medium capitalize transition-colors whitespace-nowrap flex-shrink-0 ${
                      section === 'dashboard'
                        ? activeSection === section
                          ? 'text-accent-foreground bg-accent'
                          : 'text-accent hover:bg-accent/10'
                        : activeSection === section
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
                  className="ml-auto flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
                >
                  Preview Resume
                </a>
              </nav>
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent lg:hidden" />
            </div>
          </div>

          <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-8">
            {activeSection === 'dashboard' && <AdminDashboard />}
            {activeSection === 'about' && <AboutSection data={aboutData} isAdmin initialDescription={aboutDescription ?? undefined} initialTestimonials={aboutTestimonials ?? undefined} onDescriptionSaved={setAboutDescription} />}
            {activeSection === 'projects' && <PortfolioSection isAdmin initialShowMetrics={showMetrics} />}
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
            {activeSection === 'settings' && <AdminSettings />}
          </div>
        </main>
      </div>
    </div>
  )
}
