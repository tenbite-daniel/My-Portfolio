import { NextResponse } from 'next/server'
import { fetchGitHubData } from '@/lib/github'

export async function GET() {
  try {
    const data = await fetchGitHubData()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
