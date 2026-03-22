import type { Metadata } from 'next'
import { BlogShell } from '@/components/blog-shell'
import { PortfolioSection } from '@/components/portfolio-section'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { About } from '@/models/About'
import { cacheTag } from 'next/cache'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A showcase of my work and projects.',
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
