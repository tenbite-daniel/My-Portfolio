import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { connectDB } from '@/lib/mongodb'
import { Blog } from '@/models/Blog'
import { SiteSettings } from '@/models/SiteSettings'
import { About } from '@/models/About'
import { Profile } from '@/models/Profile'
import { BlogShell } from '@/components/blog-shell'
import { ShareButton } from '@/components/share-button'

export const revalidate = 3600

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'

async function getAuthorName() {
  await connectDB()
  const doc = await Profile.findOne({}, { name: 1 }).lean() as { name?: string } | null
  return doc?.name || null
}

async function getShowBlog() {
  await connectDB()
  const doc = await About.findOne({}, { showBlog: 1 }).lean() as { showBlog?: boolean } | null
  return doc?.showBlog !== false
}

async function getPost(slug: string) {
  await connectDB()
  const now = new Date()
  const post = await Blog.findOne({
    slug,
    $or: [
      { published: true, scheduledAt: null },
      { published: true, scheduledAt: { $lte: now } },
      { scheduledAt: { $lte: now } },
    ],
  }).lean()
  return post ? JSON.parse(JSON.stringify(post)) : null
}

async function getSiteSettings() {
  await connectDB()
  const doc = await SiteSettings.findOne().lean()
  return doc ? JSON.parse(JSON.stringify(doc)) : null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  const site = await getSiteSettings()
  const ogImage = post.image || site?.ogImage || '/og-default.webp'
  const url = `/blog/${slug}`

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags?.join(', '),
    alternates: { canonical: `${BASE_URL}${url}` },
    openGraph: {
      type: 'article',
      url,
      locale: 'en_US',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  }
}

export async function generateStaticParams() {
  try {
    await connectDB()
    const posts = await Blog.find({ published: true }, { slug: 1 }).lean()
    return posts.map((p) => ({ slug: String(p.slug) }))
  } catch {
    return []
  }
}

function BlogPostingJsonLd({ post, url, authorName }: { post: Record<string, unknown>; url: string; authorName?: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `${BASE_URL}${url}`,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    ...(post.image ? { image: post.image } : {}),
    ...(Array.isArray(post.tags) && post.tags.length ? { keywords: (post.tags as string[]).join(', ') } : {}),
    ...(authorName ? { author: { '@type': 'Person', name: authorName } } : {}),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [showBlog, post, authorName] = await Promise.all([getShowBlog(), getPost(slug), getAuthorName()])
  if (!showBlog || !post) notFound()
  const url = `/blog/${slug}`

  return (
    <BlogShell>
      <BlogPostingJsonLd post={post} url={url} authorName={authorName ?? undefined} />
      <article className="space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-accent hover:gap-3 transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </Link>
          <ShareButton url={`${BASE_URL}${url}`} />
        </div>

        <div className="relative w-full h-72 md:h-96 rounded-xl overflow-hidden">
          <Image
            src={post.image || '/placeholder.svg'}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 800px"
          />
          {post.category && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
              {post.category}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {post.date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.date}
              </div>
            )}
            {post.readTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
          {post.content && (
            <div
              className="prose prose-neutral dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {post.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-8 border-t border-border">
          <Link
            href="/blog"
            className="flex-1 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all font-medium text-sm text-center"
          >
            Back to List
          </Link>
        </div>
      </article>
    </BlogShell>
  )
}
