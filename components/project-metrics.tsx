'use client'

import { TrendingUp } from 'lucide-react'

interface ProjectMetricsProps {
  metrics: Record<string, string>
}

export function ProjectMetrics({ metrics }: ProjectMetricsProps) {
  const metricEntries = Object.entries(metrics)

  return (
    <div className="bg-gradient-to-br from-accent/5 via-background to-secondary rounded-lg border border-accent/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-accent" />
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Impact & Metrics</h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metricEntries.map(([key, value]) => (
          <div key={key} className="space-y-1">
            <p className="text-xs text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            <p className="text-base md:text-lg font-bold text-accent">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
