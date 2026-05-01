import type { MetadataRoute } from 'next'
import { connectDB } from '@/lib/mongodb'
import { Blog } from '@/models/Blog'
import { Project } from '@/models/Project'
import { SiteSettings } from '@/models/SiteSettings'

export const revalidate = 3600

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB()

  const [site, posts, projects] = await Promise.all([
    SiteSettings.findOne().lean() as Promise<{ updatedAt?: Date } | null>,
    Blog.find({ published: true }, { slug: 1, updatedAt: 1 }).lean(),
    Project.find({}, { _id: 1, updatedAt: 1 }).lean(),
  ])

  const lastMod = site?.updatedAt ?? new Date('2025-01-01')

  return [
    { url: BASE_URL, lastModified: lastMod, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/projects`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    ...projects.map((project) => ({
      url: `${BASE_URL}/projects/${project._id}`,
      lastModified: (project as { updatedAt?: Date }).updatedAt ?? lastMod,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: `${BASE_URL}/blog/${(post as { slug: string }).slug}`,
      lastModified: (post as { updatedAt?: Date }).updatedAt ?? lastMod,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
