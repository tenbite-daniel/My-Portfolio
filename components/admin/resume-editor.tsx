'use client'

import { useEffect, useRef, useState } from 'react'
import { Briefcase, BookOpen, Plus, Trash2, ChevronDown, ChevronUp, Upload, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface TimelineItem { title: string; period: string; description: string }
interface Skill { name: string; level: number }

function SectionHeader({ icon, title, saving, onSave }: { icon: React.ReactNode; title: string; saving: boolean; onSave: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <button
        onClick={onSave}
        disabled={saving}
        className="px-4 py-1.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}

function parsePeriod(period: string) {
  const parts = period.split(/\s*[—–-]\s*/)
  const start = parts[0]?.trim() ?? ''
  const end = parts[1]?.trim() ?? ''
  const isPresent = end.toLowerCase() === 'present'
  // normalize "MMM YYYY" → "YYYY-MM" for month inputs
  const toMonthValue = (s: string) => {
    if (!s || /^\d{4}-\d{2}$/.test(s)) return s
    const d = new Date(`${s} 1`)
    if (isNaN(d.getTime())) return s
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  return { start: toMonthValue(start), end: isPresent ? '' : toMonthValue(end), isPresent }
}

function formatPeriod(start: string, end: string, isPresent: boolean) {
  if (!start) return ''
  const fmt = (ym: string) => {
    if (!ym) return ''
    const [y, m] = ym.split('-')
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  return `${fmt(start)} — ${isPresent ? 'Present' : fmt(end)}`
}

function TimelineEditor({ items, onChange }: { items: TimelineItem[]; onChange: (items: TimelineItem[]) => void }) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const update = (i: number, field: keyof TimelineItem, value: string) => {
    const next = items.map((item, idx) => idx === i ? { ...item, [field]: value } : item)
    onChange(next)
  }
  const updatePeriod = (i: number, start: string, end: string, isPresent: boolean) => {
    update(i, 'period', formatPeriod(start, end, isPresent))
  }
  const add = () => onChange([...items, { title: '', period: '', description: '' }])
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const { start, end, isPresent } = parsePeriod(item.period)
        return (
          <div key={i} className="bg-secondary rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Entry {i + 1}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded hover:bg-border disabled:opacity-30 transition-colors">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-1 rounded hover:bg-border disabled:opacity-30 transition-colors">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(i)} className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <input
              value={item.title}
              onChange={(e) => update(i, 'title', e.target.value)}
              placeholder="Title"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Start date</label>
                <input
                  type="month"
                  value={start}
                  max={currentMonth}
                  onChange={(e) => updatePeriod(i, e.target.value, end, isPresent)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">End date</label>
                <input
                  type="month"
                  value={end}
                  max={currentMonth}
                  onChange={(e) => updatePeriod(i, start, e.target.value, isPresent)}
                  disabled={isPresent}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none whitespace-nowrap mt-5">
                <input
                  type="checkbox"
                  checked={isPresent}
                  onChange={(e) => updatePeriod(i, start, end, e.target.checked)}
                  className="accent-accent"
                />
                Present
              </label>
            </div>
            <textarea
              value={item.description}
              onChange={(e) => update(i, 'description', e.target.value)}
              placeholder="Description"
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
            />
          </div>
        )
      })}
      <button
        onClick={add}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-accent rounded-lg transition-colors w-full justify-center"
      >
        <Plus className="w-4 h-4" />
        Add Entry
      </button>
    </div>
  )
}

function CvEditor({ cvUrl, onSaved, updateCache }: { cvUrl: string | null; onSaved: (url: string) => void; updateCache?: (key: string, partial: Record<string, unknown>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are allowed'); return }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: reader.result, folder: 'portfolio/resume', public_id: 'resume-cv', resource_type: 'raw' }),
      })
      const { url, error } = await res.json()
      if (url) {
        await fetch('/api/admin/resume', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cvUrl: url }),
        })
        updateCache?.('resume', { cvUrl: url })
        onSaved(url)
        toast.success('CV uploaded successfully')
      } else {
        toast.error(error ?? 'Upload failed')
      }
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">CV / Resume File</h3>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-1.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
      {cvUrl ? (
        <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border">
          <FileText className="w-4 h-4 text-accent flex-shrink-0" />
          <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline truncate flex-1">Current CV</a>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No CV uploaded yet. Upload a PDF to enable download and preview.</p>
      )}
    </div>
  )
}

function SkillsEditor({ items, onChange }: { items: Skill[]; onChange: (items: Skill[]) => void }) {
  const update = (i: number, field: keyof Skill, value: string | number) => {
    const next = items.map((item, idx) => idx === i ? { ...item, [field]: value } : item)
    onChange(next)
  }
  const add = () => onChange([...items, { name: '', level: 80 }])
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((skill, i) => (
          <div key={i} className="bg-secondary rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                value={skill.name}
                onChange={(e) => update(i, 'name', e.target.value)}
                placeholder="Skill name"
                className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              />
              <button onClick={() => remove(i)} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={100}
                value={skill.level}
                onChange={(e) => update(i, 'level', parseInt(e.target.value))}
                className="flex-1 accent-accent"
              />
              <span className="text-xs font-medium text-accent w-8 text-right">{skill.level}%</span>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-accent rounded-lg transition-colors w-full justify-center"
      >
        <Plus className="w-4 h-4" />
        Add Skill
      </button>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CacheProps = { cache?: React.MutableRefObject<Record<string, any>>; cachedFetch?: (key: string, url: string) => Promise<any>; updateCache?: (key: string, partial: Record<string, any>) => void }

export function AdminResumeEditor({ onCvUrlChange, cachedFetch, updateCache }: { onCvUrlChange?: (url: string) => void } & CacheProps) {
  const [experience, setExperience] = useState<TimelineItem[]>([])
  const [education, setEducation] = useState<TimelineItem[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<'experience' | 'education' | 'skills' | null>(null)

  useEffect(() => {
    const load = cachedFetch
      ? cachedFetch('resume', '/api/admin/resume')
      : fetch('/api/admin/resume').then(r => r.json())
    load
      .then(({ experience: e, education: ed, skills: s, cvUrl: url }: { experience: TimelineItem[]; education: TimelineItem[]; skills: Skill[]; cvUrl: string }) => {
        setExperience(e ?? [])
        setEducation(ed ?? [])
        setSkills(s ?? [])
        setCvUrl(url ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [cachedFetch])

  const save = async (section: 'experience' | 'education' | 'skills', data: unknown) => {
    setSaving(section)
    const res = await fetch('/api/admin/resume', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [section]: data }),
    })
    if (res.ok) {
      updateCache?.('resume', { [section]: data })
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} saved`)
    } else {
      toast.error('Failed to save')
    }
    setSaving(null)
  }

  if (loading) return <p className="text-muted-foreground text-sm">Loading resume data...</p>

  return (
    <div className="space-y-8">
      {/* CV Upload */}
      <CvEditor cvUrl={cvUrl} onSaved={(url) => { setCvUrl(url); onCvUrlChange?.(url) }} updateCache={updateCache} />

      {/* Experience */}
      <div className="bg-card border border-border rounded-xl p-5">
        <SectionHeader
          icon={<Briefcase className="w-5 h-5 text-accent" />}
          title="Experience"
          saving={saving === 'experience'}
          onSave={() => save('experience', experience)}
        />
        <TimelineEditor items={experience} onChange={setExperience} />
      </div>

      {/* Education */}
      <div className="bg-card border border-border rounded-xl p-5">
        <SectionHeader
          icon={<BookOpen className="w-5 h-5 text-accent" />}
          title="Education"
          saving={saving === 'education'}
          onSave={() => save('education', education)}
        />
        <TimelineEditor items={education} onChange={setEducation} />
      </div>

      {/* Skills */}
      <div className="bg-card border border-border rounded-xl p-5">
        <SectionHeader
          icon={<span className="text-accent text-base font-bold">%</span>}
          title="Skills"
          saving={saving === 'skills'}
          onSave={() => save('skills', skills)}
        />
        <SkillsEditor items={skills} onChange={setSkills} />
      </div>
    </div>
  )
}
