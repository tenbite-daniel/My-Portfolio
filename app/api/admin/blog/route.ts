import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { connectDB } from '@/lib/mongodb'
import { Blog } from '@/models/Blog'

export async function GET(req: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const isPublic = searchParams.get('public') === '1'
    const now = new Date()

    const isScheduled = searchParams.get('scheduled') === '1'

    const query = isScheduled
      ? { scheduledAt: { $gt: now } }
      : isPublic
      ? { $or: [{ published: true, scheduledAt: null }, { published: true, scheduledAt: { $lte: now } }, { scheduledAt: { $lte: now } }] }
      : {}

    const posts = await Blog.find(query).sort({ createdAt: -1 }).lean()
    return NextResponse.json({ posts })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    await connectDB()
    const post = await Blog.create(body)
    revalidateTag('blog', 'max')
    return NextResponse.json({ post })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { _id, ...body } = await req.json()
    await connectDB()
    const post = await Blog.findByIdAndUpdate(_id, { $set: body }, { new: true })
    revalidateTag('blog', 'max')
    return NextResponse.json({ post })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { _id } = await req.json()
    await connectDB()
    await Blog.findByIdAndDelete(_id)
    revalidateTag('blog', 'max')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
