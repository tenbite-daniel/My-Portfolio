'use client'

import * as LucideIcons from 'lucide-react'
import { ChevronLeft, ChevronRight, MessageSquarePlus, Send, Pencil, Plus, Trash2, Loader2, X, Check, Search } from 'lucide-react'
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

const FORWARD_REF = Symbol.for('react.forward_ref')
const ALL_ICON_NAMES = Object.keys(LucideIcons).filter(
  (k) => /^[A-Z]/.test(k) && !k.endsWith('Icon') && (LucideIcons as Record<string, { $$typeof?: symbol }>)[k]?.$$typeof === FORWARD_REF
)

function LucideIcon({ name, className, strokeWidth }: { name: string; className?: string; strokeWidth?: number }) {
  const Icon = (LucideIcons as Record<string, LucideIcons.LucideIcon>)[name]
  if (!Icon) return null
  return <Icon className={className} strokeWidth={strokeWidth} />
}

function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = query.trim()
    ? ALL_ICON_NAMES.filter((n) => n.toLowerCase().includes(query.toLowerCase())).slice(0, 60)
    : ALL_ICON_NAMES.slice(0, 60)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative flex-1">
      <div
        className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg cursor-pointer hover:border-accent transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <LucideIcon name={value} className="w-4 h-4 text-accent flex-shrink-0" />
        <span className="text-sm text-foreground flex-1 truncate">{value || 'Select icon'}</span>
        <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      </div>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-lg">
          <div className="p-2 border-b border-border">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons..."
              className="w-full px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-6 gap-1 p-2 max-h-48 overflow-y-auto">
            {filtered.map((name) => (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => { onChange(name); setOpen(false); setQuery('') }}
                className={`flex items-center justify-center w-full aspect-square rounded-lg hover:bg-accent/10 transition-colors ${
                  value === name ? 'bg-accent/20 ring-1 ring-accent' : ''
                }`}
              >
                <LucideIcon name={name} className="w-4 h-4 text-foreground" />
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-6 text-xs text-muted-foreground text-center py-4">No icons found</p>
            )}
          </div>
          {!query && (
            <p className="text-xs text-muted-foreground text-center pb-2">Search to see all {ALL_ICON_NAMES.length} icons</p>
          )}
        </div>
      )}
    </div>
  )
}

type Service = { icon: string; title: string; description: string }
type Client = { name: string; logo: string }

interface AboutSectionProps {
  data?: typeof aboutData
  isAdmin?: boolean
  initialDescription?: string[]
  initialServices?: Service[]
  initialClients?: Client[]
  initialShowClients?: boolean
  onDescriptionSaved?: (desc: string[]) => void
}

export function AboutSection({ data = aboutData, isAdmin = false, initialDescription, initialServices, initialClients, initialShowClients, onDescriptionSaved }: AboutSectionProps) {
  const [dbTestimonials, setDbTestimonials] = useState<typeof data.testimonials | null>(null)
  const [dbDescription, setDbDescription] = useState<string[] | null>(initialDescription ?? null)
  const [dbServices, setDbServices] = useState<Service[] | null>(initialServices ?? null)
  const [editing, setEditing] = useState(false)
  const [paragraphs, setParagraphs] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [editingServices, setEditingServices] = useState(false)
  const [servicesDraft, setServicesDraft] = useState<Service[]>([])
  const [savingServices, setSavingServices] = useState(false)
  const [dbClients, setDbClients] = useState<Client[] | null>(initialClients ?? null)
  const [showClients, setShowClients] = useState(initialShowClients ?? true)
  const [togglingClients, setTogglingClients] = useState(false)
  const [editingClients, setEditingClients] = useState(false)
  const [clientsDraft, setClientsDraft] = useState<Client[]>([])
  const [savingClients, setSavingClients] = useState(false)
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

  const startEditing = () => {
    setParagraphs(dbDescription ?? data.description)
    setEditing(true)
  }

  const saveAbout = async () => {
    setSaving(true)
    const filtered = paragraphs.filter((p) => p.trim() !== '')
    const res = await fetch('/api/admin/about', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: filtered }),
    })
    if (res.ok) {
      setDbDescription(filtered)
      setEditing(false)
      onDescriptionSaved?.(filtered)
      toast.success('About saved')
    } else {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  const startEditingServices = () => {
    setServicesDraft(dbServices ?? data.services)
    setEditingServices(true)
  }

  const saveServices = async () => {
    setSavingServices(true)
    const res = await fetch('/api/admin/about', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services: servicesDraft }),
    })
    if (res.ok) {
      setDbServices(servicesDraft)
      setEditingServices(false)
      toast.success('Services saved')
    } else {
      toast.error('Failed to save')
    }
    setSavingServices(false)
  }

  const updateService = (i: number, field: keyof Service, value: string) => {
    setServicesDraft((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const toggleShowClients = async () => {
    setTogglingClients(true)
    const next = !showClients
    const res = await fetch('/api/admin/about', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showClients: next }),
    })
    if (res.ok) {
      setShowClients(next)
      toast.success(next ? 'Clients section is now visible' : 'Clients section is now hidden')
    } else {
      toast.error('Failed to update')
    }
    setTogglingClients(false)
  }

  const uploadClientLogo = async (i: number, file: File) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      // optimistic preview
      updateClient(i, 'logo', base64)
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: base64, folder: 'portfolio/clients', public_id: `client-${Date.now()}-${i}` }),
        })
        const json = await res.json()
        if (json.url) updateClient(i, 'logo', json.url)
        else toast.error('Upload failed')
      } catch {
        toast.error('Upload failed')
      }
    }
    reader.readAsDataURL(file)
  }

  const saveClients = async () => {
    setSavingClients(true)
    const res = await fetch('/api/admin/about', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clients: clientsDraft }),
    })
    if (res.ok) {
      setDbClients(clientsDraft)
      setEditingClients(false)
      toast.success('Clients saved')
    } else {
      toast.error('Failed to save')
    }
    setSavingClients(false)
  }

  const updateClient = (i: number, field: keyof Client, value: string) => {
    setClientsDraft((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
  }

  useEffect(() => {
    fetch('/api/admin/testimonials?status=approved')
      .then((r) => r.json())
      .then((d) => {
        if (d.testimonials?.length) setDbTestimonials(d.testimonials)
      })
      .catch(() => {})
    if (!initialServices || !initialClients || initialShowClients === undefined) {
      fetch('/api/admin/about')
        .then((r) => r.json())
        .then(({ about }) => {
          if (!initialServices && about?.services?.length) setDbServices(about.services)
          if (!initialClients && about?.clients?.length) setDbClients(about.clients)
          if (initialShowClients === undefined && typeof about?.showClients === 'boolean') setShowClients(about.showClients)
        })
        .catch(() => {})
    }
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">About Me</h2>
          {isAdmin && !editing && (
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary border border-border hover:border-accent hover:text-accent transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </div>
        <div className="w-10 h-1 bg-accent rounded-full mb-6" />
        {editing ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {paragraphs.map((p, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <textarea
                    className="flex-1 px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all resize-none"
                    rows={3}
                    value={p}
                    onChange={(e) => { const u = [...paragraphs]; u[i] = e.target.value; setParagraphs(u) }}
                    placeholder={`Paragraph ${i + 1}...`}
                  />
                  <button
                    onClick={() => setParagraphs(paragraphs.filter((_, j) => j !== i))}
                    disabled={paragraphs.length === 1}
                    className="mt-2 w-8 h-8 flex-shrink-0 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white flex items-center justify-center transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setParagraphs([...paragraphs, ''])}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-border rounded-xl text-muted-foreground hover:border-accent hover:text-accent transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Paragraph
            </button>
            <div className="flex gap-2">
              <button onClick={saveAbout} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save
              </button>
              <button onClick={() => setEditing(false)} className="flex items-center gap-2 px-5 py-2.5 bg-secondary border border-border rounded-xl text-sm font-medium hover:border-accent transition-colors">
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
            {(dbDescription ?? data.description).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>

      {/* What I'm Doing */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-foreground">What I'm Doing</h3>
          {isAdmin && !editingServices && (
            <button
              onClick={startEditingServices}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary border border-border hover:border-accent hover:text-accent transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </div>
        {editingServices ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {servicesDraft.map((service, i) => (
                <div key={i} className="p-4 bg-secondary border border-border rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <IconPicker value={service.icon} onChange={(name) => updateService(i, 'icon', name)} />
                    <button
                      onClick={() => setServicesDraft((prev) => prev.filter((_, j) => j !== i))}
                      disabled={servicesDraft.length === 1}
                      className="w-8 h-8 flex-shrink-0 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white flex items-center justify-center transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    value={service.title}
                    onChange={(e) => updateService(i, 'title', e.target.value)}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                    placeholder="Service title"
                  />
                  <textarea
                    value={service.description}
                    onChange={(e) => updateService(i, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none resize-none"
                    placeholder="Service description"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => setServicesDraft((prev) => [...prev, { icon: 'Code', title: '', description: '' }])}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-border rounded-xl text-muted-foreground hover:border-accent hover:text-accent transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
            <div className="flex gap-2">
              <button onClick={saveServices} disabled={savingServices} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
                {savingServices ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save
              </button>
              <button onClick={() => setEditingServices(false)} className="flex items-center gap-2 px-5 py-2.5 bg-secondary border border-border rounded-xl text-sm font-medium hover:border-accent transition-colors">
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {(dbServices ?? data.services).map((service, index) => {
              return (
                <div
                  key={index}
                  className="flex gap-3 md:gap-4 p-4 md:p-6 bg-secondary rounded-xl md:rounded-2xl border border-border hover:border-accent transition-colors"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                    <LucideIcon name={service.icon} className="w-full h-full text-accent" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-semibold text-foreground mb-2">{service.title}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Testimonials */}
      <div>
        <Dialog open={testimonyOpen} onOpenChange={setTestimonyOpen}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-foreground">Testimonials</h3>
            {total > 0 && (
              <DialogTrigger asChild>
                <button suppressHydrationWarning className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-colors">
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
                <button suppressHydrationWarning className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-colors">
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

      {/* Clients */}
      {(!isAdmin && showClients) || isAdmin ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-foreground">Clients</h3>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleShowClients}
                  disabled={togglingClients}
                  title={showClients ? 'Hide from visitors' : 'Show to visitors'}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                    showClients ? 'bg-accent' : 'bg-border'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    showClients ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                {!editingClients && (
                  <button
                    onClick={() => { setClientsDraft(dbClients ?? data.clients); setEditingClients(true) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary border border-border hover:border-accent hover:text-accent transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
          {isAdmin && !showClients && (
            <p className="text-xs text-muted-foreground mb-4 italic">Hidden from visitors</p>
          )}
          {editingClients ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {clientsDraft.map((client, i) => (
                  <div key={i} className="p-4 bg-secondary border border-border rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Client {i + 1}</span>
                      <button
                        onClick={() => setClientsDraft((prev) => prev.filter((_, j) => j !== i))}
                        className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      value={client.name}
                      onChange={(e) => updateClient(i, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                      placeholder="Client name"
                    />
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadClientLogo(i, f) }}
                      />
                      {client.logo ? (
                        <div className="relative flex-shrink-0 group">
                          <img src={client.logo} alt={client.name} className="w-14 h-14 rounded-xl object-contain bg-secondary border border-border" />
                          <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center shadow">
                            <Pencil className="w-2.5 h-2.5 text-accent-foreground" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 bg-card border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-accent hover:text-accent transition-colors">
                          <Plus className="w-4 h-4" />
                          Upload logo
                        </div>
                      )}
                    </label>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setClientsDraft((prev) => [...prev, { name: '', logo: '' }])}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-border rounded-xl text-muted-foreground hover:border-accent hover:text-accent transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Client
              </button>
              <div className="flex gap-2">
                <button onClick={saveClients} disabled={savingClients} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
                  {savingClients ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save
                </button>
                <button onClick={() => setEditingClients(false)} className="flex items-center gap-2 px-5 py-2.5 bg-secondary border border-border rounded-xl text-sm font-medium hover:border-accent transition-colors">
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            (() => {
              const clients = dbClients ?? data.clients
              const shouldMarquee = clients.length >= 5
              const displayed = shouldMarquee ? [...clients, ...clients] : clients
              return (
                <div className={`relative py-4 ${shouldMarquee ? 'overflow-hidden' : ''}`}>
                  <div className={`flex gap-6 md:gap-8 ${shouldMarquee ? 'animate-marquee-slow' : 'flex-wrap justify-center'}`}>
                    {displayed.map((client, i) => (
                      <img
                        key={i}
                        src={client.logo || '/placeholder.svg'}
                        alt={client.name}
                        className="flex-shrink-0 h-10 md:h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              )
            })()
          )}
        </div>
      ) : null}
    </div>
  )
}
