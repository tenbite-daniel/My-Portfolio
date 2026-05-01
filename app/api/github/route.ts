import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

const GITHUB_USERNAME = 'tenbite-daniel'

export async function GET() {
  try {
    const res = await fetch(`https://github.com/users/${GITHUB_USERNAME}/contributions`, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      cache: 'no-store',
    })

    if (!res.ok) throw new Error('Failed to fetch contributions')

    const html = await res.text()
    const $ = cheerio.load(html)

    // Parse total contributions
    const totalText = $('h2').first().text().replace(/[^0-9]/g, '')
    const totalContributions = parseInt(totalText, 10) || 0

    // Parse calendar cells grouped into weeks
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

    // Build monthly graph data
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

    return NextResponse.json({ totalContributions, weeks, monthlyData })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
