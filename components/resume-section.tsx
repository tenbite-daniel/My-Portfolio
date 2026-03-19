'use client'

import { BookOpen, Briefcase, Pencil, Plus, Trash2, Loader2, X, Check, ChevronUp, ChevronDown, Calendar } from 'lucide-react'
import { resumeData } from '@/lib/portfolio-data'
import { SkillCircle } from './skill-circle'
import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'

type TimelineItem = { title: string; period: string; description: string }
type Skill = { name: string; level: number }

interface ResumeSectionProps {
  data?: typeof resumeData
  isAdmin?: boolean
}

// Parse "MMM YYYY — MMM YYYY" or "MMM YYYY — Present" into { from, toPresent, to }
function parsePeriod(period: string): { from: string; to: string; toPresent: boolean } {
  const parts = period.split(/\s*[—–-]\s*/)
  const parseMonth = (s: string) => {
    const d = new Date(`${s.trim()} 1`)
    if (isNaN(d.getTime())) return ''
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  const from = parts[0] ? parseMonth(parts[0]) : ''
  const toRaw = parts[1]?.trim() ?? ''
  const toPresent = toRaw.toLowerCase() === 'present'
  const to = toPresent ? '' : (toRaw ? parseMonth(toRaw) : '')
  return { from, to, toPresent }
}

function formatPeriod(from: string, to: string, toPresent: boolean): string {
  const fmt = (ym: string) => {
    if (!ym) return ''
    const [y, m] = ym.split('-')
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  const start = fmt(from) || ''
  const end = toPresent ? 'Present' : (fmt(to) || '')
  return end ? `${start} — ${end}` : start
}

function PeriodPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parsed = parsePeriod(value)
  const [from, setFrom] = useState(parsed.from)
  const [to, setTo] = useState(parsed.to)
  const [toPresent, setToPresent] = useState(parsed.toPresent)

  const emit = (f: string, t: string, p: boolean) => onChange(formatPeriod(f, t, p))

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> Period</p>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">From</label>
          <input
            type="month"
            value={from}
            onChange={(e) => { setFrom(e.target.value); emit(e.target.value, to, toPresent) }}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">To</label>
          {toPresent ? (
            <div className="w-full px-3 py-2 bg-accent/10 border border-accent/30 rounded-lg text-sm text-accent font-medium">Present</div>
          ) : (
            <input
              type="month"
              value={to}
              onChange={(e) => { setTo(e.target.value); emit(from, e.target.value, false) }}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent"
            />
          )}
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={toPresent}
          onChange={(e) => { setToPresent(e.target.checked); emit(from, to, e.target.checked) }}
          className="accent-accent w-4 h-4"
        />
        <span className="text-xs text-muted-foreground">Currently ongoing (Present)</span>
      </label>
    </div>
  )
}

function TimelineEditor({ items, onChange }: { items: TimelineItem[]; onChange: (items: TimelineItem[]) => void }) {
  const update = (i: number, field: keyof TimelineItem, value: string) =>
    onChange(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
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
      {items.map((item, i) => (
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
          <PeriodPicker
            key={item.period}
            value={item.period}
            onChange={(v) => update(i, 'period', v)}
          />
          <textarea
            value={item.description}
            onChange={(e) => update(i, 'description', e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
          />
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-border rounded-xl text-muted-foreground hover:border-accent hover:text-accent transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Entry
      </button>
    </div>
  )
}

function SkillsEditor({ items, onChange }: { items: Skill[]; onChange: (items: Skill[]) => void }) {
  const update = (i: number, field: keyof Skill, value: string | number) =>
    onChange(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
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
        className="flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-border rounded-xl text-muted-foreground hover:border-accent hover:text-accent transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Skill
      </button>
    </div>
  )
}

export function ResumeSection({ data = resumeData, isAdmin = false }: ResumeSectionProps) {
  const [inView, setInView] = useState(false)
  const skillsRef = useRef<HTMLDivElement>(null)

  const [experience, setExperience] = useState<TimelineItem[]>(data.experience)
  const [education, setEducation] = useState<TimelineItem[]>(data.education)
  const [skills, setSkills] = useState<Skill[]>(data.skills)

  const [editingExp, setEditingExp] = useState(false)
  const [editingEdu, setEditingEdu] = useState(false)
  const [editingSkills, setEditingSkills] = useState(false)

  const [expDraft, setExpDraft] = useState<TimelineItem[]>([])
  const [eduDraft, setEduDraft] = useState<TimelineItem[]>([])
  const [skillsDraft, setSkillsDraft] = useState<Skill[]>([])

  const [saving, setSaving] = useState<'experience' | 'education' | 'skills' | null>(null)

  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/admin/resume')
      .then((r) => r.json())
      .then(({ experience: e, education: ed, skills: s }) => {
        if (e) setExperience(e)
        if (ed) setEducation(ed)
        if (s) setSkills(s)
      })
      .catch(() => {})
  }, [isAdmin])

  useEffect(() => {
    setExperience(data.experience)
    setEducation(data.education)
    setSkills(data.skills)
  }, [data])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.unobserve(entry.target) } },
      { threshold: 0.1 }
    )
    if (skillsRef.current) observer.observe(skillsRef.current)
    return () => observer.disconnect()
  }, [])

  const save = async (section: 'experience' | 'education' | 'skills', draft: unknown) => {
    setSaving(section)
    const res = await fetch('/api/admin/resume', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [section]: draft }),
    })
    if (res.ok) {
      if (section === 'experience') { setExperience(draft as TimelineItem[]); setEditingExp(false) }
      if (section === 'education') { setEducation(draft as TimelineItem[]); setEditingEdu(false) }
      if (section === 'skills') { setSkills(draft as Skill[]); setEditingSkills(false) }
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} saved`)
    } else {
      toast.error('Failed to save')
    }
    setSaving(null)
  }

  const editBtn = (onClick: () => void) => isAdmin && (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary border border-border hover:border-accent hover:text-accent transition-colors"
    >
      <Pencil className="w-3.5 h-3.5" />
      Edit
    </button>
  )

  const actionBtns = (onSave: () => void, onCancel: () => void, section: 'experience' | 'education' | 'skills') => (
    <div className="flex gap-2 mt-4">
      <button onClick={onSave} disabled={saving === section} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
        {saving === section ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Save
      </button>
      <button onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 bg-secondary border border-border rounded-xl text-sm font-medium hover:border-accent transition-colors">
        <X className="w-4 h-4" />
        Cancel
      </button>
    </div>
  )

  return (
    <div className="space-y-8 md:space-y-10">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Resume</h2>
        <div className="w-10 h-1 bg-accent rounded-full mb-6" />
      </div>

      {/* Experience */}
      <div>
        <div className="flex items-center justify-between gap-2 md:gap-3 mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-accent" />
            <h3 className="text-xl md:text-2xl font-bold text-foreground">Experience</h3>
          </div>
          {!editingExp && editBtn(() => { setExpDraft(experience); setEditingExp(true) })}
        </div>
        {editingExp ? (
          <>
            <TimelineEditor items={expDraft} onChange={setExpDraft} />
            {actionBtns(() => save('experience', expDraft), () => setEditingExp(false), 'experience')}
          </>
        ) : (
          <div className="space-y-4">
            {experience.map((item, index) => (
              <div key={index} className="relative pl-5 md:pl-6 pb-6 border-l-2 border-border last:pb-0">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent" />
                <h4 className="text-base md:text-lg font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-xs md:text-sm text-accent mb-2">{item.period}</p>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Education */}
      <div>
        <div className="flex items-center justify-between gap-2 md:gap-3 mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-accent" />
            <h3 className="text-xl md:text-2xl font-bold text-foreground">Education</h3>
          </div>
          {!editingEdu && editBtn(() => { setEduDraft(education); setEditingEdu(true) })}
        </div>
        {editingEdu ? (
          <>
            <TimelineEditor items={eduDraft} onChange={setEduDraft} />
            {actionBtns(() => save('education', eduDraft), () => setEditingEdu(false), 'education')}
          </>
        ) : (
          <div className="space-y-4">
            {education.map((item, index) => (
              <div key={index} className="relative pl-5 md:pl-6 pb-6 border-l-2 border-border last:pb-0">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent" />
                <h4 className="text-base md:text-lg font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-xs md:text-sm text-accent mb-2">{item.period}</p>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills */}
      <div ref={skillsRef}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-foreground">My Skills</h3>
          {!editingSkills && editBtn(() => { setSkillsDraft(skills); setEditingSkills(true) })}
        </div>
        {editingSkills ? (
          <>
            <SkillsEditor items={skillsDraft} onChange={setSkillsDraft} />
            {actionBtns(() => save('skills', skillsDraft), () => setEditingSkills(false), 'skills')}
          </>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8">
            {skills.map((skill, index) => (
              <SkillCircle key={index} name={skill.name} level={skill.level} inView={inView} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
