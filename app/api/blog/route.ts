import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Blog } from '@/models/Blog'

export async function GET() {
  try {
    await connectDB()
    const now = new Date()
    const posts = await Blog.find({
      $or: [
        { published: true, scheduledAt: null },
        { published: true, scheduledAt: { $lte: now } },
        { scheduledAt: { $lte: now } },
      ],
    })
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json({ posts: JSON.parse(JSON.stringify(posts)) })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
