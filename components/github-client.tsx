'use client'

import { useState } from 'react'
import { TrendingUp, BarChart3 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface GitHubClientProps {
  totalContributions: number
  calendarWeeks: number[][]
  contributions: { date: string; count: number }[]
}

const dayNames = ['', 'Mon', '', 'Wed', '', 'Fri', '']

const calendarColors = [
  'bg-neutral-400 dark:bg-neutral-700',
  'bg-green-300 dark:bg-green-900',
  'bg-green-500 dark:bg-green-700',
  'bg-green-600 dark:bg-green-500',
  'bg-green-800 dark:bg-green-400',
]

const legendColors = [
  'bg-neutral-900 dark:bg-neutral-700',
  'bg-green-300 dark:bg-green-900',
  'bg-green-500 dark:bg-green-700',
  'bg-green-700 dark:bg-green-500',
  'bg-green-900 dark:bg-green-400',
]

export function GitHubClient({ totalContributions, calendarWeeks, contributions }: GitHubClientProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'graph'>('calendar')

  return (
    <>
      {/* Contribution Activity with Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Contribution Activity
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                viewMode === 'calendar' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1 ${
                viewMode === 'graph' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Graph
            </button>
          </div>
        </div>

        {viewMode === 'calendar' && (
          <>
            <div className="bg-secondary rounded-lg p-6 border border-border overflow-x-auto">
              <div className="space-y-4">
                <p className="text-sm font-semibold text-foreground mb-4">{totalContributions}+ contributions in the last year</p>
                <div className="min-w-full">
                  <div className="flex gap-1 mb-3 pl-16">
                    {Array.from({ length: 13 }, (_, i) => {
                      const d = new Date()
                      d.setMonth(d.getMonth() - 12 + i)
                      return d.toLocaleDateString('en-US', { month: 'short' })
                    }).map((month, idx) => (
                      <div key={idx} className="text-xs font-medium text-muted-foreground text-center" style={{ width: '52px' }}>
                        {month}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <div className="flex flex-col pr-2 text-xs text-muted-foreground">
                      {dayNames.map((day, i) => (
                        <div key={i} className="h-[14px] w-7 flex items-center justify-end">{day}</div>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      {calendarWeeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-1">
                          {week.map((intensity, dayIdx) => (
                            <div
                              key={`${weekIdx}-${dayIdx}`}
                              className={`w-2.5 h-2.5 rounded-[3px] ${calendarColors[intensity]}`}
                              title={`${intensity * 25} contributions`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className={`w-2.5 h-2.5 rounded-[3px] ${legendColors[level]}`} />
              ))}
              <span>More</span>
            </div>
          </>
        )}

        {viewMode === 'graph' && (
          <div className="bg-secondary rounded-lg p-6 border border-border">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={contributions}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.5rem',
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="var(--color-accent)" strokeWidth={2} dot={{ fill: 'var(--color-accent)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </>
  )
}
