'use client'

import { useState, useEffect, useRef } from 'react'

interface SkillCircleProps {
  name: string
  level: number
  inView?: boolean
}

export function SkillCircle({ name, level, inView = false }: SkillCircleProps) {
  const [displayedLevel, setDisplayedLevel] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!inView || hasAnimated.current) return

    hasAnimated.current = true
    setIsAnimating(true)

    // Smooth animation with ease-out timing
    const startTime = Date.now()
    const duration = 1500 // 1.5 seconds for smooth animation
    
    const animateProgress = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease-out cubic for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const currentLevel = Math.round(level * easeProgress)
      
      setDisplayedLevel(currentLevel)
      
      if (progress < 1) {
        requestAnimationFrame(animateProgress)
      } else {
        setIsAnimating(false)
      }
    }
    
    requestAnimationFrame(animateProgress)
  }, [inView, level])

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (displayedLevel / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-3 group">
      <div className="relative w-28 h-28 transform transition-transform duration-300 group-hover:scale-105">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-full bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
        
        <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-secondary"
          />
          {/* Progress circle with smooth animation */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-accent transition-all duration-300 ease-out"
          />
        </svg>
        
        {/* Center text with fade and scale animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-center transform transition-all duration-500 ${
            inView ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}>
            <span className="text-lg md:text-xl font-bold text-foreground block">{displayedLevel}%</span>
          </div>
        </div>
      </div>
      
      {/* Skill name with fade-in */}
      <p className={`text-sm font-medium text-foreground text-center transition-all duration-500 ${
        inView ? 'opacity-100' : 'opacity-0'
      }`}>
        {name}
      </p>
    </div>
  )
}
