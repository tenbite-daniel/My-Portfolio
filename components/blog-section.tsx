'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { EyeOff, Pencil, Plus, Trash2, Loader2, Check, X, Upload, ArrowLeft, Calendar, Clock, ArrowRight, Share2, CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { BlogFeaturedSlider } from '@/components/blog-featured-slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarPicker } from '@/components/ui/calendar'
type Post = {
  _id?: string
  title: string
  category: string
  date: string
  readTime: string
  image: string
  excerpt: string
  content: string
  tags: string[]
  slug: string
  published: boolean
  scheduledAt?: string | null
}

const EMPTY_POST: Post = {
  title: '',
  category: '',
  date: '',
  readTime: '',
  image: '',
  excerpt: '',
  content: '',
  tags: [],
  slug: '',
  published: false,
  scheduledAt: null,
}

interface BlogSectionProps {
  data?: unknown
  isAdmin?: boolean
  linkMode?: boolean
  initialShowBlog?: boolean
  activePostSlug?: string | null
  onPostSelect?: (slug: string | null) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache?: React.MutableRefObject<Record<string, any>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cachedFetch?: (key: string, url: string) => Promise<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateCache?: (key: string, partial: Record<string, any>) => void
}

export function BlogSection({ isAdmin = false, linkMode = false, initialShowBlog = true, activePostSlug, onPostSelect, cachedFetch, updateCache }: BlogSectionProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [showBlog, setShowBlog] = useState(initialShowBlog)
  const [toggling, setToggling] = useState(false)
  const [page, setPage] = useState(1)
  const listTopRef = useRef<HTMLDivElement>(null)

  const goToPage = (n: number) => {
    setPage(n)
    setTimeout(() => {
      if (listTopRef.current) {
        const y = listTopRef.current.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }, 0)
  }
  const [postsPerPage, setPostsPerPage] = useState(10)

  useEffect(() => {
    const update = () => setPostsPerPage(window.innerWidth < 768 ? 5 : 10)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [activeTab, setActiveTab] = useState<'drafted' | 'published' | 'scheduled'>('published')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [tagInput, setTagInput] = useState('')
  const [tagTags, setTagTags] = useState<string[]>([])

  useEffect(() => {
    if (!isAdmin) return
    setLoading(true)
    // always fetch fresh — bypass cache so scheduledAt changes are reflected immediately
    fetch('/api/admin/blog').then(r => r.json())
      .then(({ posts: p }: { posts: Post[] }) => {
        setPosts(p ?? [])
        setPage(1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin) return
    fetch('/api/admin/blog?public=1').then(r => r.json()).then(({ posts: p }) => {
      setPosts(p ?? [])
      setPage(1)
    }).catch(() => {})
  }, [isAdmin])

  // Sync selectedPost from URL-driven activePostSlug
  useEffect(() => {
    if (!activePostSlug) { setSelectedPost(null); return }
    const match = posts.find(p => p.slug === activePostSlug)
    if (match) setSelectedPost(match)
  }, [activePostSlug, posts])

  const selectPost = (post: Post | null) => {
    setSelectedPost(post)
    onPostSelect?.(post?.slug ?? null)
  }

  const sharePost = (post: Post) => {
    const url = `${window.location.origin}/blog/${post.slug}`
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied to clipboard!'))
  }

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

  const addTag = (val: string) => {
    const t = val.trim()
    if (t && !tagTags.includes(t)) setTagTags(prev => [...prev, t])
    setTagInput('')
  }

  const generateSlug = (title: string) => {
    const base = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const suffix = Math.random().toString(36).slice(2, 8)
    const candidate = `${base}-${suffix}`
    if (posts.some(p => p.slug === candidate)) {
      return `${base}-${Math.random().toString(36).slice(2, 8)}`
    }
    return candidate
  }

  const openNew = () => {
    const newPost = { ...EMPTY_POST, slug: generateSlug('') }
    setEditingPost(newPost)
    setTagTags([])
    setTagInput('')
    setPendingImageFile(null)
    setImagePreview('')
    setIsNew(true)
  }

  const openEdit = (post: Post) => {
    setEditingPost({ ...post })
    setTagTags(post.tags ?? [])
    setTagInput('')
    setPendingImageFile(null)
    setImagePreview(post.image ?? '')
    setIsNew(false)
  }

  const closeEdit = () => {
    setEditingPost(null)
    setIsNew(false)
    setTagTags([])
    setTagInput('')
    setPendingImageFile(null)
    setImagePreview('')
  }

  const handleImageSelect = (file: File) => {
    setPendingImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const savePost = async () => {
    if (!editingPost) return
    if (!editingPost.title.trim()) { toast.error('Title is required'); return }
    if (!editingPost.excerpt.trim()) { toast.error('Excerpt is required'); return }
    if (!editingPost.category.trim()) { toast.error('Category is required'); return }
    if (!editingPost.date.trim()) { toast.error('Date is required'); return }
    if (!editingPost.readTime.trim()) { toast.error('Read time is required'); return }
    if (!editingPost.content.trim()) { toast.error('Content is required'); return }
    if (tagTags.length === 0) { toast.error('At least one tag is required'); return }
    if (!imagePreview && !editingPost.image) { toast.error('Cover image is required'); return }

    setSaving(true)

    let imageUrl = editingPost.image
    if (pendingImageFile) {
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: imagePreview, folder: 'portfolio/blog', public_id: `blog-${Date.now()}` }),
        })
        const json = await res.json()
        if (json.url) {
          imageUrl = json.url
        } else {
          toast.error('Image upload failed')
          setSaving(false)
          return
        }
      } catch {
        toast.error('Image upload failed')
        setSaving(false)
        return
      }
    }

    const slug = editingPost.slug || generateSlug(editingPost.title)
    const payload = { ...editingPost, image: imageUrl, tags: tagTags, slug }

    const res = await fetch('/api/admin/blog', {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const { post } = await res.json()
      const updated = isNew ? [...posts, post] : posts.map(p => p._id === post._id ? post : p)
      setPosts(updated)
      updateCache?.('blog', { posts: updated })
      toast.success(isNew ? 'Post added' : 'Post updated')
      closeEdit()
    } else {
      toast.error('Failed to save post')
    }
    setSaving(false)
  }

  const deletePost = async (post: Post) => {
    if (!post._id) return
    setDeleting(post._id)
    const res = await fetch('/api/admin/blog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: post._id }),
    })
    if (res.ok) {
      const updated = posts.filter(p => p._id !== post._id)
      setPosts(updated)
      updateCache?.('blog', { posts: updated })
      toast.success('Post deleted')
    } else {
      toast.error('Failed to delete post')
    }
    setDeleting(null)
  }

  // Single post view — skipped in linkMode (posts are their own pages)
  if (selectedPost && !linkMode) {
    const idx = posts.findIndex(p => p._id === selectedPost._id || p.slug === selectedPost.slug)
    return (
      <article className="space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => selectPost(null)}
            className="inline-flex items-center gap-2 text-accent hover:gap-3 transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </button>
          <button
            onClick={() => sharePost(selectedPost)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-secondary border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>
        <div className="relative w-full h-72 md:h-96 rounded-xl overflow-hidden">
          <img src={selectedPost.image || '/placeholder.svg'} alt={selectedPost.title} className="w-full h-full object-cover" />
          {selectedPost.category && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
              {selectedPost.category}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{selectedPost.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {selectedPost.date && <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{selectedPost.date}</div>}
            {selectedPost.readTime && <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{selectedPost.readTime}</div>}
          </div>
        </div>
        <div className="space-y-6">
          <p className="text-lg leading-relaxed text-muted-foreground">{selectedPost.excerpt}</p>
          {selectedPost.content && (
            <div className="bg-secondary rounded-lg p-6 border border-border space-y-4">
              {selectedPost.content.split('\n\n').map((para, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed">{para}</p>
              ))}
            </div>
          )}
          {selectedPost.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {selectedPost.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full">#{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-4 pt-8 border-t border-border">
          <button
            onClick={() => selectPost(posts[idx > 0 ? idx - 1 : posts.length - 1])}
            className="flex-1 px-6 py-3 bg-secondary border border-border rounded-lg hover:border-accent transition-all font-medium text-sm"
          >
            Previous
          </button>
          <button
            onClick={() => selectPost(null)}
            className="flex-1 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all font-medium text-sm"
          >
            Back to List
          </button>
          <button
            onClick={() => selectPost(posts[idx < posts.length - 1 ? idx + 1 : 0])}
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
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Show Tab</span>
                  <button
                    onClick={toggleVisibility}
                    disabled={toggling}
                    title={showBlog ? 'Hide from visitors' : 'Show to visitors'}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${showBlog ? 'bg-accent' : 'bg-border'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showBlog ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <button
                  onClick={openNew}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Post
                </button>
              </>
            )}
          </div>
        </div>
        <div className="w-10 h-1 bg-accent rounded-full mb-6" />
        {isAdmin && !showBlog && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-muted/50 border border-dashed border-border w-fit">
            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground italic">Blog tab is hidden from visitors</span>
          </div>
        )}
      </div>

      {!loading && posts.length > 0 && (
        <BlogFeaturedSlider onPostSelect={(slug) => {
          if (linkMode) { window.location.href = `/blog/${slug}`; return }
          const match = posts.find(p => p.slug === slug)
          if (match) selectPost(match)
        }} />
      )}

      {!loading && posts.length > 0 && (() => {
        const categories = ['All', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))]
        return categories.length > 2 ? (
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1) }}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  activeCategory === cat
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'bg-secondary text-muted-foreground border-border hover:border-accent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : null
      })()}

      {isAdmin && !loading && (
        <div className="flex w-full rounded-xl overflow-hidden border border-border">
          {(['published', 'scheduled', 'drafted'] as const).map((tab) => {
            const now = new Date()
            const count = tab === 'published'
              ? posts.filter(p => p.published || (!!p.scheduledAt && new Date(p.scheduledAt) <= now)).length
              : tab === 'scheduled'
              ? posts.filter(p => !!p.scheduledAt && new Date(p.scheduledAt) > now).length
              : posts.filter(p => !p.published && !p.scheduledAt).length
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1) }}
                className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === tab
                    ? tab === 'published' ? 'bg-green-500/10 text-green-500'
                    : tab === 'scheduled' ? 'bg-blue-500/10 text-blue-500'
                    : 'bg-yellow-500/10 text-yellow-500'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  activeTab === tab
                    ? tab === 'published' ? 'bg-green-500/20'
                    : tab === 'scheduled' ? 'bg-blue-500/20'
                    : 'bg-yellow-500/20'
                    : 'bg-border'
                }`}>{count}</span>
              </button>
            )
          })}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground text-sm">{isAdmin ? 'No posts yet. Click "Add Post" to get started.' : 'No blog posts to display yet.'}</p>
        </div>
      ) : (
        <>
        <div ref={listTopRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {posts.filter(p => {
            const now = new Date()
            const tabMatch = !isAdmin || (
              activeTab === 'published' ? p.published || (!!p.scheduledAt && new Date(p.scheduledAt) <= now)
              : activeTab === 'scheduled' ? !!p.scheduledAt && new Date(p.scheduledAt) > now
              : !p.published && !p.scheduledAt
            )
            return tabMatch && (activeCategory === 'All' || p.category === activeCategory)
          }).slice((page - 1) * postsPerPage, page * postsPerPage).map((post, index) => (
            <article
              key={post._id ?? index}
              className="group bg-secondary rounded-xl md:rounded-2xl border border-border overflow-hidden hover:border-accent hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 flex flex-col"
            >
              <div className="h-48 overflow-hidden bg-background relative">
                <img
                  src={post.image || '/placeholder.svg'}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {isAdmin && (() => {
                  const now = new Date()
                  const hasSchedule = !!post.scheduledAt
                  const scheduledAt = hasSchedule ? new Date(post.scheduledAt!) : null
                  const scheduledPast = scheduledAt ? scheduledAt <= now : false
                  const label = hasSchedule && !scheduledPast ? 'Scheduled'
                    : post.published || scheduledPast ? 'Published'
                    : 'Draft'
                  const style = label === 'Published' ? 'bg-green-500/10 text-green-500'
                    : label === 'Scheduled' ? 'bg-blue-500/10 text-blue-500'
                    : 'bg-yellow-500/10 text-yellow-500'
                  return (
                    <div className={`absolute top-3 left-3 px-2 py-0.5 text-xs font-medium rounded-full ${style}`}>
                      {label}{label === 'Scheduled' && scheduledAt ? ` · ${scheduledAt.toLocaleDateString()} ${scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </div>
                  )
                })()}
              </div>
              <div className="p-4 md:p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mb-3">
                  {post.category && <span className="px-2.5 py-0.5 bg-accent/10 text-accent rounded-full font-medium">{post.category}</span>}
                  {post.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>}
                  {post.readTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>}
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 leading-tight group-hover:text-accent transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags?.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-background rounded text-muted-foreground">#{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  {linkMode ? (
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-xs md:text-sm text-accent hover:gap-3 transition-all font-medium"
                    >
                      Read More <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => selectPost(post)}
                      className="inline-flex items-center gap-2 text-xs md:text-sm text-accent hover:gap-3 transition-all font-medium"
                    >
                      Read More <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isAdmin && (
                    <div className="ml-auto flex items-center gap-1.5">
                      <button
                        onClick={() => openEdit(post)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-accent text-accent-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => deletePost(post)}
                        disabled={deleting === post._id}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-destructive/10 text-destructive rounded-lg text-xs font-medium hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
                      >
                        {deleting === post._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        {(() => {
          const now = new Date()
          const filtered = posts.filter(p => {
            const tabMatch = !isAdmin || (
              activeTab === 'published' ? p.published || (!!p.scheduledAt && new Date(p.scheduledAt) <= now)
              : activeTab === 'scheduled' ? !!p.scheduledAt && new Date(p.scheduledAt) > now
              : !p.published && !p.scheduledAt
            )
            return tabMatch && (activeCategory === 'All' || p.category === activeCategory)
          })
          return Math.ceil(filtered.length / postsPerPage) > 1 ? (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded-lg bg-secondary border border-border hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.ceil(filtered.length / postsPerPage) }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => goToPage(n)}
                className={`w-8 h-8 text-sm rounded-lg border transition-colors ${
                  n === page ? 'bg-accent text-accent-foreground border-accent' : 'bg-secondary border-border hover:border-accent'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => goToPage(Math.min(Math.ceil(filtered.length / postsPerPage), page + 1))}
              disabled={page === Math.ceil(filtered.length / postsPerPage)}
              className="px-3 py-1.5 text-sm rounded-lg bg-secondary border border-border hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
          ) : null
        })()}
      </>
      )}

      {/* Edit / Add Dialog */}
      <Dialog open={!!editingPost} onOpenChange={(open) => { if (!open) closeEdit() }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? 'Add Post' : 'Edit Post'}</DialogTitle>
          </DialogHeader>
          {editingPost && (
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Cover Image <span className="text-red-500">*</span></label>
                <div className="flex gap-4 items-start">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageSelect(f) }} />
                    <Upload className="w-4 h-4" />
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </label>
                  {imagePreview && (
                    <div className="relative flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-24 h-20 rounded-xl object-cover border border-border" />
                      <button
                        type="button"
                        onClick={() => { setImagePreview(''); setPendingImageFile(null); setEditingPost(prev => prev ? { ...prev, image: '' } : prev) }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center hover:opacity-90"
                      >×</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Title <span className="text-red-500">*</span></label>
                  <input
                    value={editingPost.title}
                    onChange={(e) => setEditingPost(prev => prev ? { ...prev, title: e.target.value } : prev)}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                    placeholder="Post title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Slug</label>
                  <div className="flex gap-2">
                    <input
                      value={editingPost.slug}
                      readOnly
                      className="flex-1 px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-muted-foreground cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingPost(prev => prev ? { ...prev, slug: generateSlug(prev.title) } : prev)}
                      className="px-3 py-2.5 bg-secondary border border-border rounded-xl text-xs text-muted-foreground hover:text-foreground hover:border-accent transition-colors whitespace-nowrap"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Category <span className="text-red-500">*</span></label>
                  <input
                    value={editingPost.category}
                    onChange={(e) => setEditingPost(prev => prev ? { ...prev, category: e.target.value } : prev)}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                    placeholder="e.g. Development"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Date <span className="text-red-500">*</span></label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-left hover:border-accent transition-colors focus:outline-none"
                      >
                        <CalendarIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className={editingPost.date ? 'text-foreground' : 'text-muted-foreground'}>
                          {editingPost.date || 'Pick a date'}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={editingPost.date ? new Date(editingPost.date) : undefined}
                        onSelect={(d) => setEditingPost(prev => prev ? { ...prev, date: d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '', dateISO: d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : '' } : prev)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Read Time <span className="text-red-500">*</span></label>
                  <div className="flex items-center bg-secondary border border-border rounded-xl overflow-hidden focus-within:border-accent transition-colors">
                    <button
                      type="button"
                      onClick={() => setEditingPost(prev => {
                        if (!prev) return prev
                        const current = parseInt(prev.readTime) || 1
                        return { ...prev, readTime: `${Math.max(1, current - 1)} min` }
                      })}
                      className="px-3 py-2.5 text-base font-bold text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors select-none border-r border-border"
                    >−</button>
                    <div className="flex-1 flex items-center justify-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        value={parseInt(editingPost.readTime) || ''}
                        onChange={(e) => setEditingPost(prev => prev ? { ...prev, readTime: e.target.value ? `${Math.max(1, parseInt(e.target.value))} min` : '' } : prev)}
                        className="w-12 py-2.5 bg-transparent text-sm text-foreground text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="5"
                      />
                      <span className="text-sm text-muted-foreground select-none">min</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingPost(prev => {
                        if (!prev) return prev
                        const current = parseInt(prev.readTime) || 0
                        return { ...prev, readTime: `${current + 1} min` }
                      })}
                      className="px-3 py-2.5 text-base font-bold text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors select-none border-l border-border"
                    >+</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Excerpt <span className="text-red-500">*</span></label>
                <textarea
                  rows={2}
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost(prev => prev ? { ...prev, excerpt: e.target.value } : prev)}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none resize-none"
                  placeholder="Short summary of the post"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Content <span className="text-red-500">*</span> <span className="text-xs text-muted-foreground font-normal">(separate paragraphs with blank line)</span></label>
                <textarea
                  rows={6}
                  value={editingPost.content}
                  onChange={(e) => setEditingPost(prev => prev ? { ...prev, content: e.target.value } : prev)}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none resize-none"
                  placeholder="Full post content..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Tags <span className="text-red-500">*</span> <span className="text-xs text-muted-foreground font-normal">(press Space or Enter to add)</span></label>
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-secondary border border-border rounded-xl min-h-[44px] focus-within:border-accent transition-colors">
                  {tagTags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent rounded-lg text-xs font-medium">
                      {tag}
                      <button type="button" onClick={() => setTagTags(prev => prev.filter(t => t !== tag))} className="hover:text-destructive transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); addTag(tagInput) }
                      else if (e.key === 'Backspace' && !tagInput && tagTags.length > 0) setTagTags(prev => prev.slice(0, -1))
                    }}
                    onBlur={() => { if (tagInput.trim()) addTag(tagInput) }}
                    className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    placeholder={tagTags.length === 0 ? 'e.g. Next.js' : ''}
                  />
                </div>
              </div>

              {/* Release mode */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Release</label>
                <div className="flex gap-2">
                  {(['draft', 'published', 'scheduled'] as const).map((mode) => {
                    const current = editingPost.scheduledAt ? 'scheduled' : editingPost.published ? 'published' : 'draft'
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          if (mode === 'draft') setEditingPost(prev => prev ? { ...prev, published: false, scheduledAt: null } : prev)
                          if (mode === 'published') setEditingPost(prev => prev ? { ...prev, published: true, scheduledAt: null } : prev)
                          if (mode === 'scheduled') setEditingPost(prev => { if (!prev) return prev; const date = (prev as any).dateISO || new Date().toISOString().slice(0, 10); return { ...prev, published: false, scheduledAt: prev.scheduledAt || new Date(`${date}T09:00:00Z`).toISOString() } })
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors border ${
                          current === mode
                            ? mode === 'published' ? 'bg-green-500/10 text-green-500 border-green-500/30'
                            : mode === 'scheduled' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                            : 'bg-secondary text-muted-foreground border-border hover:border-accent'
                        }`}
                      >
                        {mode}
                      </button>
                    )
                  })}
                </div>
                {editingPost.scheduledAt && (
                  <div className="space-y-1.5">
                    <label className="block text-xs text-muted-foreground">Release time (UTC+3)</label>
                    <input
                      type="time"
                      value={editingPost.scheduledAt ? new Date(new Date(editingPost.scheduledAt).getTime() + 3 * 3600000).toISOString().slice(11, 16) : ''}
                      onChange={(e) => {
                        const date = (editingPost as any).dateISO || new Date().toISOString().slice(0, 10)
                        setEditingPost(prev => prev ? { ...prev, scheduledAt: e.target.value ? new Date(`${date}T${e.target.value}:00Z`).getTime() - 3 * 3600000 > 0 ? new Date(new Date(`${date}T${e.target.value}:00Z`).getTime() - 3 * 3600000).toISOString() : null : null } : prev)
                      }}
                      className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={savePost}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isNew ? 'Add Post' : 'Save Changes'}
                </button>
                <button
                  onClick={closeEdit}
                  className="flex items-center gap-2 px-5 py-2.5 bg-secondary border border-border rounded-xl text-sm font-medium hover:border-accent transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
