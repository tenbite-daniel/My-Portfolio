'use client'

import { PenTool, Code, Smartphone, Zap, ChevronLeft, ChevronRight, MessageSquarePlus, Send } from 'lucide-react'
import { aboutData } from '@/lib/portfolio-data'
import { useRef, useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

const iconMap = {
  Code,
  Zap,
  Smartphone,
  PenTool,
}

interface AboutSectionProps {
  data?: typeof aboutData
}

export function AboutSection({ data = aboutData }: AboutSectionProps) {
  const [dbTestimonials, setDbTestimonials] = useState<typeof data.testimonials | null>(null)
  const [testimonyOpen, setTestimonyOpen] = useState(false)
  const [testimonyForm, setTestimonyForm] = useState({ name: '', email: '', text: '' })
  const [testimonyLoading, setTestimonyLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [cols, setCols] = useState(2)

  const activeTestimonials = dbTestimonials ?? data.testimonials
  const total = activeTestimonials.length
  const minForNav = cols === 1 ? 2 : 3
  const showNav = total >= minForNav
  const canLoop = showNav
  const items = canLoop ? [...activeTestimonials, ...activeTestimonials, ...activeTestimonials] : activeTestimonials

  const [index, setIndex] = useState(0)

  useEffect(() => {
    setAnimated(false)
    setIndex(canLoop ? total : 0)
    setTimeout(() => setAnimated(true), 50)
  }, [canLoop, total])
  const [paused, setPaused] = useState(false)
  const [animated, setAnimated] = useState(true)
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [cardWidth, setCardWidth] = useState(0)
  const GAP = 16

  const containerCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    containerRef.current = node
    const measure = (w: number) => {
      if (!w) return
      const c = w < 480 ? 1 : 2
      setCols(c)
      setCardWidth((w - GAP * (c - 1)) / c)
    }
    measure(node.getBoundingClientRect().width)
    const observer = new ResizeObserver(([entry]) => measure(entry.contentRect.width))
    observer.observe(node)
  }, [])

  useEffect(() => {
    fetch('/api/admin/testimonials?status=approved')
      .then((r) => r.json())
      .then((d) => {
        if (d.testimonials?.length) setDbTestimonials(d.testimonials)
      })
      .catch(() => {})
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleTestimonySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTestimonyLoading(true)
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...testimonyForm, avatar: avatarPreview ?? undefined }),
      })
      if (res.ok) {
        toast.success('Thank you! Your testimony is pending approval.')
      } else {
        toast.error('Failed to submit. Please try again.')
      }
    } catch {
      toast.error('Failed to submit. Please try again.')
    }
    setTestimonyLoading(false)
    setTestimonyOpen(false)
    setTestimonyForm({ name: '', email: '', text: '' })
    setAvatarPreview(null)
  }

  useEffect(() => {
    if (!canLoop) return
    if (paused) return
    const interval = setInterval(() => {
      setIndex((i) => i + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [paused, canLoop])

  useEffect(() => {
    if (!canLoop) return
    if (index >= total * 2) {
      const timer = setTimeout(() => {
        setAnimated(false)
        setIndex(index - total)
        setTimeout(() => setAnimated(true), 50)
      }, 500)
      return () => clearTimeout(timer)
    }
    if (index < 0) {
      const timer = setTimeout(() => {
        setAnimated(false)
        setIndex(index + total)
        setTimeout(() => setAnimated(true), 50)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [index, total])

  const go = (dir: 'left' | 'right') => {
    if (!canLoop && ((dir === 'left' && index === 0) || (dir === 'right' && index === total - 1))) return
    setPaused(true)
    setAnimated(true)
    setIndex((i) => i + (dir === 'right' ? 1 : -1))
    if (pauseTimer.current) clearTimeout(pauseTimer.current)
    pauseTimer.current = setTimeout(() => setPaused(false), 4000)
  }
  return (
    <div className="space-y-8 md:space-y-10">
      {/* About Me */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">About Me</h2>
        <div className="w-10 h-1 bg-accent rounded-full mb-6" />
        <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
          {data.description.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* What I'm Doing */}
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">What I'm Doing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {data.services.map((service, index) => {
            const IconComponent = iconMap[service.icon as keyof typeof iconMap]
            return (
              <div
                key={index}
                className="flex gap-3 md:gap-4 p-4 md:p-6 bg-secondary rounded-xl md:rounded-2xl border border-border hover:border-accent transition-colors"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                  <IconComponent className="w-full h-full text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-foreground mb-2">{service.title}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <Dialog open={testimonyOpen} onOpenChange={setTestimonyOpen}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-foreground">Testimonials</h3>
            {total > 0 && (
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-colors">
                  <MessageSquarePlus className="w-4 h-4" />
                  Make a Testimony
                </button>
              </DialogTrigger>
            )}
          </div>
          {total === 0 ? (
            <div className="bg-secondary border border-border rounded-2xl p-8 text-center space-y-4">
              <p className="text-sm text-muted-foreground">No testimonials yet. Be the first to share your experience!</p>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-colors">
                  <MessageSquarePlus className="w-4 h-4" />
                  Make a Testimony
                </button>
              </DialogTrigger>
            </div>
          ) : (
            <div className="relative">
              {showNav && (
                <button
                  onClick={() => go('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-lg bg-secondary border border-border hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors flex items-center justify-center shadow-sm"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <div className={`overflow-hidden ${showNav ? 'mx-4' : ''}`} ref={containerCallbackRef} style={{ visibility: cardWidth ? 'visible' : 'hidden' }}>
                <div
                  className="flex"
                  style={{
                    gap: `${GAP}px`,
                    transform: cardWidth ? `translateX(-${index * (cardWidth + GAP)}px)` : undefined,
                    transition: animated ? 'transform 500ms ease-in-out' : 'none',
                  }}
                >
                  {items.map((testimonial, i) => {
                    const initials = testimonial.name.trim().split(/\s+/).length >= 2
                      ? testimonial.name.trim().split(/\s+/).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                      : testimonial.name.trim()[0].toUpperCase()
                    return (
                      <div key={i} className="flex-shrink-0 p-4 bg-secondary rounded-xl md:rounded-2xl border border-border" style={{ width: cardWidth || undefined }}>
                        <div className="flex items-center gap-3 mb-3">
                          {testimonial.avatar ? (
                            <img src={testimonial.avatar} alt={testimonial.name} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-accent font-medium text-base">{initials}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-base font-semibold text-foreground truncate">{testimonial.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{testimonial.email}</p>
                          </div>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{testimonial.text}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
              {showNav && (
                <button
                  onClick={() => go('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-lg bg-secondary border border-border hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors flex items-center justify-center shadow-sm"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Your Testimony</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleTestimonySubmit} className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={testimonyForm.name}
                  onChange={(e) => setTestimonyForm({ ...testimonyForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={testimonyForm.email}
                  onChange={(e) => setTestimonyForm({ ...testimonyForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all text-sm"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Profile Image <span className="text-muted-foreground text-xs">(optional)</span></label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    {avatarPreview ? 'Change Image' : 'Click to upload image'}
                  </label>
                  {avatarPreview && (
                    <div className="relative flex-shrink-0">
                      <img src={avatarPreview} alt="Preview" className="w-14 h-14 rounded-xl object-cover border border-border" />
                      <button
                        type="button"
                        onClick={() => setAvatarPreview(null)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center hover:opacity-90"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Your Testimony <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  value={testimonyForm.text}
                  onChange={(e) => setTestimonyForm({ ...testimonyForm, text: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all resize-none text-sm"
                  placeholder="Share your experience working with me..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={testimonyLoading}
                className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-accent-foreground rounded-xl font-medium hover:opacity-90 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {testimonyLoading ? 'Submitting...' : 'Submit Testimony'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients with Marquee Animation */}
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">Clients</h3>
        <div className="relative overflow-hidden py-4">
          <div className="flex gap-4 md:gap-6 animate-marquee-slow">
            {[...data.clients, ...data.clients].map((client, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-32 h-20 md:w-40 md:h-24 bg-secondary rounded-xl md:rounded-2xl border border-border flex items-center justify-center p-4 md:p-6 hover:border-accent transition-colors"
              >
                <img
                  src={client.logo || "/placeholder.svg"}
                  alt={client.name}
                  className="w-full h-full object-contain opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
