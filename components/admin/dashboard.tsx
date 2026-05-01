'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  MessageSquare, FolderOpen, BookOpen, Clock,
  CheckCircle, Check, X, Trash2, Loader2,
} from 'lucide-react'

interface Stats {
  pendingTestimonials: number
  approvedTestimonials: number
  totalProjects: number
  totalBlogs: number
}

interface Testimony {
  _id: string
  name: string
  email: string
  text: string
  avatar?: string
  status?: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

const STATUS_STYLES = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  approved: 'bg-green-500/10 text-green-500',
  rejected: 'bg-destructive/10 text-destructive',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CacheProps = { cache: React.MutableRefObject<Record<string, any>>; cachedFetch: (key: string, url: string) => Promise<any>; updateCache: (key: string, partial: Record<string, any>) => void }

export function AdminDashboard({ cachedFetch, updateCache }: CacheProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [testimonials, setTestimonials] = useState<Testimony[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingList, setLoadingList] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    const data = await cachedFetch('stats', '/api/admin/stats')
    setStats(data)
    setLoadingStats(false)
  }, [cachedFetch])

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const fetchTestimonials = useCallback(async () => {
    const data = await cachedFetch('all-testimonials', '/api/admin/testimonials')
    setTestimonials(data.testimonials ?? [])
    setLoadingList(false)
  }, [cachedFetch])

  useEffect(() => {
    fetchStats()
    fetchTestimonials()
  }, [fetchStats, fetchTestimonials])

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    setActionId(id)
    const res = await fetch('/api/admin/testimonials', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      toast.success(`Testimony ${status}`)
      const updated = testimonials.map((t) => t._id === id ? { ...t, status } : t)
      setTestimonials(updated)
      updateCache('all-testimonials', { testimonials: updated })
      // refetch stats fresh
      const statsData = await fetch('/api/admin/stats').then(r => r.json())
      setStats(statsData)
      updateCache('stats', statsData)
    } else {
      toast.error('Action failed')
    }
    setActionId(null)
  }

  const handleDelete = async (id: string) => {
    setActionId(id)
    const res = await fetch('/api/admin/testimonials', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      toast.success('Testimony deleted')
      const updated = testimonials.filter((t) => t._id !== id)
      setTestimonials(updated)
      updateCache('all-testimonials', { testimonials: updated })
      const statsData = await fetch('/api/admin/stats').then(r => r.json())
      setStats(statsData)
      updateCache('stats', statsData)
    } else {
      toast.error('Failed to delete')
    }
    setActionId(null)
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name[0].toUpperCase()
  }

  const statCards = [
    { label: 'Pending Testimonials', value: stats?.pendingTestimonials ?? 0, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Approved Testimonials', value: stats?.approvedTestimonials ?? 0, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Total Projects', value: stats?.totalProjects ?? 0, icon: FolderOpen, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Blog Posts', value: stats?.totalBlogs ?? 0, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ]

  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  const pendingCount = testimonials.filter((t) => !t.status || t.status === 'pending').length
  const filtered = filter === 'all' ? testimonials : testimonials.filter((t) => (t.status ?? 'pending') === filter)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Dashboard</h2>
        <div className="w-10 h-1 bg-accent rounded-full mb-6" />
      </div>

      {/* Stats */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Overview</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-secondary border border-border rounded-2xl p-5 space-y-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                {loadingStats ? (
                  <div className="h-7 w-12 bg-border rounded animate-pulse mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                )}
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Testimonials */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">Testimonials</h3>
          {!loadingList && pendingCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/10 text-yellow-500 rounded-full">
              {pendingCount} pending
            </span>
          )}
          <div className="ml-auto">
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value as typeof filter); setPage(1) }}
              className="text-xs px-3 py-1.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loadingList ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-secondary border border-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-secondary border border-border rounded-2xl p-8 text-center">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No {filter === 'all' ? '' : filter} testimonials</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paginated.map((t) => (
              <div key={t._id} className="bg-secondary border border-border rounded-2xl p-5 flex gap-4">
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-medium">{getInitials(t.name)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${STATUS_STYLES[t.status ?? 'pending']}`}>
                        {t.status ?? 'pending'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.email}</p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{t.text}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleStatus(t._id, 'approved')}
                    disabled={actionId === t._id || t.status === 'approved'}
                    className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
                    title="Approve"
                  >
                    {actionId === t._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleStatus(t._id, 'rejected')}
                    disabled={actionId === t._id || t.status === 'rejected'}
                    className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t._id)}
                    disabled={actionId === t._id}
                    className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground hover:border-accent disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground hover:border-accent disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
