'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { EyeOff, ExternalLink, Eye, Pencil, Plus, Trash2, Loader2, Check, X, Upload, ChevronDown } from 'lucide-react'
import { ProjectMetrics } from './project-metrics'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Metrics = Record<string, string>

type Project = {
  _id?: string
  title: string
  category: string
  image: string
  description: string
  bullets?: string[]
  tech: string[]
  liveUrl: string
  githubUrl: string
  metrics?: Metrics
}

const EMPTY_PROJECT: Project = {
  title: '',
  category: '',
  image: '',
  description: '',
  bullets: [],
  tech: [],
  liveUrl: '',
  githubUrl: '',
  metrics: {},
}

interface PortfolioSectionProps {
  isAdmin?: boolean
  linkMode?: boolean
  initialShowMetrics?: boolean
  initialProjects?: Project[] | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache?: React.MutableRefObject<Record<string, any>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cachedFetch?: (key: string, url: string) => Promise<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateCache?: (key: string, partial: Record<string, any>) => void
}

export function PortfolioSection({ isAdmin = false, linkMode = false, initialShowMetrics = true, initialProjects, cachedFetch, updateCache }: PortfolioSectionProps) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [showMetrics, setShowMetrics] = useState(initialShowMetrics)
  const [togglingMetrics, setTogglingMetrics] = useState(false)

  // DB projects state
  const [dbProjects, setDbProjects] = useState<Project[]>(initialProjects ?? [])
  const [dbCategories, setDbCategories] = useState<string[]>(() => {
    if (initialProjects?.length) {
      return ['all', ...Array.from(new Set<string>(initialProjects.map((p) => p.category).filter(Boolean)))]
    }
    return ['all']
  })
  const [loadingProjects, setLoadingProjects] = useState(false)

  // Edit state
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  // Preview state
  const [previewProject, setPreviewProject] = useState<Project | null>(null)

  // Metrics draft (key-value pairs for editing)
  const [metricsDraft, setMetricsDraft] = useState<{ key: string; value: string }[]>([])

  // Bullets draft
  const [bulletsDraft, setBulletsDraft] = useState<string[]>([])

  // Tech tags
  const [techInput, setTechInput] = useState('')
  const [techTags, setTechTags] = useState<string[]>([])

  const addTechTag = (val: string) => {
    const trimmed = val.trim()
    if (trimmed && !techTags.includes(trimmed)) setTechTags((prev) => [...prev, trimmed])
    setTechInput('')
  }

  const removeTechTag = (tag: string) => setTechTags((prev) => prev.filter((t) => t !== tag))

  // Category searchable select
  const [categoryQuery, setCategoryQuery] = useState('')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const categoryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    setLoadingProjects(true)
    const load = cachedFetch
      ? cachedFetch('projects', '/api/admin/projects')
      : fetch('/api/admin/projects').then(r => r.json())
    load
      .then(({ projects }: { projects: Project[] }) => {
        setDbProjects(projects ?? [])
        const cats = ['all', ...Array.from(new Set<string>((projects ?? []).map((p: Project) => p.category).filter(Boolean)))]
        setDbCategories(cats)
      })
      .catch(() => {})
      .finally(() => setLoadingProjects(false))
  }, [isAdmin, cachedFetch])

  const activeProjects = dbProjects
  const activeCategories = dbCategories

  const filteredProjects =
    activeFilter === 'all' ? activeProjects : activeProjects.filter((p) => p.category === activeFilter)

  const toggleShowMetrics = async () => {
    setTogglingMetrics(true)
    const next = !showMetrics
    const res = await fetch('/api/admin/about', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showMetrics: next }),
    })
    if (res.ok) {
      setShowMetrics(next)
      toast.success(next ? 'Impact & Metrics are now visible' : 'Impact & Metrics are now hidden')
    } else {
      toast.error('Failed to update')
    }
    setTogglingMetrics(false)
  }

  const openNew = () => {
    setEditingProject({ ...EMPTY_PROJECT })
    setMetricsDraft([])
    setBulletsDraft([])
    setTechTags([])
    setTechInput('')
    setCategoryQuery('')
    setCategoryOpen(false)
    setPendingImageFile(null)
    setImagePreview('')
    setIsNew(true)
  }

  const openEdit = (project: Project) => {
    setEditingProject({ ...project })
    setMetricsDraft(project.metrics ? Object.entries(project.metrics).map(([key, value]) => ({ key, value })) : [])
    setBulletsDraft(project.bullets ?? [])
    setTechTags(project.tech ?? [])
    setTechInput('')
    setCategoryQuery('')
    setCategoryOpen(false)
    setPendingImageFile(null)
    setImagePreview(project.image ?? '')
    setIsNew(false)
  }

  const closeEdit = () => {
    setEditingProject(null)
    setIsNew(false)
    setCategoryOpen(false)
    setTechTags([])
    setTechInput('')
    setPendingImageFile(null)
    setImagePreview('')
    setBulletsDraft([])
  }

  const handleImageSelect = (file: File) => {
    setPendingImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const isValidUrl = (val: string) => { try { new URL(val); return true } catch { return false } }

  const saveProject = async () => {
    if (!editingProject) return

    const hasImage = pendingImageFile || editingProject.image
    if (!hasImage) { toast.error('Project image is required'); return }
    if (!editingProject.title.trim()) { toast.error('Title is required'); return }
    if (!editingProject.category.trim()) { toast.error('Category is required'); return }
    if (!editingProject.description.trim()) { toast.error('Description is required'); return }
    if (techTags.length === 0) { toast.error('At least one tech stack item is required'); return }
    if (!editingProject.liveUrl.trim()) { toast.error('Live URL is required'); return }
    if (!isValidUrl(editingProject.liveUrl)) { toast.error('Live URL must be a valid URL (e.g. https://example.com)'); return }
    if (editingProject.githubUrl && !isValidUrl(editingProject.githubUrl)) { toast.error('GitHub URL must be a valid URL'); return }

    setSaving(true)

    // Upload image to Cloudinary now
    let imageUrl = editingProject.image
    if (pendingImageFile) {
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: imagePreview, folder: 'portfolio/projects', public_id: `project-${Date.now()}` }),
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

    const metrics: Metrics = {}
    metricsDraft.forEach(({ key, value }) => { if (key.trim()) metrics[key.trim()] = value })

    const payload = { ...editingProject, image: imageUrl, tech: techTags, bullets: bulletsDraft.filter(b => b.trim()), metrics: Object.keys(metrics).length ? metrics : undefined }

    const res = await fetch('/api/admin/projects', {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const { project } = await res.json()
      let updated: Project[]
      if (isNew) {
        updated = [...dbProjects, project]
      } else {
        updated = dbProjects.map((p) => (p._id === project._id ? project : p))
      }
      setDbProjects(updated)
      updateCache?.('projects', { projects: updated })
      setDbCategories((prev) => {
        const all = prev.filter((c) => c !== 'all')
        if (project.category && !all.includes(project.category)) all.push(project.category)
        return ['all', ...all]
      })
      toast.success(isNew ? 'Project added' : 'Project updated')
      closeEdit()
    } else {
      toast.error('Failed to save project')
    }
    setSaving(false)
  }

  const deleteProject = async (project: Project) => {
    if (!project._id) return
    setDeleting(project._id)
    const res = await fetch('/api/admin/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: project._id }),
    })
    if (res.ok) {
      const updated = dbProjects.filter((p) => p._id !== project._id)
      setDbProjects(updated)
      updateCache?.('projects', { projects: updated })
      toast.success('Project deleted')
    } else {
      toast.error('Failed to delete project')
    }
    setDeleting(null)
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Projects</h2>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Impact & Metrics</span>
                  <button
                    onClick={toggleShowMetrics}
                    disabled={togglingMetrics}
                    title={showMetrics ? 'Hide from visitors' : 'Show to visitors'}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                      showMetrics ? 'bg-accent' : 'bg-border'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      showMetrics ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <button
                  onClick={openNew}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Project
                </button>
              </>
            )}
          </div>
        </div>
        <div className="w-10 h-1 bg-accent rounded-full mb-6" />
        {isAdmin && !showMetrics && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-muted/50 border border-dashed border-border w-fit">
            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground italic">Impact & Metrics are hidden from visitors</span>
          </div>
        )}
      </div>

      {/* Filter Buttons — only show when there are projects */}
      {activeProjects.length > 0 && (
        <div className="flex flex-wrap gap-2 md:gap-3">
          {activeCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium capitalize transition-all ${
                activeFilter === category
                  ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {loadingProjects ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : activeProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground text-sm">{isAdmin ? 'No projects yet. Click "Add Project" to get started.' : 'No projects to display yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {filteredProjects.map((project, index) => (
            <div key={(project as Project)._id ?? index} className="space-y-4">
              <div className="group relative bg-secondary rounded-xl md:rounded-2xl border border-border overflow-hidden hover:border-accent transition-all duration-300 hover:shadow-xl hover:shadow-accent/10">
                <div className="aspect-[4/3] overflow-hidden bg-background">
                  <img
                    src={project.image || '/placeholder.svg'}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {project.title}
                  </h3>
                  <div className="flex gap-2 md:gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => setPreviewProject(project as Project)}
                          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-secondary border border-border text-foreground rounded-lg text-xs md:text-sm font-medium hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          Preview
                        </button>
                        <button
                          onClick={() => openEdit(project as Project)}
                          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-accent text-accent-foreground rounded-lg text-xs md:text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProject(project as Project)}
                          disabled={deleting === (project as Project)._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 md:py-2 bg-destructive/10 text-destructive rounded-lg text-xs md:text-sm font-medium hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
                        >
                          {deleting === (project as Project)._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    ) : linkMode ? (
                      <>
                        <Link
                          href={`/projects/${(project as Project)._id}`}
                          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-accent text-accent-foreground rounded-lg text-xs md:text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          Details
                        </Link>
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-secondary border border-border text-foreground rounded-lg text-xs md:text-sm font-medium hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            Visit
                          </a>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setPreviewProject(project as Project)}
                          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-accent text-accent-foreground rounded-lg text-xs md:text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          Preview
                        </button>
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-secondary border border-border text-foreground rounded-lg text-xs md:text-sm font-medium hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          Visit
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4 px-2.5 md:px-3 py-1 md:py-1.5 bg-background/90 backdrop-blur-sm border border-border rounded-lg text-xs font-medium text-accent capitalize">
                  {project.category}
                </div>
              </div>

              {/* Project Metrics */}
              {project.metrics && (isAdmin || showMetrics) && <ProjectMetrics metrics={project.metrics} />}
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Dialog */}
      <Dialog open={!!editingProject} onOpenChange={(open) => { if (!open) closeEdit() }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? 'Add Project' : 'Edit Project'}</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-4 mt-2">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Project Image <span className="text-red-500">*</span></label>
                <div className="flex gap-4 items-start">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageSelect(f) }}
                    />
                    <Upload className="w-4 h-4" />
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </label>
                  {imagePreview && (
                    <div className="relative flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-24 h-20 rounded-xl object-cover border border-border" />
                      <button
                        type="button"
                        onClick={() => { setImagePreview(''); setPendingImageFile(null); setEditingProject((prev) => prev ? { ...prev, image: '' } : prev) }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center hover:opacity-90"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Title <span className="text-red-500">*</span></label>
                  <input
                    value={editingProject.title}
                    onChange={(e) => setEditingProject((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                    placeholder="Project title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Category <span className="text-red-500">*</span></label>
                  <div ref={categoryRef} className="relative">
                    <div
                      className="flex items-center justify-between px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm cursor-pointer hover:border-accent transition-colors"
                      onClick={() => { setCategoryOpen((o) => !o); setCategoryQuery('') }}
                    >
                      <span className={editingProject.category ? 'text-foreground capitalize' : 'text-muted-foreground'}>
                        {editingProject.category || 'Select or add category'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    {categoryOpen && (
                      <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                        <div className="p-2 border-b border-border">
                          <input
                            autoFocus
                            value={categoryQuery}
                            onChange={(e) => setCategoryQuery(e.target.value)}
                            placeholder="Search or type new category..."
                            className="w-full px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                          />
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          {(() => {
                            const existing = dbCategories.filter((c) => c !== 'all' && c.toLowerCase().includes(categoryQuery.toLowerCase()))
                            const isNew = categoryQuery.trim() && !dbCategories.some((c) => c.toLowerCase() === categoryQuery.trim().toLowerCase())
                            return (
                              <>
                                {existing.map((cat) => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => { setEditingProject((prev) => prev ? { ...prev, category: cat } : prev); setCategoryOpen(false) }}
                                    className={`w-full text-left px-3 py-2 text-sm capitalize hover:bg-accent/10 transition-colors ${
                                      editingProject.category === cat ? 'text-accent font-medium' : 'text-foreground'
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                ))}
                                {isNew && (
                                  <button
                                    type="button"
                                    onClick={() => { setEditingProject((prev) => prev ? { ...prev, category: categoryQuery.trim() } : prev); setCategoryOpen(false) }}
                                    className="w-full text-left px-3 py-2 text-sm text-accent hover:bg-accent/10 transition-colors flex items-center gap-2"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add "{categoryQuery.trim()}"
                                  </button>
                                )}
                                {existing.length === 0 && !isNew && (
                                  <p className="px-3 py-2 text-xs text-muted-foreground">No categories yet</p>
                                )}
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea
                  rows={2}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none resize-none"
                  placeholder="Short project description"
                />
              </div>

              {/* Bullet Points */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Bullet Points <span className="text-xs text-muted-foreground font-normal">(optional)</span></label>
                  <button
                    type="button"
                    onClick={() => setBulletsDraft((prev) => [...prev, ''])}
                    className="flex items-center gap-1 text-xs text-accent hover:opacity-80 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add bullet
                  </button>
                </div>
                {bulletsDraft.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No bullet points yet. Click "Add bullet" to add one.</p>
                ) : (
                  <div className="space-y-2">
                    {bulletsDraft.map((bullet, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-accent text-sm flex-shrink-0">•</span>
                        <input
                          value={bullet}
                          onChange={(e) => setBulletsDraft((prev) => prev.map((b, j) => j === i ? e.target.value : b))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); setBulletsDraft((prev) => [...prev.slice(0, i + 1), '', ...prev.slice(i + 1)]) }
                          }}
                          className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                          placeholder="e.g. Reduced load time by 60%"
                        />
                        <button
                          type="button"
                          onClick={() => setBulletsDraft((prev) => prev.filter((_, j) => j !== i))}
                          className="w-8 h-8 flex-shrink-0 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Tech Stack <span className="text-red-500">*</span> <span className="text-xs text-muted-foreground font-normal">(press Space or Enter to add)</span></label>
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-secondary border border-border rounded-xl min-h-[44px] focus-within:border-accent transition-colors">
                  {techTags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent rounded-lg text-xs font-medium">
                      {tag}
                      <button type="button" onClick={() => removeTechTag(tag)} className="hover:text-destructive transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault()
                        addTechTag(techInput)
                      } else if (e.key === 'Backspace' && !techInput && techTags.length > 0) {
                        setTechTags((prev) => prev.slice(0, -1))
                      }
                    }}
                    onBlur={() => { if (techInput.trim()) addTechTag(techInput) }}
                    className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    placeholder={techTags.length === 0 ? 'e.g. Next.js' : ''}
                  />
                </div>
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Live URL <span className="text-red-500">*</span></label>
                  <input
                    value={editingProject.liveUrl}
                    onChange={(e) => setEditingProject((prev) => prev ? { ...prev, liveUrl: e.target.value } : prev)}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">GitHub URL <span className="text-xs text-muted-foreground font-normal">(optional)</span></label>
                  <input
                    value={editingProject.githubUrl}
                    onChange={(e) => setEditingProject((prev) => prev ? { ...prev, githubUrl: e.target.value } : prev)}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              {/* Metrics */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Impact & Metrics</label>
                  <button
                    type="button"
                    onClick={() => setMetricsDraft((prev) => [...prev, { key: '', value: '' }])}
                    className="flex items-center gap-1 text-xs text-accent hover:opacity-80 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add metric
                  </button>
                </div>
                {metricsDraft.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No metrics yet. Click "Add metric" to add one.</p>
                )}
                <div className="space-y-2">
                  {metricsDraft.map((m, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={m.key}
                        onChange={(e) => setMetricsDraft((prev) => prev.map((x, j) => j === i ? { ...x, key: e.target.value } : x))}
                        className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                        placeholder="Label (e.g. users)"
                      />
                      <input
                        value={m.value}
                        onChange={(e) => setMetricsDraft((prev) => prev.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                        className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                        placeholder="Value (e.g. 25K+)"
                      />
                      <button
                        type="button"
                        onClick={() => setMetricsDraft((prev) => prev.filter((_, j) => j !== i))}
                        className="w-8 h-8 flex-shrink-0 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={saveProject}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isNew ? 'Add Project' : 'Save Changes'}
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

      {/* Preview Dialog */}
      <Dialog open={!!previewProject} onOpenChange={(open) => { if (!open) setPreviewProject(null) }}>
        <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle className="text-lg font-bold">{previewProject?.title}</DialogTitle>
          </DialogHeader>
          {previewProject && (
            <div className="overflow-y-auto scrollbar-themed flex-1">
              <div className="space-y-4 p-6">
                {previewProject.image && (
                  <div className="relative w-3/4 mx-auto">
                    <img src={previewProject.image} alt={previewProject.title} className="w-full aspect-[4/3] object-cover rounded-xl border border-border" />
                    {previewProject.category && (
                      <span className="absolute top-2 right-2 px-2.5 py-1 bg-black/60 text-white rounded-lg text-xs font-medium capitalize backdrop-blur-sm">
                        {previewProject.category}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {previewProject.tech?.map((t) => (
                    <span key={t} className="px-2.5 py-1 bg-secondary border border-border rounded-lg text-xs text-muted-foreground">{t}</span>
                  ))}
                </div>
                {previewProject.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{previewProject.description}</p>
                )}
                {previewProject.bullets && previewProject.bullets.length > 0 && (
                  <ul className="space-y-1.5">
                    {previewProject.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-accent mt-0.5 flex-shrink-0">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {previewProject.metrics && Object.keys(previewProject.metrics).length > 0 && (
                  <ProjectMetrics metrics={previewProject.metrics} />
                )}
                {(previewProject.liveUrl || previewProject.githubUrl) && (
                  <div className="flex gap-2 pt-1 border-t border-border">
                    {previewProject.liveUrl && (
                      <a href={previewProject.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                        <Eye className="w-4 h-4" />
                        Live Preview
                      </a>
                    )}
                    {previewProject.githubUrl && (
                      <a href={previewProject.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border text-foreground rounded-lg text-sm font-medium hover:border-accent transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        GitHub
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
