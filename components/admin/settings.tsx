'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, User, Globe, Lock, Eye, EyeOff, Camera, CheckCircle2 } from 'lucide-react'

interface ProfileForm {
  name: string
  title: string
  email: string
  phone: string
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
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState<ProfileForm>({
    name: '', title: '', email: '', phone: '', location: '', avatar: '',
    social: { github: '', linkedin: '', instagram: '', tiktok: '' },
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [site, setSite] = useState<SiteForm>({
    seoTitle: '', seoDescription: '', seoKeywords: '', ogImage: '',
  })
  const [ogFile, setOgFile] = useState<File | null>(null)
  const [ogPreview, setOgPreview] = useState<string>('')
  const ogInputRef = useRef<HTMLInputElement>(null)

  const [account, setAccount] = useState<AccountForm>({
    currentPassword: '', newEmail: '', newPassword: '', confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then(({ profile: p, site: s }) => {
        if (p) {
          setProfile({ name: p.name ?? '', title: p.title ?? '', email: p.email ?? '', phone: p.phone ?? '', location: p.location ?? '', avatar: p.avatar ?? '', social: { github: p.social?.github ?? '', linkedin: p.social?.linkedin ?? '', instagram: p.social?.instagram ?? '', tiktok: p.social?.tiktok ?? '' } })
          if (p.avatar) setAvatarPreview(p.avatar)
        }
        if (s) {
          setSite({ seoTitle: s.seoTitle ?? '', seoDescription: s.seoDescription ?? '', seoKeywords: s.seoKeywords ?? '', ogImage: s.ogImage ?? '' })
          if (s.ogImage) setOgPreview(s.ogImage)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    let avatarUrl = profile.avatar
    if (avatarFile) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(avatarFile)
      })
      const up = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: base64 }),
      })
      if (up.ok) {
        const { url } = await up.json()
        avatarUrl = url
      } else {
        toast.error('Image upload failed')
        setSaving(false)
        return
      }
    }
    const updatedProfile = { ...profile, avatar: avatarUrl }
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'profile', data: updatedProfile }),
    })
    if (res.ok) {
      setProfile(updatedProfile)
      setAvatarFile(null)
      toast.success('Profile saved')
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: updatedProfile }))
    } else {
      toast.error('Failed to save profile')
    }
    setSaving(false)
  }

  const saveSite = async () => {
    setSaving(true)
    let ogImageUrl = site.ogImage
    if (ogFile) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(ogFile)
      })
      const up = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: base64, folder: 'portfolio/og', public_id: 'og-image' }),
      })
      if (up.ok) {
        const { url } = await up.json()
        ogImageUrl = url
      } else {
        toast.error('Image upload failed')
        setSaving(false)
        return
      }
    }
    const updatedSite = { ...site, ogImage: ogImageUrl }
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'site', data: updatedSite }),
    })
    if (res.ok) {
      setSite(updatedSite)
      setOgFile(null)
      toast.success('Site settings saved')
    } else {
      toast.error('Failed to save site settings')
    }
    setSaving(false)
  }

  const pwdRules = [
    { label: '8+ characters', pass: account.newPassword.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(account.newPassword) },
    { label: 'Lowercase', pass: /[a-z]/.test(account.newPassword) },
    { label: 'Number', pass: /[0-9]/.test(account.newPassword) },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(account.newPassword) },
  ]
  const pwdValid = account.newPassword === '' || pwdRules.every((r) => r.pass)
  const passwordsMatch = account.confirmPassword !== '' && account.newPassword === account.confirmPassword

  const saveAccount = async () => {
    if (account.newPassword && !pwdRules.every((r) => r.pass)) {
      toast.error('Password does not meet requirements')
      return
    }
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
      toast.success('Account updated. Please log in again.')
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
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
              <label className={labelClass}>Location</label>
              <input className={inputClass} value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="San Francisco, CA" />
            </div>
            <div>
              <label className={labelClass}>Avatar</label>
              <div className="flex items-center gap-3">
                <div
                  className="relative w-12 h-12 rounded-2xl bg-secondary border border-border overflow-hidden flex-shrink-0 cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setAvatarFile(file)
                    setAvatarPreview(URL.createObjectURL(file))
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  {avatarFile ? avatarFile.name : 'Click to upload image'}
                </span>
              </div>
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
            <label className={labelClass}>OG Image <span className="text-muted-foreground text-xs">(1200×630px recommended)</span></label>
            <div className="flex items-center gap-3">
              <div
                className="relative w-24 h-14 rounded-xl bg-secondary border border-border overflow-hidden flex-shrink-0 cursor-pointer group"
                onClick={() => ogInputRef.current?.click()}
              >
                {ogPreview ? (
                  <img src={ogPreview} alt="og" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
              <input
                ref={ogInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setOgFile(file)
                  setOgPreview(URL.createObjectURL(file))
                }}
              />
              <span className="text-xs text-muted-foreground">
                {ogFile ? ogFile.name : 'Click to upload image'}
              </span>
            </div>
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
            <p className="text-sm font-semibold text-foreground mb-3">Change Password</p>

            <div className="mb-3">
              <label className={labelClass}>Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  className={`${inputClass} pr-10`}
                  value={account.currentPassword}
                  onChange={(e) => setAccount({ ...account, currentPassword: e.target.value })}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mb-2">
              <label className={labelClass}>New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  className={`${inputClass} pr-10`}
                  value={account.newPassword}
                  onChange={(e) => setAccount({ ...account, newPassword: e.target.value })}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {account.newPassword && (
                <div className="flex flex-col gap-1 mt-2">
                  {pwdRules.map((r) => (
                    <span key={r.label} className={`flex items-center gap-1.5 text-xs transition-colors ${r.pass ? 'text-green-500' : 'text-muted-foreground'}`}>
                      <CheckCircle2 className={`w-3 h-3 flex-shrink-0 ${r.pass ? 'opacity-100' : 'opacity-30'}`} />
                      {r.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className={labelClass}>Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  className={`${inputClass} pr-10`}
                  value={account.confirmPassword}
                  onChange={(e) => setAccount({ ...account, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {account.confirmPassword && (
                <div className="flex flex-col gap-1 mt-2">
                  <span className={`flex items-center gap-1.5 text-xs transition-colors ${passwordsMatch ? 'text-green-500' : 'text-muted-foreground'}`}>
                    <CheckCircle2 className={`w-3 h-3 flex-shrink-0 ${passwordsMatch ? 'opacity-100' : 'opacity-30'}`} />
                    Passwords match
                  </span>
                </div>
              )}
            </div>

          </div>

          <button onClick={saveAccount} disabled={saving || !account.currentPassword || !pwdValid || (account.confirmPassword !== '' && !passwordsMatch)} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Account
          </button>
        </div>
      )}
    </div>
  )
}
