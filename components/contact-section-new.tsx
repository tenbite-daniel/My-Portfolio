'use client'

import { Send } from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'
import { contactData } from '@/lib/portfolio-data'
import { getCountries, getCountryCallingCode, getExampleNumber } from 'libphonenumber-js'
import examples from 'libphonenumber-js/mobile/examples'
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { toast } from 'sonner'

interface ContactSectionProps {
  data?: typeof contactData
}

function ContactForm({ data = contactData }: ContactSectionProps) {
  const { executeRecaptcha } = useGoogleReCaptcha()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: 'ET',
    phone: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')

  const countries = useMemo(() => {
    return getCountries()
      .map((country) => ({
        code: country,
        callingCode: `+${getCountryCallingCode(country)}`,
      }))
      .sort((a, b) => {
        if (a.code === 'ET') return -1
        if (b.code === 'ET') return 1
        return a.code.localeCompare(b.code)
      })
  }, [])

  const selectedCountryData = countries.find((c) => c.code === formData.countryCode)
  const placeholder = (() => {
    try {
      const example = getExampleNumber(formData.countryCode as any, examples)
      return example ? example.nationalNumber : '123456789'
    } catch {
      return '123456789'
    }
  })()

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!executeRecaptcha) return

    setStatus('loading')

    try {
      const recaptchaToken = await executeRecaptcha('contact_form')
      const callingCode = selectedCountryData?.callingCode ?? '+251'

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, countryCode: callingCode, recaptchaToken }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setStatus('idle')
        toast.success("Message sent! I'll get back to you soon.")
        setFormData({ name: '', email: '', countryCode: 'ET', phone: '', subject: '', message: '' })
      } else {
        setStatus('idle')
        toast.error(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('idle')
      toast.error('Something went wrong. Please try again.')
    }
  }, [executeRecaptcha, formData, selectedCountryData])

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Get In Touch</h2>
        <div className="w-10 h-1 bg-accent rounded-full mb-6" />
        <p className="text-muted-foreground text-sm md:text-base mb-6">
          Have a question or want to work together? Fill out the form below and I'll get back to you as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all text-sm md:text-base"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all text-sm md:text-base"
              placeholder="john@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Phone Number <span className="text-red-500">*</span></label>
          <div className="flex gap-3">
            <select
              value={formData.countryCode}
              onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
              className="px-3 md:px-4 py-3 md:py-3.5 bg-secondary border border-border rounded-xl text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all text-sm md:text-base cursor-pointer appearance-none scrollbar-hide"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='currentColor' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                paddingRight: '28px',
              }}
            >
              {countries.map(({ code, callingCode }) => (
                <option key={code} value={code}>
                  {code} ({callingCode})
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="flex-1 px-4 md:px-5 py-3 md:py-3.5 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all text-sm md:text-base"
              placeholder={placeholder}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all text-sm md:text-base"
            placeholder="e.g., Project Inquiry, Collaboration, etc."
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
            Your Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            rows={6}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all resize-none text-sm md:text-base"
            placeholder="Write your message here..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex items-center justify-center gap-2 w-full md:w-auto px-6 md:px-8 py-3 md:py-3.5 bg-accent text-accent-foreground rounded-xl font-medium hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5 transition-all text-sm md:text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <Send className="w-4 h-4" />
          {status === 'loading' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}

export function ContactSection(props: ContactSectionProps) {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}>
      <ContactForm {...props} />
    </GoogleReCaptchaProvider>
  )
}
