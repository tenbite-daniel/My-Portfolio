import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { connectDB } from '@/lib/mongodb'
import { FeaturedRepo } from '@/models/FeaturedRepo'
import { fetchAllRepos } from '@/lib/github'

export async function GET() {
  try {
    const [allRepos, db] = await Promise.all([
      fetchAllRepos(),
      connectDB().then(() => FeaturedRepo.find().lean()),
    ])
    const selected = (db as { repoName: string }[]).map((r) => r.repoName)
    return NextResponse.json({ repos: allRepos, selected })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { selected }: { selected: string[] } = await req.json()
    await connectDB()
    await FeaturedRepo.deleteMany({})
    if (selected.length) {
      await FeaturedRepo.insertMany(
        selected.map((repoName, order) => ({ repoName, order }))
      )
    }
    revalidateTag('featured-repos', 'max')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
