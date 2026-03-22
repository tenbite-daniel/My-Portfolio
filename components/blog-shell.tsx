import { ProfileSidebar } from '@/components/profile-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { connectDB } from '@/lib/mongodb'
import { Profile } from '@/models/Profile'
import { Resume } from '@/models/Resume'
import { About } from '@/models/About'
import { cacheTag } from 'next/cache'
import { profileData } from '@/lib/portfolio-data'
import type { ReactNode } from 'react'

async function getProfile() {
  'use cache'
  cacheTag('profile')
  await connectDB()
  const doc = await Profile.findOne().lean()
  return doc ? JSON.parse(JSON.stringify(doc)) : null
}

async function getCvUrl() {
  'use cache'
  cacheTag('resume')
  await connectDB()
  const doc = await Resume.findOne().lean() as { cvUrl?: string } | null
  return doc?.cvUrl ?? null
}

async function getShowBlog() {
  'use cache'
  cacheTag('about')
  await connectDB()
  const doc = await About.findOne({}, { showBlog: 1 }).lean() as { showBlog?: boolean } | null
  return doc?.showBlog !== false
}

export async function BlogShell({ children }: { children: ReactNode }) {
  const [profileDoc, cvUrl, showBlog] = await Promise.all([getProfile(), getCvUrl(), getShowBlog()])

  const profile = profileDoc
    ? {
        ...profileData,
        name: profileDoc.name ?? profileData.name,
        title: profileDoc.title ?? profileData.title,
        avatar: profileDoc.avatar ?? profileData.avatar,
        email: profileDoc.email ?? profileData.email,
        phone: profileDoc.phone ?? profileData.phone,
        location: profileDoc.location ?? profileData.location,
        social: {
          github: profileDoc.social?.github ?? profileData.social.github,
          linkedin: profileDoc.social?.linkedin ?? profileData.social.linkedin,
          instagram: profileDoc.social?.instagram ?? profileData.social.instagram,
          tiktok: profileDoc.social?.tiktok ?? profileData.social.tiktok,
        },
      }
    : profileData

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:py-6 lg:pr-6 lg:pl-[22rem]">
      <div className="fixed top-0 left-0 right-0 h-7 bg-background z-40" />
      <div className="fixed top-1 right-1 md:top-2 md:right-2 z-50">
        <ThemeToggle />
      </div>

      <div className="hidden lg:block fixed top-6 left-6 bottom-6 w-80 z-40">
        <ProfileSidebar data={profile} />
      </div>

      <div className="lg:hidden mb-3 sm:mb-4">
        <ProfileSidebar data={profile} />
      </div>

      <div className="mx-auto max-w-5xl">
        <main className="bg-card rounded-xl md:rounded-2xl border border-border">
          <div className="sticky top-7 z-30 border-b border-border overflow-hidden">
            <div className="absolute -top-7 left-0 right-0 h-7 bg-background" />
            <div className="relative bg-card">
              <nav className="bg-card flex items-center gap-1 sm:gap-2 md:gap-3 p-3 sm:p-4 md:p-6 overflow-x-auto scrollbar-hide">
                {(['about', 'projects', 'github', 'resume', 'case studies', 'contact'] as const).map((section) => (
                  <a
                    key={section}
                    href={`/?tab=${section}`}
                    className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors whitespace-nowrap flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  >
                    {section}
                  </a>
                ))}
                {showBlog && (
                  <span className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize whitespace-nowrap flex-shrink-0 text-foreground bg-accent/10">
                    blog
                  </span>
                )}
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
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
