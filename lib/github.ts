import * as cheerio from 'cheerio'

const GITHUB_USERNAME = 'tenbite-daniel'
const REVALIDATE = 3600

export async function fetchGitHubData() {
  const [contribRes, userRes] = await Promise.all([
    fetch(`https://github.com/users/${GITHUB_USERNAME}/contributions`, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      next: { revalidate: REVALIDATE },
    }),
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      next: { revalidate: REVALIDATE },
    }),
  ])

  if (!contribRes.ok) throw new Error('Failed to fetch contributions')

  const html = await contribRes.text()
  const $ = cheerio.load(html)

  const totalText = $('h2').first().text().replace(/[^0-9]/g, '')
  const totalContributions = parseInt(totalText, 10) || 0

  const weeks: number[][] = []
  let currentWeek: number[] = []
  $('td.ContributionCalendar-day').each((_, el) => {
    const level = parseInt($(el).attr('data-level') || '0', 10)
    currentWeek.push(level)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })
  if (currentWeek.length > 0) weeks.push(currentWeek)

  const monthlyMap: Record<string, number> = {}
  $('td.ContributionCalendar-day').each((_, el) => {
    const date = $(el).attr('data-date')
    const count = parseInt($(el).attr('data-count') || '0', 10)
    if (date) {
      const month = new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      monthlyMap[month] = (monthlyMap[month] || 0) + count
    }
  })
  const monthlyData = Object.entries(monthlyMap).map(([date, count]) => ({ date, count }))

  const user = userRes.ok ? await userRes.json() : null

  return { totalContributions, weeks, monthlyData, user }
}

export interface GitHubRepo {
  name: string
  description: string
  html_url: string
  stargazers_count: number
  language: string
  topics: string[]
}

export async function fetchFeaturedRepos(repoNames: string[]): Promise<GitHubRepo[]> {
  if (!repoNames.length) return []

  const results = await Promise.all(
    repoNames.map((name) =>
      fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${name}`, {
        next: { revalidate: REVALIDATE },
      }).then((r) => (r.ok ? r.json() : null))
    )
  )

  return results.filter(Boolean) as GitHubRepo[]
}

export async function fetchAllRepos(): Promise<GitHubRepo[]> {
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=full_name&per_page=100`,
    { cache: 'no-store' }
  )
  if (!res.ok) return []
  return res.json()
}
