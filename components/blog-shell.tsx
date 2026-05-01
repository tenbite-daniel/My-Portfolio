import { ProfileSidebar } from '@/components/profile-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { NavBar } from '@/components/nav-bar'
import { connectDB } from '@/lib/mongodb'
import { Profile } from '@/models/Profile'
import { profileData } from '@/lib/portfolio-data'
import type { ReactNode } from 'react'

async function getProfile() {
  await connectDB()
  const doc = await Profile.findOne().lean()
  return doc ? JSON.parse(JSON.stringify(doc)) : null
}

export async function BlogShell({ children, activePage }: { children: ReactNode; activePage?: string }) {
  const profileDoc = await getProfile()

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
              <NavBar activePage={activePage} />
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
