import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { connectDB } from '@/lib/mongodb'
import { About } from '@/models/About'
import { cacheTag } from 'next/cache'
import { BlogShell } from '@/components/blog-shell'
import { BlogListClient } from '@/components/blog-list-client'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles on web development, architecture, and design.',
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
