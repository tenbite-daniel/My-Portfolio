'use client'

import { useEffect, useState } from 'react'
import { Github, ChevronLeft, ChevronRight } from 'lucide-react'

function usePageSize() {
  const [pageSize, setPageSize] = useState(30)
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setPageSize(w < 640 ? 10 : w < 1024 ? 20 : 30)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return pageSize
}

interface Repo {
  name: string
  language: string | null
  stargazers_count: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CacheProps = { cache: React.MutableRefObject<Record<string, any>>; cachedFetch: (key: string, url: string) => Promise<any>; updateCache: (key: string, partial: Record<string, any>) => void }

export function AdminGitHubRepos({ cachedFetch, updateCache }: CacheProps) {
  const [repos, setRepos] = useState<Repo[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const [page, setPage] = useState(0)
  const pageSize = usePageSize()

  useEffect(() => { setPage(0) }, [pageSize])

  useEffect(() => {
    cachedFetch('github-repos', '/api/admin/github')
      .then(({ repos: r, selected: s }: { repos: Repo[]; selected: string[] }) => {
        setRepos(r ?? [])
        const initial = new Set<string>(s ?? [])
        setSelected(initial)
        setSavedSet(initial)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [cachedFetch])

  const totalPages = Math.ceil(repos.length / pageSize)
  const startIdx = page * pageSize
  const endIdx = Math.min(startIdx + pageSize, repos.length)
  const paginated = repos.slice(startIdx, endIdx)

  const pageButtons = (() => {
    const start = Math.max(0, Math.min(page - 1, totalPages - 3))
    const end = Math.min(totalPages, start + 3)
    return Array.from({ length: end - start }, (_, i) => start + i)
  })()

  const isDirty = [...selected].some((n) => !savedSet.has(n)) || [...savedSet].some((n) => !selected.has(n))

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/admin/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected: Array.from(selected) }),
    })
    setSaving(false)
    setSavedSet(new Set(selected))
    updateCache('github-repos', { selected: Array.from(selected) })
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  // saved & selected = green (border-accent)
  // selected but not saved = amber (unsaved)
  // neither = default
  const getLabelClass = (name: string) => {
    if (selected.has(name) && savedSet.has(name))
      return 'border-accent bg-accent/5'
    if (selected.has(name) && !savedSet.has(name))
      return 'border-amber-500 bg-amber-500/5'
    return 'border-border bg-secondary hover:border-accent/50'
  }

  if (loading) return <p className="text-muted-foreground text-sm">Loading repositories...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Github className="w-5 h-5 text-accent" />
            Featured Repositories
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select repos to display on the public GitHub tab. {selected.size} selected.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Unsaved changes
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {isDirty && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-accent bg-accent/5 inline-block" />
            Saved
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-amber-500 bg-amber-500/5 inline-block" />
            Selected, not saved
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {paginated.map((repo) => (
          <label
            key={repo.name}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${getLabelClass(repo.name)}`}
          >
            <input
              type="checkbox"
              checked={selected.has(repo.name)}
              onChange={() => toggle(repo.name)}
              className="accent-accent w-4 h-4 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{repo.name}</p>
              <p className="text-xs text-muted-foreground">
                {repo.language ?? 'Unknown'} · ★ {repo.stargazers_count}
              </p>
            </div>
          </label>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {startIdx + 1}–{endIdx} of {repos.length} repos
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageButtons.map((i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                  page === i
                    ? 'bg-accent text-accent-foreground'
                    : 'border border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages - 1}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
