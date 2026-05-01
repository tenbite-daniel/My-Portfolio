'use client'

import { ChevronDown, EyeOff, Plus, Trash2, Pencil, X, Loader2, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface CaseStudyProps {
  _id?: string
  title: string
  project: string
  overview: string
  challenge: string
  approach: string
  solution: string
  results: string[]
}

interface KeyOutcome {
  value: string
  label: string
}

const DEFAULT_OUTCOMES: KeyOutcome[] = [
  { value: '$2M+', label: 'Revenue generated through platform optimization' },
  { value: '99.9%', label: 'System uptime across critical applications' },
  { value: '140K+', label: 'Active users across all applications' },
]

const EMPTY_STUDY: Omit<CaseStudyProps, '_id'> = {
  title: '', project: '', overview: '', challenge: '', approach: '', solution: '', results: [''],
}

function StudyForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: Omit<CaseStudyProps, '_id'>
  onSubmit: (data: Omit<CaseStudyProps, '_id'>) => Promise<void>
  onCancel: () => void
  submitLabel: string
}) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  const set = (field: keyof typeof EMPTY_STUDY, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))
  const setResult = (i: number, value: string) =>
    setForm(prev => { const r = [...prev.results]; r[i] = value; return { ...prev, results: r } })
  const addResult = () => setForm(prev => ({ ...prev, results: [...prev.results, ''] }))
  const removeResult = (i: number) =>
    setForm(prev => ({ ...prev, results: prev.results.filter((_, idx) => idx !== i) }))

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    await onSubmit({ ...form, results: form.results.filter(r => r.trim()) })
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
          <input
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Scaling E-Commerce to $2M Revenue"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Project</label>
          <input
            value={form.project}
            onChange={e => set('project', e.target.value)}
            placeholder="e.g. E-Commerce Platform"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {(['overview', 'challenge', 'approach', 'solution'] as const).map(field => (
        <div key={field}>
          <label className="text-xs text-muted-foreground capitalize mb-1 block">{field}</label>
          <textarea
            value={form[field]}
            onChange={e => set(field, e.target.value)}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
          />
        </div>
      ))}

      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Results</label>
        <div className="space-y-2">
          {form.results.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={r}
                onChange={e => setResult(i, e.target.value)}
                placeholder={`Result ${i + 1}`}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              />
              <button
                onClick={() => removeResult(i)}
                disabled={form.results.length <= 1}
                className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={addResult}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-accent rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Result
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </div>
  )
}

function AddCaseStudyDialog({ onAdded }: { onAdded: (study: CaseStudyProps) => void }) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (data: Omit<CaseStudyProps, '_id'>) => {
    const res = await fetch('/api/admin/case-studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const { study } = await res.json()
      toast.success('Case study added')
      onAdded(study)
      setOpen(false)
    } else {
      toast.error('Failed to add')
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Case Study
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="text-lg font-semibold text-foreground">Add Case Study</h3>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-5">
          <StudyForm
            initial={{ ...EMPTY_STUDY }}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            submitLabel="Add Case Study"
          />
        </div>
      </div>
    </div>
  )
}

function CaseStudyCard({
  study,
  isAdmin,
  onDelete,
  onUpdate,
}: {
  study: CaseStudyProps
  isAdmin?: boolean
  onDelete?: (id: string) => void
  onUpdate?: (updated: CaseStudyProps) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!study._id) return
    setDeleting(true)
    const res = await fetch('/api/admin/case-studies', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: study._id }),
    })
    if (res.ok) {
      toast.success('Case study deleted')
      onDelete?.(study._id)
    } else {
      toast.error('Failed to delete')
      setDeleting(false)
    }
  }

  const handleUpdate = async (data: Omit<CaseStudyProps, '_id'>) => {
    const res = await fetch('/api/admin/case-studies', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: study._id, ...data }),
    })
    if (res.ok) {
      const { study: updated } = await res.json()
      toast.success('Case study saved')
      onUpdate?.(updated)
      setEditing(false)
    } else {
      toast.error('Failed to save')
    }
  }

  return (
    <div className="bg-secondary border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !editing && setIsExpanded(e => !e)}
        onKeyDown={e => e.key === 'Enter' && !editing && setIsExpanded(ex => !ex)}
        className={`w-full p-4 md:p-6 flex items-start justify-between gap-4 transition-colors ${!editing ? 'hover:bg-secondary/80 cursor-pointer' : 'cursor-default'}`}
      >
        <div className="text-left flex-1">
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">{study.title}</h3>
          <p className="text-sm text-accent font-medium mb-2">{study.project}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{study.overview}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {isAdmin && study._id && (
            <>
              <button
                onClick={() => { setEditing(true); setIsExpanded(true) }}
                className="w-8 h-8 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
                title="Delete"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </>
          )}
          {!editing && (
            <div className={`w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-5 h-5 text-accent" />
            </div>
          )}
        </div>
      </div>

      {/* Expanded content or edit form */}
      {isExpanded && (
        <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-border">
          {editing ? (
            <div className="pt-4">
              <StudyForm
                initial={{ title: study.title, project: study.project, overview: study.overview, challenge: study.challenge, approach: study.approach, solution: study.solution, results: study.results.length ? study.results : [''] }}
                onSubmit={handleUpdate}
                onCancel={() => setEditing(false)}
                submitLabel="Save Changes"
              />
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">Challenge</h4>
                <p className="text-sm md:text-base text-muted-foreground">{study.challenge}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">My Approach</h4>
                <p className="text-sm md:text-base text-muted-foreground">{study.approach}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">Solution</h4>
                <p className="text-sm md:text-base text-muted-foreground">{study.solution}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">Results & Impact</h4>
                <ul className="space-y-2">
                  {study.results.map((result, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm md:text-base">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">✓</span>
                      <span className="text-foreground">{result}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function KeyOutcomesCard({ isAdmin, outcomes, onSave, showKeyOutcomes, onToggleKeyOutcomes, togglingKeyOutcomes }: { isAdmin?: boolean; outcomes: KeyOutcome[]; onSave?: (outcomes: KeyOutcome[]) => void; showKeyOutcomes?: boolean; onToggleKeyOutcomes?: () => void; togglingKeyOutcomes?: boolean }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<KeyOutcome[]>(outcomes)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setDraft(outcomes) }, [outcomes])

  const setField = (i: number, field: keyof KeyOutcome, value: string) =>
    setDraft(prev => prev.map((o, idx) => idx === i ? { ...o, [field]: value } : o))

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/about', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyOutcomes: draft }),
    })
    if (res.ok) {
      toast.success('Key outcomes saved')
      onSave?.(draft)
      setEditing(false)
    } else {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  return (
    <div className="bg-gradient-to-br from-accent/10 via-secondary to-background rounded-lg border border-accent/20 p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-bold text-foreground">Key Outcomes Across Projects</h3>
        <div className="flex items-center gap-2">
          {isAdmin && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          )}
          {isAdmin && (
            <>
              <span className="text-xs text-muted-foreground">Show</span>
              <button
                onClick={onToggleKeyOutcomes}
                disabled={togglingKeyOutcomes}
                title={showKeyOutcomes ? 'Hide from visitors' : 'Show to visitors'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${showKeyOutcomes ? 'bg-accent' : 'bg-border'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showKeyOutcomes ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </>
          )}
        </div>
      </div>
      {isAdmin && !showKeyOutcomes && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-muted/50 border border-dashed border-border w-fit">
          <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground italic">Key Outcomes is hidden from visitors</span>
        </div>
      )}

      {editing ? (
        <div className="space-y-3">
          {draft.map((o, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                value={o.value}
                onChange={e => setField(i, 'value', e.target.value)}
                placeholder="Value (e.g. $2M+)"
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              />
              <input
                value={o.label}
                onChange={e => setField(i, 'label', e.target.value)}
                placeholder="Description"
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              />
            </div>
          ))}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => { setDraft(outcomes); setEditing(false) }}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 bg-accent text-accent-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {outcomes.map((o, i) => (
            <div key={i}>
              <p className="text-2xl md:text-3xl font-bold text-accent mb-2">{o.value}</p>
              <p className="text-sm text-muted-foreground">{o.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface CaseStudiesSectionProps {
  isAdmin?: boolean
  initialShowCaseStudies?: boolean
  initialShowKeyOutcomes?: boolean
  initialStudies?: CaseStudyProps[]
}

export function CaseStudiesSection({ isAdmin = false, initialShowCaseStudies = true, initialShowKeyOutcomes = true, initialStudies = [] }: CaseStudiesSectionProps) {
  const [showCaseStudies, setShowCaseStudies] = useState(initialShowCaseStudies)
  const [toggling, setToggling] = useState(false)
  const [showKeyOutcomes, setShowKeyOutcomes] = useState(initialShowKeyOutcomes)
  const [togglingKeyOutcomes, setTogglingKeyOutcomes] = useState(false)
  const [dbStudies, setDbStudies] = useState<CaseStudyProps[]>(initialStudies)
  const [loadingStudies, setLoadingStudies] = useState(isAdmin)
  const [keyOutcomes, setKeyOutcomes] = useState<KeyOutcome[]>(DEFAULT_OUTCOMES)

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/case-studies')
        .then(r => r.json())
        .then(({ studies }) => { if (studies) setDbStudies(studies) })
        .catch(() => {})
        .finally(() => setLoadingStudies(false))
    }

    fetch('/api/admin/about')
      .then(r => r.json())
      .then(({ about }) => {
        if (about?.keyOutcomes?.length) setKeyOutcomes(about.keyOutcomes)
        if (typeof about?.showKeyOutcomes === 'boolean') setShowKeyOutcomes(about.showKeyOutcomes)
      })
      .catch(() => {})
  }, [])

  const toggleVisibility = async () => {
    setToggling(true)
    const next = !showCaseStudies
    const res = await fetch('/api/admin/about', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showCaseStudies: next }),
    })
    if (res.ok) {
      setShowCaseStudies(next)
      toast.success(next ? 'Case Studies tab is now visible' : 'Case Studies tab is now hidden')
    } else {
      toast.error('Failed to update')
    }
    setToggling(false)
  }

  const toggleKeyOutcomes = async () => {
    setTogglingKeyOutcomes(true)
    const next = !showKeyOutcomes
    const res = await fetch('/api/admin/about', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showKeyOutcomes: next }),
    })
    if (res.ok) {
      setShowKeyOutcomes(next)
      toast.success(next ? 'Key Outcomes is now visible' : 'Key Outcomes is now hidden')
    } else {
      toast.error('Failed to update')
    }
    setTogglingKeyOutcomes(false)
  }

  const studies = dbStudies

  return (
    <section className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Case Studies</h2>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <AddCaseStudyDialog onAdded={s => setDbStudies(prev => [...prev, s])} />
              <span className="text-xs text-muted-foreground">Show Tab</span>
              <button
                onClick={toggleVisibility}
                disabled={toggling}
                title={showCaseStudies ? 'Hide from visitors' : 'Show to visitors'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${showCaseStudies ? 'bg-accent' : 'bg-border'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showCaseStudies ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          Detailed breakdowns of challenging problems I&apos;ve solved, my approach, and the measurable impact delivered.
          Click to expand any case study to see the full story.
        </p>
        {isAdmin && !showCaseStudies && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-muted/50 border border-dashed border-border w-fit">
            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground italic">Case Studies tab is hidden from visitors</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {loadingStudies ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-24 bg-secondary border border-border rounded-lg animate-pulse" />)}
          </div>
        ) : studies.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{isAdmin ? 'No case studies yet. Click “Add Case Study” to get started.' : 'No case studies available yet.'}</p>
        ) : (
          studies.map(study => (
            <CaseStudyCard
              key={study._id ?? study.title}
              study={study}
              isAdmin={isAdmin}
              onDelete={id => setDbStudies(prev => prev.filter(s => s._id !== id))}
              onUpdate={updated => setDbStudies(prev => prev.map(s => s._id === updated._id ? updated : s))}
            />
          ))
        )}
      </div>

      {(isAdmin || showKeyOutcomes) && <KeyOutcomesCard isAdmin={isAdmin} outcomes={keyOutcomes} onSave={setKeyOutcomes} showKeyOutcomes={showKeyOutcomes} onToggleKeyOutcomes={toggleKeyOutcomes} togglingKeyOutcomes={togglingKeyOutcomes} />}
    </section>
  )
}
