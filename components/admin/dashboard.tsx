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
  createdAt: string
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [pending, setPending] = useState<Testimony[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingPending, setLoadingPending] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats')
    const data = await res.json()
    setStats(data)
    setLoadingStats(false)
  }, [])

  const fetchPending = useCallback(async () => {
    const res = await fetch('/api/admin/testimonials?status=pending')
    const data = await res.json()
    setPending(data.testimonials ?? [])
    setLoadingPending(false)
  }, [])

  useEffect(() => {
    fetchStats()
    fetchPending()
  }, [fetchStats, fetchPending])

  const handleApprove = async (id: string) => {
    setActionId(id)
    const res = await fetch('/api/admin/testimonials', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved: true }),
    })
    if (res.ok) {
      toast.success('Testimony approved')
      setPending((prev) => prev.filter((t) => t._id !== id))
      fetchStats()
    } else {
      toast.error('Failed to approve')
    }
    setActionId(null)
  }

  const handleReject = async (id: string) => {
    setActionId(id)
    const res = await fetch('/api/admin/testimonials', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved: false }),
    })
    if (res.ok) {
      toast.success('Testimony rejected')
      setPending((prev) => prev.filter((t) => t._id !== id))
      fetchStats()
    } else {
      toast.error('Failed to reject')
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
      setPending((prev) => prev.filter((t) => t._id !== id))
      fetchStats()
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
          <h3 className="text-lg font-semibold text-foreground">Pending Testimonials</h3>
          {!loadingPending && pending.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/10 text-yellow-500 rounded-full">
              {pending.length}
            </span>
          )}
        </div>

        {loadingPending ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-secondary border border-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="bg-secondary border border-border rounded-2xl p-8 text-center">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No pending testimonials</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((t) => (
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
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.email}</p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{t.text}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(t._id)}
                    disabled={actionId === t._id}
                    className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
                    title="Approve"
                  >
                    {actionId === t._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleReject(t._id)}
                    disabled={actionId === t._id}
                    className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t._id)}
                    disabled={actionId === t._id}
                    className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
