import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { connectDB } from '@/lib/mongodb'
import { About } from '@/models/About'
import { SiteSettings } from '@/models/SiteSettings'
import { cacheTag } from 'next/cache'
import { BlogShell } from '@/components/blog-shell'
import { BlogListClient } from '@/components/blog-list-client'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'

async function getSiteSettings() {
  'use cache'
  cacheTag('site')
  await connectDB()
  const doc = await SiteSettings.findOne().lean()
  return doc ? JSON.parse(JSON.stringify(doc)) : null
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings()
  const title = `Blog — ${site?.siteName || 'Portfolio'}`
  const description = 'Articles on web development, software architecture, and UI/UX design.'
  const ogImage = site?.ogImage || site?.defaultOgImage || '/og-default.webp'
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/blog` },
    openGraph: {
      type: 'website',
      url: `${BASE_URL}/blog`,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

async function getShowBlog() {
  'use cache'
  cacheTag('about')
  await connectDB()
  const doc = await About.findOne({}, { showBlog: 1 }).lean() as { showBlog?: boolean } | null
  return doc?.showBlog !== false
}

export default async function BlogPage() {
  const showBlog = await getShowBlog()
  if (!showBlog) notFound()

  return (
    <BlogShell>
      <BlogListClient />
    </BlogShell>
  )
}
