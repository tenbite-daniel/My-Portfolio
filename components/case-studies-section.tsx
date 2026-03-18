'use client'

import { caseStudiesData } from '@/lib/portfolio-data'
import { ChevronDown, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface CaseStudyProps {
  title: string
  project: string
  overview: string
  challenge: string
  approach: string
  solution: string
  results: string[]
}

function CaseStudyCard({ study }: { study: CaseStudyProps }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-secondary border border-border rounded-lg overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 md:p-6 flex items-start justify-between gap-4 hover:bg-secondary/80 transition-colors"
      >
        <div className="text-left flex-1">
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">{study.title}</h3>
          <p className="text-sm text-accent font-medium mb-2">{study.project}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{study.overview}</p>
        </div>
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          <ChevronDown className="w-5 h-5 text-accent" />
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-border space-y-6">
          {/* Challenge */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">Challenge</h4>
            <p className="text-sm md:text-base text-muted-foreground">{study.challenge}</p>
          </div>

          {/* Approach */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">My Approach</h4>
            <p className="text-sm md:text-base text-muted-foreground">{study.approach}</p>
          </div>

          {/* Solution */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">Solution</h4>
            <p className="text-sm md:text-base text-muted-foreground">{study.solution}</p>
          </div>

          {/* Results */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">Results & Impact</h4>
            <ul className="space-y-2">
              {study.results.map((result, index) => (
                <li key={index} className="flex items-start gap-3 text-sm md:text-base">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                    ✓
                  </span>
                  <span className="text-foreground">{result}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

interface CaseStudiesSectionProps {
  isAdmin?: boolean
  initialShowCaseStudies?: boolean
}

export function CaseStudiesSection({ isAdmin = false, initialShowCaseStudies = true }: CaseStudiesSectionProps) {
  const [showCaseStudies, setShowCaseStudies] = useState(initialShowCaseStudies)
  const [toggling, setToggling] = useState(false)

  const toggleVisibility = async () => {
    setToggling(true)
    const next = !showCaseStudies
    const res = await fetch('/api/admin/about', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showCaseStudies: next }),
    })
    if (res.ok) {
      setShowCaseStudies(next)
      toast.success(next ? 'Case Studies tab is now visible' : 'Case Studies tab is now hidden')
    } else {
      toast.error('Failed to update')
    }
    setToggling(false)
  }

  return (
    <section className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Case Studies</h2>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Show Tab</span>
              <button
                onClick={toggleVisibility}
                disabled={toggling}
                title={showCaseStudies ? 'Hide from visitors' : 'Show to visitors'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                  showCaseStudies ? 'bg-accent' : 'bg-border'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  showCaseStudies ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          Detailed breakdowns of challenging problems I've solved, my approach, and the measurable impact delivered.
          Click to expand any case study to see the full story.
        </p>
        {isAdmin && !showCaseStudies && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-muted/50 border border-dashed border-border w-fit">
            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground italic">Case Studies tab is hidden from visitors</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {caseStudiesData.studies.map((study) => (
          <CaseStudyCard key={study.title} study={study} />
        ))}
      </div>

      {/* Impact Summary */}
      <div className="bg-gradient-to-br from-accent/10 via-secondary to-background rounded-lg border border-accent/20 p-6 md:p-8">
        <h3 className="text-lg md:text-xl font-bold text-foreground mb-4">Key Outcomes Across Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-2xl md:text-3xl font-bold text-accent mb-2">$2M+</p>
            <p className="text-sm text-muted-foreground">Revenue generated through platform optimization</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-accent mb-2">99.9%</p>
            <p className="text-sm text-muted-foreground">System uptime across critical applications</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-accent mb-2">140K+</p>
            <p className="text-sm text-muted-foreground">Active users across all applications</p>
          </div>
        </div>
      </div>
    </section>
  )
}
