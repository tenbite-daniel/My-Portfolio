'use client'

import { useEffect, useState, useCallback } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(endsAt: string): TimeLeft {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function Pad({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
        <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs sm:text-sm font-medium text-white/60 uppercase tracking-widest">{label}</span>
    </div>
  )
}

export default function MaintenancePage() {
  const [endsAt, setEndsAt] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [expired, setExpired] = useState(false)

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/maintenance-status')
      const data = await res.json()
      if (!data.maintenanceMode) {
        // Maintenance is off — reload to show the real site
        window.location.reload()
        return
      }
      if (data.maintenanceEndsAt) setEndsAt(data.maintenanceEndsAt)
    } catch {}
  }, [])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  useEffect(() => {
    if (!endsAt) return
    const tick = () => {
      const left = calcTimeLeft(endsAt)
      setTimeLeft(left)
      const allZero = left.days === 0 && left.hours === 0 && left.minutes === 0 && left.seconds === 0
      if (allZero) {
        setExpired(true)
        // Poll until the API confirms maintenance is off (auto-disable triggers on next GET)
        const poll = setInterval(async () => {
          try {
            const res = await fetch('/api/maintenance-status')
            const data = await res.json()
            if (!data.maintenanceMode) {
              clearInterval(poll)
              window.location.reload()
            }
          } catch {}
        }, 2000)
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [endsAt])

  const showCountdown = timeLeft && !expired && endsAt

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0f0f1a]">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl w-full">
        {/* Icon */}
        <div className="mb-6 w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-xl backdrop-blur-sm">
          🔧
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
          Under Maintenance
        </h1>
        <p className="text-white/50 text-sm sm:text-base mb-10 max-w-md">
          We&apos;re making some improvements. The site will be back shortly.
        </p>

        {/* Countdown */}
        {showCountdown && (
          <div className="w-full">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-6">Back in</p>
            <div className="flex items-start justify-center gap-3 sm:gap-5 md:gap-6">
              {timeLeft.days > 0 && <Pad value={timeLeft.days} label="Days" />}
              <Pad value={timeLeft.hours} label="Hours" />
              <Pad value={timeLeft.minutes} label="Minutes" />
              <Pad value={timeLeft.seconds} label="Seconds" />
            </div>
          </div>
        )}

        {expired && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <p className="text-white/50 text-sm">Finishing up, coming back online...</p>
          </div>
        )}

        {!endsAt && !expired && (
          <p className="text-white/30 text-sm">We&apos;ll be back soon.</p>
        )}

        {/* Bottom bar */}
        <div className="mt-16 flex items-center gap-2 text-white/20 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Maintenance in progress
        </div>
      </div>
    </div>
  )
}
