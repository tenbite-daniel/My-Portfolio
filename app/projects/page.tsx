import type { Metadata } from 'next'
import { BlogShell } from '@/components/blog-shell'
import { PortfolioSection } from '@/components/portfolio-section'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { About } from '@/models/About'
import { SiteSettings } from '@/models/SiteSettings'
import { cacheTag } from 'next/cache'

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
  const title = `Projects — ${site?.siteName || 'Portfolio'}`
  const description = 'A showcase of web development and software engineering projects.'
  const ogImage = site?.ogImage || site?.defaultOgImage || '/og-default.webp'
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/projects` },
    openGraph: {
      type: 'website',
      url: `${BASE_URL}/projects`,
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

async function getProjects() {
  'use cache'
  cacheTag('projects')
  await connectDB()
  const docs = await Project.find().sort({ order: 1, createdAt: -1 }).lean()
  return JSON.parse(JSON.stringify(docs))
}

async function getShowMetrics() {
  'use cache'
  cacheTag('about')
  await connectDB()
  const doc = await About.findOne({}, { showMetrics: 1 }).lean() as { showMetrics?: boolean } | null
  return doc?.showMetrics !== false
}

export default async function ProjectsPage() {
  const [projects, showMetrics] = await Promise.all([getProjects(), getShowMetrics()])

  return (
    <BlogShell activePage="projects">
      <PortfolioSection linkMode initialProjects={projects} initialShowMetrics={showMetrics} />
    </BlogShell>
  )
}
