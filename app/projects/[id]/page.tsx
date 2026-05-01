import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Eye, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { About } from '@/models/About'
import { cacheTag } from 'next/cache'
import { BlogShell } from '@/components/blog-shell'
import { ProjectMetrics } from '@/components/project-metrics'

async function getProject(id: string) {
  'use cache'
  cacheTag('projects')
  await connectDB()
  try {
    const doc = await Project.findById(id).lean()
    return doc ? JSON.parse(JSON.stringify(doc)) : null
  } catch {
    return null
  }
}

async function getShowMetrics() {
  'use cache'
  cacheTag('about')
  await connectDB()
  const doc = await About.findOne({}, { showMetrics: 1 }).lean() as { showMetrics?: boolean } | null
  return doc?.showMetrics !== false
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const project = await getProject(id)
  if (!project) return {}
  const title = project.title
  const description = project.description || ''
  const ogImage = project.image || undefined
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/projects/${id}` },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${BASE_URL}/projects/${id}`,
      title,
      description,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

export async function generateStaticParams() {
  try {
    await connectDB()
    const projects = await Project.find({}, { _id: 1 }).lean()
    return projects.map((p) => ({ id: String(p._id) }))
  } catch {
    return []
  }
}

async function ProjectContent({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = await paramsPromise
  const [project, showMetrics] = await Promise.all([getProject(id), getShowMetrics()])
  if (!project) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-accent hover:gap-3 transition-all font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
      </div>

      {project.image && (
        <div className="relative w-full aspect-[21/9] rounded-xl border border-border overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          {project.category && (
            <span className="absolute top-3 right-3 px-2.5 py-1 bg-accent/80 text-accent-foreground rounded-lg text-xs font-medium capitalize backdrop-blur-sm">
              {project.category}
            </span>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {project.tech?.map((t: string) => (
            <span key={t} className="px-2.5 py-1 bg-accent/10 text-accent border border-accent/20 rounded-lg text-xs font-medium">
              {t}
            </span>
          ))}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{project.title}</h1>

        {project.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
        )}

        {project.bullets?.length > 0 && (
          <ul className="space-y-1.5">
            {project.bullets.map((b: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-accent mt-0.5 flex-shrink-0">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {showMetrics && project.metrics && Object.keys(project.metrics).length > 0 && (
          <ProjectMetrics metrics={project.metrics} />
        )}

        {(project.liveUrl || project.githubUrl) && (
          <div className="flex gap-2 pt-2 border-t border-border">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Eye className="w-4 h-4" />
                Live Preview
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border text-foreground rounded-lg text-sm font-medium hover:border-accent transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <BlogShell activePage="projects">
        <ProjectContent paramsPromise={params} />
      </BlogShell>
    </Suspense>
  )
}
