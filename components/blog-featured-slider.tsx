'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

type Post = {
  _id?: string
  title: string
  image: string
  date: string
  slug: string
  published: boolean
  scheduledAt?: string | null
}

interface BlogFeaturedSliderProps {
  onPostSelect: (slug: string) => void
}

export function BlogFeaturedSlider({ onPostSelect }: BlogFeaturedSliderProps) {
  const [slides, setSlides] = useState<Post[]>([])
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/blog?scheduled=1').then(r => r.json()),
      fetch('/api/admin/blog?public=1').then(r => r.json()),
    ]).then(([{ posts: scheduled }, { posts: published }]) => {
      const featured = [...(scheduled ?? []), ...(published ?? []).slice(0, 5)]
      setSlides(featured)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [slides.length])

  const go = (n: number) => {
    setCurrent((current + n + slides.length) % slides.length)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000)
  }

  if (slides.length === 0) return null

  const post = slides[current]
  const releaseDate = post.scheduledAt
    ? new Date(post.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : post.date

  return (
    <div className="relative w-full h-56 md:h-72 rounded-xl overflow-hidden group">
      <img
        src={post.image || '/placeholder.svg'}
        alt={post.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        <button
          onClick={() => onPostSelect(post.slug)}
          className="text-left group/title"
        >
          <h3 className="text-white font-bold text-base md:text-xl leading-snug line-clamp-2 group-hover/title:text-accent transition-colors">
            {post.title}
          </h3>
        </button>
        {releaseDate && (
          <div className="flex items-center gap-1.5 mt-1.5 text-white/70 text-xs">
            <Calendar className="w-3 h-3" />
            {post.scheduledAt && new Date(post.scheduledAt) > new Date() ? 'Coming ' : ''}{releaseDate}
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 right-4 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); if (timerRef.current) clearInterval(timerRef.current) }}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
