'use client'

import { useEffect, useState } from 'react'
import { Star, Github, TrendingUp, BarChart3 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const GITHUB_USERNAME = 'tenbite-daniel'

interface GitHubUser {
  public_repos: number
  followers: number
  following: number
  public_gists?: number
}

interface GitHubRepo {
  name: string
  description: string
  html_url: string
  stargazers_count: number
  language: string
  topics: string[]
}

export function GitHubSection() {
  const [stats, setStats] = useState<GitHubUser | null>(null)
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [contributions, setContributions] = useState<{ date: string; count: number }[]>([])
  const [viewMode, setViewMode] = useState<'calendar' | 'graph'>('calendar')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [calendarWeeks, setCalendarWeeks] = useState<number[][]>([])
  const [totalContributions, setTotalContributions] = useState<number>(0)

  const dayNames = ['', 'Mon', '', 'Wed', '', 'Fri', '']

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const [userRes, reposRes, contribRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=stars&per_page=6`),
          fetch('/api/github'),
        ])

        if (!userRes.ok) throw new Error('Failed to fetch user data')
        if (!reposRes.ok) throw new Error('Failed to fetch repositories')

        const [userData, reposData, contribData] = await Promise.all([
          userRes.json(),
          reposRes.json(),
          contribRes.json(),
        ])

        setStats(userData)
        setRepos(reposData)

        if (!contribData.error) {
          setCalendarWeeks(contribData.weeks)
          setTotalContributions(contribData.totalContributions)
          setContributions(contribData.monthlyData)
        }

        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch GitHub data')
        setLoading(false)
      }
    }

    fetchGitHubData()
  }, [])

  if (loading) {
    return (
      <section className="space-y-12 min-h-[600px]">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading GitHub data...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-12">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-12">
      {/* GitHub Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
            <Github className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">GitHub Contributions</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Active development and open-source contributions
            </p>
          </div>
        </div>

        {/* GitHub Stats - Including Contributions Count */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Repositories</p>
              <p className="text-2xl font-bold text-foreground">{stats.public_repos}+</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Contributions</p>
              <p className="text-2xl font-bold text-foreground">{totalContributions ? `${totalContributions}+` : '—'}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Followers</p>
              <p className="text-2xl font-bold text-foreground">{stats.followers}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Following</p>
              <p className="text-2xl font-bold text-foreground">{stats.following}</p>
            </div>
          </div>
        )}

        {/* GitHub Profile Link */}
        <a
          href={`https://github.com/${GITHUB_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm md:text-base"
        >
          <Github className="w-4 h-4" />
          View Full Profile
        </a>
      </div>

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
                viewMode === 'calendar'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1 ${
                viewMode === 'graph'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Graph
            </button>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <>
          <div className="bg-secondary rounded-lg p-6 border border-border overflow-x-auto">
            <div className="space-y-4">
              {/* Title with contribution count */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-4">{totalContributions}+ contributions in the last year</p>
              </div>

              <div className="min-w-full">
                {/* Months Header */}
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

                {/* Calendar Grid */}
                <div className="flex gap-1">
                  {/* Day names column */}
                  <div className="flex flex-col pr-2 text-xs text-muted-foreground">
                    {dayNames.map((day, i) => (
                      <div key={i} className="h-[14px] w-7 flex items-center justify-end">{day}</div>
                    ))}
                  </div>

                  {/* Weeks grid */}
                  <div className="flex gap-1">
                    {calendarWeeks.map((week, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col gap-1">
                        {week.map((intensity, dayIdx) => {
                          const colors = [
                            'bg-neutral-400 dark:bg-neutral-700',
                            'bg-green-300 dark:bg-green-900',
                            'bg-green-500 dark:bg-green-700',
                            'bg-green-600 dark:bg-green-500',
                            'bg-green-800 dark:bg-green-400',
                          ]
                          return (
                            <div
                              key={`${weekIdx}-${dayIdx}`}
                              className={`w-2.5 h-2.5 rounded-[3px] ${colors[intensity]}`}
                              title={`${intensity * 25} contributions`}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend - outside scroll, always right-aligned */}
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => {
              const colors = [
                'bg-neutral-900 dark:bg-neutral-700',
                'bg-green-300 dark:bg-green-900',
                'bg-green-500 dark:bg-green-700',
                'bg-green-700 dark:bg-green-500',
                'bg-green-900 dark:bg-green-400',
              ]
              return (
                <div key={level} className={`w-2.5 h-2.5 rounded-[3px] ${colors[level]}`} />
              )
            })}
            <span>More</span>
          </div>
          </>
        )}

        {/* Graph View */}
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
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-accent)', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Featured Repositories */}
      {repos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-bold text-foreground">Featured Repositories</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {repos.slice(0, 6).map((repo) => (
              <a
                key={repo.name}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 bg-secondary rounded-lg border border-border hover:border-accent transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors flex-1 break-all">
                    {repo.name}
                  </h4>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0 text-xs text-muted-foreground">
                    <Star className="w-4 h-4" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {repo.description || 'No description available'}
                </p>

                <div className="flex flex-wrap gap-2">
                  {repo.language && (
                    <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded">
                      {repo.language}
                    </span>
                  )}
                  {repo.topics?.slice(0, 2).map((topic) => (
                    <span key={topic} className="px-2 py-1 bg-secondary/50 text-muted-foreground text-xs rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
