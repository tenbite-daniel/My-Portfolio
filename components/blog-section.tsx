'use client'

import { useState } from 'react'
import { Calendar, Clock, ArrowRight, ArrowLeft, EyeOff } from 'lucide-react'
import { blogData } from '@/lib/portfolio-data'
import { toast } from 'sonner'

const mockedContent: Record<string, string> = {
  default: `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.
  `.trim(),
}

interface BlogSectionProps {
  data?: typeof blogData
  isAdmin?: boolean
  initialShowBlog?: boolean
}

export function BlogSection({ data = blogData, isAdmin = false, initialShowBlog = true }: BlogSectionProps) {
  const { posts } = data
  const [selectedPost, setSelectedPost] = useState<number | null>(null)
  const [showBlog, setShowBlog] = useState(initialShowBlog)
  const [toggling, setToggling] = useState(false)

  const toggleVisibility = async () => {
    setToggling(true)
    const next = !showBlog
    const res = await fetch('/api/admin/about', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showBlog: next }),
    })
    if (res.ok) {
      setShowBlog(next)
      toast.success(next ? 'Blog tab is now visible' : 'Blog tab is now hidden')
    } else {
      toast.error('Failed to update')
    }
    setToggling(false)
  }

  if (selectedPost !== null && posts[selectedPost]) {
    const post = posts[selectedPost]
    return (
      <article className="space-y-8">
        <button
          onClick={() => setSelectedPost(null)}
          className="inline-flex items-center gap-2 text-accent hover:gap-3 transition-all font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </button>

        <div className="relative w-full h-72 md:h-96 rounded-xl overflow-hidden">
          <img
            src={post.image || '/placeholder.svg'}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
            {post.category}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{post.date}</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{post.readTime}</div>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
          <div className="bg-secondary rounded-lg p-6 border border-border space-y-4">
            {(mockedContent[post.slug] || mockedContent.default).split('\n\n').map((para, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">{para}</p>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-4">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full">#{tag}</span>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-8 border-t border-border">
          <button
            onClick={() => setSelectedPost(selectedPost > 0 ? selectedPost - 1 : posts.length - 1)}
            className="flex-1 px-6 py-3 bg-secondary border border-border rounded-lg hover:border-accent transition-all font-medium text-sm"
          >
            Previous
          </button>
          <button
            onClick={() => setSelectedPost(null)}
            className="flex-1 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all font-medium text-sm"
          >
            Back to List
          </button>
          <button
            onClick={() => setSelectedPost(selectedPost < posts.length - 1 ? selectedPost + 1 : 0)}
            className="flex-1 px-6 py-3 bg-secondary border border-border rounded-lg hover:border-accent transition-all font-medium text-sm"
          >
            Next
          </button>
        </div>
      </article>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Blog</h2>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Show Tab</span>
              <button
                onClick={toggleVisibility}
                disabled={toggling}
                title={showBlog ? 'Hide from visitors' : 'Show to visitors'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                  showBlog ? 'bg-accent' : 'bg-border'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  showBlog ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          )}
        </div>
        <div className="w-10 h-1 bg-accent rounded-full mb-6" />
        {isAdmin && !showBlog && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-muted/50 border border-dashed border-border w-fit">
            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground italic">Blog tab is hidden from visitors</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {posts.map((post, index) => (
          <article
            key={index}
            className="group bg-secondary rounded-xl md:rounded-2xl border border-border overflow-hidden hover:border-accent hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 flex flex-col"
          >
            <div className="h-48 overflow-hidden bg-background">
              <img
                src={post.image || '/placeholder.svg'}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4 md:p-5 flex flex-col flex-1">
              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mb-3">
                <span className="px-2.5 py-0.5 bg-accent/10 text-accent rounded-full font-medium">{post.category}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 leading-tight group-hover:text-accent transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">{post.excerpt}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-background rounded text-muted-foreground">#{tag}</span>
                ))}
              </div>
              <button
                onClick={() => setSelectedPost(index)}
                className="inline-flex items-center gap-2 text-xs md:text-sm text-accent hover:gap-3 transition-all font-medium mt-auto"
              >
                Read More <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
