'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, User, Globe, Lock, Eye, EyeOff } from 'lucide-react'

interface ProfileForm {
  name: string
  title: string
  email: string
  phone: string
  birthday: string
  location: string
  avatar: string
  social: { github: string; linkedin: string; instagram: string; tiktok: string }
}

interface SiteForm {
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  ogImage: string
}

interface AccountForm {
  currentPassword: string
  newEmail: string
  newPassword: string
  confirmPassword: string
}

const SECTIONS = [
  { id: 'profile', label: 'Profile Info', icon: User },
  { id: 'site', label: 'Site Settings', icon: Globe },
  { id: 'account', label: 'Account', icon: Lock },
]

const inputClass = 'w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all'
const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5'

export function AdminSettings() {
  const [activeSection, setActiveSection] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState<ProfileForm>({
    name: '', title: '', email: '', phone: '', birthday: '', location: '', avatar: '',
    social: { github: '', linkedin: '', instagram: '', tiktok: '' },
  })

  const [site, setSite] = useState<SiteForm>({
    seoTitle: '', seoDescription: '', seoKeywords: '', ogImage: '',
  })

  const [account, setAccount] = useState<AccountForm>({
    currentPassword: '', newEmail: '', newPassword: '', confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then(({ profile: p, site: s }) => {
        if (p) setProfile({ name: p.name ?? '', title: p.title ?? '', email: p.email ?? '', phone: p.phone ?? '', birthday: p.birthday ?? '', location: p.location ?? '', avatar: p.avatar ?? '', social: { github: p.social?.github ?? '', linkedin: p.social?.linkedin ?? '', instagram: p.social?.instagram ?? '', tiktok: p.social?.tiktok ?? '' } })
        if (s) setSite({ seoTitle: s.seoTitle ?? '', seoDescription: s.seoDescription ?? '', seoKeywords: s.seoKeywords ?? '', ogImage: s.ogImage ?? '' })
      })
      .finally(() => setLoading(false))
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'profile', data: profile }),
    })
    res.ok ? toast.success('Profile saved') : toast.error('Failed to save profile')
    setSaving(false)
  }

  const saveSite = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'site', data: site }),
    })
    res.ok ? toast.success('Site settings saved') : toast.error('Failed to save site settings')
    setSaving(false)
  }

  const saveAccount = async () => {
    if (account.newPassword && account.newPassword !== account.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    setSaving(true)
    const res = await fetch('/api/admin/settings/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: account.currentPassword,
        newEmail: account.newEmail || undefined,
        newPassword: account.newPassword || undefined,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Account updated')
      setAccount({ currentPassword: '', newEmail: '', newPassword: '', confirmPassword: '' })
    } else {
      toast.error(data.error || 'Failed to update account')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Settings</h2>
        <div className="w-10 h-1 bg-accent rounded-full" />
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 border-b border-border">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeSection === id
                ? 'border-accent text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Info */}
      {activeSection === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input className={inputClass} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div>
              <label className={labelClass}>Title / Role</label>
              <input className={inputClass} value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} placeholder="Full-Stack Developer" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="john@example.com" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 (234) 567-890" />
            </div>
            <div>
              <label className={labelClass}>Birthday</label>
              <input className={inputClass} value={profile.birthday} onChange={(e) => setProfile({ ...profile, birthday: e.target.value })} placeholder="June 15, 1995" />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input className={inputClass} value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="San Francisco, CA" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Avatar URL</label>
              <input className={inputClass} value={profile.avatar} onChange={(e) => setProfile({ ...profile, avatar: e.target.value })} placeholder="/avatar.png or https://..." />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Social Links</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['github', 'linkedin', 'instagram', 'tiktok'] as const).map((key) => (
                <div key={key}>
                  <label className={labelClass}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                  <input className={inputClass} value={profile.social[key]} onChange={(e) => setProfile({ ...profile, social: { ...profile.social, [key]: e.target.value } })} placeholder={`https://${key}.com/...`} />
                </div>
              ))}
            </div>
          </div>

          <button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Profile
          </button>
        </div>
      )}

      {/* Site Settings */}
      {activeSection === 'site' && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>SEO Title</label>
            <input className={inputClass} value={site.seoTitle} onChange={(e) => setSite({ ...site, seoTitle: e.target.value })} placeholder="John Doe — Full-Stack Developer" />
          </div>
          <div>
            <label className={labelClass}>SEO Description</label>
            <textarea className={`${inputClass} resize-none`} rows={3} value={site.seoDescription} onChange={(e) => setSite({ ...site, seoDescription: e.target.value })} placeholder="A short description for search engines..." />
          </div>
          <div>
            <label className={labelClass}>SEO Keywords</label>
            <input className={inputClass} value={site.seoKeywords} onChange={(e) => setSite({ ...site, seoKeywords: e.target.value })} placeholder="developer, react, nextjs, portfolio" />
          </div>
          <div>
            <label className={labelClass}>OG Image URL</label>
            <input className={inputClass} value={site.ogImage} onChange={(e) => setSite({ ...site, ogImage: e.target.value })} placeholder="https://... or /og-image.png" />
          </div>

          <button onClick={saveSite} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Site Settings
          </button>
        </div>
      )}

      {/* Account */}
      {activeSection === 'account' && (
        <div className="space-y-4 max-w-md">
          <div>
            <label className={labelClass}>New Email <span className="text-muted-foreground">(leave blank to keep current)</span></label>
            <input className={inputClass} type="email" value={account.newEmail} onChange={(e) => setAccount({ ...account, newEmail: e.target.value })} placeholder="new@example.com" />
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-3">Change Password</p>
            {(['current', 'new', 'confirm'] as const).map((key) => {
              const labels = { current: 'Current Password', new: 'New Password', confirm: 'Confirm New Password' }
              const fields = { current: 'currentPassword', new: 'newPassword', confirm: 'confirmPassword' } as const
              return (
                <div key={key} className="mb-3">
                  <label className={labelClass}>{labels[key]}</label>
                  <div className="relative">
                    <input
                      type={showPasswords[key] ? 'text' : 'password'}
                      className={`${inputClass} pr-10`}
                      value={account[fields[key]]}
                      onChange={(e) => setAccount({ ...account, [fields[key]]: e.target.value })}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, [key]: !p[key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPasswords[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <button onClick={saveAccount} disabled={saving || !account.currentPassword} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Account
          </button>
        </div>
      )}
    </div>
  )
}
