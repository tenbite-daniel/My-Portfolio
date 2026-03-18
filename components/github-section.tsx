import { Github, Star } from 'lucide-react'
import { GitHubClient } from '@/components/github-client'
import { fetchGitHubData, fetchFeaturedRepos } from '@/lib/github'
import { connectDB } from '@/lib/mongodb'
import { FeaturedRepo } from '@/models/FeaturedRepo'
import { cacheTag } from 'next/cache'

const GITHUB_USERNAME = 'tenbite-daniel'

async function getFeaturedRepos() {
  'use cache'
  cacheTag('featured-repos')
  await connectDB()
  const docs = await FeaturedRepo.find().sort({ order: 1 }).lean() as { repoName: string }[]
  const names = docs.map((d) => d.repoName)
  return fetchFeaturedRepos(names)
}

export async function GitHubSection() {
  let data: Awaited<ReturnType<typeof fetchGitHubData>>

  try {
    data = await fetchGitHubData()
  } catch {
    return (
      <section className="space-y-12">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-500 text-sm">Failed to load GitHub data</p>
        </div>
      </section>
    )
  }

  const featuredRepos = await getFeaturedRepos()
  const { user, totalContributions, weeks, monthlyData } = data

  return (
    <section className="space-y-12">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
            <Github className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">GitHub Contributions</h2>
            <p className="text-muted-foreground text-sm md:text-base">Active development and open-source contributions</p>
          </div>
        </div>

        {user && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Repositories</p>
              <p className="text-2xl font-bold text-foreground">{user.public_repos}+</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Contributions</p>
              <p className="text-2xl font-bold text-foreground">{totalContributions ? `${totalContributions}+` : '—'}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Followers</p>
              <p className="text-2xl font-bold text-foreground">{user.followers}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Following</p>
              <p className="text-2xl font-bold text-foreground">{user.following}</p>
            </div>
          </div>
        )}

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

      <GitHubClient
        totalContributions={totalContributions}
        calendarWeeks={weeks}
        contributions={monthlyData}
      />

      {featuredRepos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-bold text-foreground">Featured Repositories</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredRepos.map((repo) => (
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
                    <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded">{repo.language}</span>
                  )}
                  {repo.topics?.slice(0, 2).map((topic) => (
                    <span key={topic} className="px-2 py-1 bg-secondary/50 text-muted-foreground text-xs rounded">{topic}</span>
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
