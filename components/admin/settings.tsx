'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, User, Globe, Lock, Eye, EyeOff, Camera, CheckCircle2, BarChart2, Wrench } from 'lucide-react'

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
  favicon: string
  siteName: string
  googleAnalyticsId: string
  maintenanceMode: boolean
  maintenanceDuration: number
  maintenanceDurationType: 'seconds' | 'minutes' | 'hours' | 'days'
  twitterCard: 'summary' | 'summary_large_image'
  twitterSite: string
  twitterCreator: string
  canonicalUrl: string
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
const selectClass = 'w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all appearance-none cursor-pointer'
const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CacheProps = { cache?: React.MutableRefObject<Record<string, any>>; cachedFetch?: (key: string, url: string) => Promise<any>; updateCache?: (key: string, partial: Record<string, any>) => void }

export function AdminSettings({ cache, cachedFetch, updateCache }: CacheProps) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [maintenanceModal, setMaintenanceModal] = useState(false)
  const [modalDuration, setModalDuration] = useState(1)
  const [modalDurationType, setModalDurationType] = useState<SiteForm['maintenanceDurationType']>('hours')
  const [togglingMaintenance, setTogglingMaintenance] = useState(false)

  const [profile, setProfile] = useState<ProfileForm>({
    name: '', title: '', email: '', phone: '', location: '', avatar: '',
    social: { github: '', linkedin: '', instagram: '', tiktok: '' },
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [site, setSite] = useState<SiteForm>({
    seoTitle: '', seoDescription: '', seoKeywords: '', ogImage: '',
    favicon: '', siteName: '', googleAnalyticsId: '', maintenanceMode: false,
    maintenanceDuration: 1, maintenanceDurationType: 'hours',
    twitterCard: 'summary_large_image', twitterSite: '', twitterCreator: '', canonicalUrl: '',
  })
  const [ogFile, setOgFile] = useState<File | null>(null)
  const [ogPreview, setOgPreview] = useState<string>('')
  const ogInputRef = useRef<HTMLInputElement>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string>('')
  const faviconInputRef = useRef<HTMLInputElement>(null)

  const [account, setAccount] = useState<AccountForm>({
    currentPassword: '', newEmail: '', newPassword: '', confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

  useEffect(() => {
    const load = cachedFetch
      ? cachedFetch('settings', '/api/admin/settings')
      : fetch('/api/admin/settings').then(r => r.json())
    load
      .then(({ profile: p, site: s }: { profile: { name?: string; title?: string; email?: string; phone?: string; location?: string; avatar?: string; social?: Record<string, string> } | null; site: Record<string, unknown> | null }) => {
        if (p) {
          setProfile({ name: p.name ?? '', title: p.title ?? '', email: p.email ?? '', phone: p.phone ?? '', location: p.location ?? '', avatar: p.avatar ?? '', social: { github: p.social?.github ?? '', linkedin: p.social?.linkedin ?? '', instagram: p.social?.instagram ?? '', tiktok: p.social?.tiktok ?? '' } })
          if (p.avatar) setAvatarPreview(p.avatar)
        }
        if (s) {
          const str = (v: unknown) => (typeof v === 'string' ? v : '')
          setSite({
            seoTitle: str(s.seoTitle), seoDescription: str(s.seoDescription),
            seoKeywords: str(s.seoKeywords), ogImage: str(s.ogImage),
            favicon: str(s.favicon),
            siteName: str(s.siteName),
            googleAnalyticsId: str(s.googleAnalyticsId),
            maintenanceMode: s.maintenanceMode === true,
            maintenanceDuration: typeof s.maintenanceDuration === 'number' ? s.maintenanceDuration : 1,
            maintenanceDurationType: (['seconds','minutes','hours','days'].includes(s.maintenanceDurationType as string) ? s.maintenanceDurationType : 'hours') as 'seconds' | 'minutes' | 'hours' | 'days',
            twitterCard: (s.twitterCard === 'summary' ? 'summary' : 'summary_large_image'),
            twitterSite: str(s.twitterSite), twitterCreator: str(s.twitterCreator),
            canonicalUrl: str(s.canonicalUrl),
          })
          if (s.ogImage) setOgPreview(str(s.ogImage))
          if (s.favicon) setFaviconPreview(str(s.favicon))
        }
      })
      .finally(() => setLoading(false))
  }, [cachedFetch])

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
      updateCache?.('settings', { profile: updatedProfile })
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: updatedProfile }))
    } else {
      toast.error('Failed to save profile')
    }
    setSaving(false)
  }

  const uploadImage = async (file: File, folder: string, public_id: string): Promise<string | null> => {
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
    const up = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: base64, folder, public_id }),
    })
    if (!up.ok) return null
    const { url } = await up.json()
    return url
  }

  const toggleMaintenance = async () => {
    // If turning off, disable immediately
    if (site.maintenanceMode) {
      setTogglingMaintenance(true)
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'site', data: { maintenanceMode: false, maintenanceEndsAt: null } }),
      })
      if (res.ok) {
        setSite(s => ({ ...s, maintenanceMode: false }))
        if (cache?.current) delete cache.current['settings']
        toast.success('Maintenance mode disabled')
      } else {
        toast.error('Failed to update maintenance mode')
      }
      setTogglingMaintenance(false)
      return
    }
    // If turning on, show modal to set duration
    setModalDuration(site.maintenanceDuration)
    setModalDurationType(site.maintenanceDurationType)
    setMaintenanceModal(true)
  }

  const confirmMaintenance = async () => {
    setTogglingMaintenance(true)
    const multipliers = { seconds: 1000, minutes: 60000, hours: 3600000, days: 86400000 }
    const endsAt = new Date(Date.now() + modalDuration * multipliers[modalDurationType]).toISOString()
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'site', data: { maintenanceMode: true, maintenanceEndsAt: endsAt } }),
    })
    if (res.ok) {
      setSite(s => ({ ...s, maintenanceMode: true, maintenanceDuration: modalDuration, maintenanceDurationType: modalDurationType }))
      if (cache?.current) delete cache.current['settings']
      toast.success('Maintenance mode enabled')
      setMaintenanceModal(false)
    } else {
      toast.error('Failed to enable maintenance mode')
    }
    setTogglingMaintenance(false)
  }

  const saveSite = async () => {
    setSaving(true)
    let ogImageUrl = site.ogImage
    let faviconUrl = site.favicon

    if (ogFile) {
      const url = await uploadImage(ogFile, 'portfolio/og', 'og-image')
      if (!url) { toast.error('OG image upload failed'); setSaving(false); return }
      ogImageUrl = url
    }
    if (faviconFile) {
      const url = await uploadImage(faviconFile, 'portfolio/favicon', 'favicon')
      if (!url) { toast.error('Favicon upload failed'); setSaving(false); return }
      faviconUrl = url
    }

    const updatedSite = { ...site, ogImage: ogImageUrl, favicon: faviconUrl }
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'site', data: updatedSite }),
    })
    if (res.ok) {
      setSite(updatedSite)
      setOgFile(null)
      setFaviconFile(null)
      toast.success('Site settings saved')
      updateCache?.('settings', { site: updatedSite })
      // Force re-fetch on next load so stale cache doesn't override saved values
      if (cache?.current) delete cache.current['settings']
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
        <div className="space-y-6">

          {/* SEO Preview */}
          <div className="p-4 bg-secondary rounded-xl border border-border space-y-1">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Google Search Preview</p>
            <p className="text-xs text-green-600 dark:text-green-400 truncate">{site.canonicalUrl || 'https://yoursite.com'}</p>
            <p className="text-base text-blue-600 dark:text-blue-400 font-medium leading-tight truncate">{site.seoTitle || 'Page Title'}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{site.seoDescription || 'Page description will appear here...'}</p>
          </div>

          {/* SEO Fields */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">General</p>
            <div>
              <label className={labelClass}>Site Name <span className="text-muted-foreground text-xs">(used in OG & JSON-LD)</span></label>
              <input className={inputClass} value={site.siteName} onChange={(e) => setSite({ ...site, siteName: e.target.value })} placeholder="Tenbite Daniel" />
            </div>
          </div>

          {/* SEO Fields */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">SEO</p>
            <div>
              <label className={labelClass}>SEO Title</label>
              <input className={inputClass} value={site.seoTitle} onChange={(e) => setSite({ ...site, seoTitle: e.target.value })} placeholder="John Doe — Full-Stack Developer" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`${labelClass} mb-0`}>SEO Description</label>
                <span className={`text-xs font-medium ${site.seoDescription.length > 160 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {site.seoDescription.length}/160
                </span>
              </div>
              <textarea className={`${inputClass} resize-none`} rows={3} value={site.seoDescription} onChange={(e) => setSite({ ...site, seoDescription: e.target.value })} placeholder="A short description for search engines..." />
            </div>
            <div>
              <label className={labelClass}>SEO Keywords</label>
              <input className={inputClass} value={site.seoKeywords} onChange={(e) => setSite({ ...site, seoKeywords: e.target.value })} placeholder="developer, react, nextjs, portfolio" />
            </div>
            <div>
              <label className={labelClass}>Canonical URL</label>
              <input className={inputClass} value={site.canonicalUrl} onChange={(e) => setSite({ ...site, canonicalUrl: e.target.value })} placeholder="https://yoursite.com" />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Images</p>
            <div>
              <label className={labelClass}>OG Image <span className="text-muted-foreground text-xs">(1200×630px recommended)</span></label>
              <div className="flex items-center gap-3">
                <div className="relative w-24 h-14 rounded-xl bg-secondary border border-border overflow-hidden flex-shrink-0 cursor-pointer group" onClick={() => ogInputRef.current?.click()}>
                  {ogPreview ? <img src={ogPreview} alt="og" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Camera className="w-5 h-5 text-muted-foreground" /></div>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera className="w-4 h-4 text-white" /></div>
                </div>
                <input ref={ogInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setOgFile(f); setOgPreview(URL.createObjectURL(f)) }} />
                <span className="text-xs text-muted-foreground">{ogFile ? ogFile.name : 'Click to upload'}</span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Favicon <span className="text-muted-foreground text-xs">(32×32px recommended)</span></label>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl bg-secondary border border-border overflow-hidden flex-shrink-0 cursor-pointer group" onClick={() => faviconInputRef.current?.click()}>
                  {faviconPreview ? <img src={faviconPreview} alt="favicon" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Camera className="w-4 h-4 text-muted-foreground" /></div>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera className="w-3 h-3 text-white" /></div>
                </div>
                <input ref={faviconInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setFaviconFile(f); setFaviconPreview(URL.createObjectURL(f)) }} />
                <span className="text-xs text-muted-foreground">{faviconFile ? faviconFile.name : 'Click to upload'}</span>
              </div>
            </div>
          </div>

          {/* Twitter / X */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Twitter / X Card</p>
            <div>
              <label className={labelClass}>Card Type</label>
              <select className={selectClass} value={site.twitterCard} onChange={(e) => setSite({ ...site, twitterCard: e.target.value as 'summary' | 'summary_large_image' })}>
                <option value="summary_large_image">Summary Large Image</option>
                <option value="summary">Summary</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Site Handle</label>
                <input className={inputClass} value={site.twitterSite} onChange={(e) => setSite({ ...site, twitterSite: e.target.value })} placeholder="@yoursite" />
              </div>
              <div>
                <label className={labelClass}>Creator Handle</label>
                <input className={inputClass} value={site.twitterCreator} onChange={(e) => setSite({ ...site, twitterCreator: e.target.value })} placeholder="@yourcreator" />
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Analytics</p>
            <div>
              <label className={labelClass}>Google Analytics ID</label>
              <input className={inputClass} value={site.googleAnalyticsId} onChange={(e) => setSite({ ...site, googleAnalyticsId: e.target.value })} placeholder="G-XXXXXXXXXX" />
            </div>
          </div>

          {/* Maintenance */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <Wrench className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Visitors will see a countdown page</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleMaintenance}
              disabled={togglingMaintenance}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 ${
                site.maintenanceMode ? 'bg-accent' : 'bg-border'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                site.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <button onClick={saveSite} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Site Settings
          </button>
        </div>
      )}

      {/* Maintenance Modal */}
      {maintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Enable Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Set how long the site will be down</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Duration</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={modalDuration}
                  onChange={(e) => setModalDuration(Math.max(1, Number(e.target.value)))}
                  autoFocus
                />
                <select
                  className={selectClass}
                  value={modalDurationType}
                  onChange={(e) => setModalDurationType(e.target.value as SiteForm['maintenanceDurationType'])}
                >
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setMaintenanceModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmMaintenance}
                disabled={togglingMaintenance}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {togglingMaintenance && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Enable
              </button>
            </div>
          </div>
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
