import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { connectDB } from '@/lib/mongodb'
import { Testimony } from '@/models/Testimony'

// Public: submit a new testimony
export async function POST(req: Request) {
  try {
    await connectDB()
    const { name, email, text, avatar } = await req.json()
    if (!name || !email || !text) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const testimony = await Testimony.create({ name, email, text, avatar, status: 'pending' })
    return NextResponse.json({ testimony }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Admin: get testimonials by status
export async function GET(req: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const filter = status === 'pending'
      ? { $or: [{ status: 'pending' }, { status: { $exists: false } }] }
      : status ? { status } : {}
    const testimonials = await Testimony.find(filter).sort({ createdAt: -1 })
    return NextResponse.json({ testimonials })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Admin: update status
export async function PATCH(req: Request) {
  try {
    await connectDB()
    const { id, status } = await req.json()
    const testimony = await Testimony.findByIdAndUpdate(id, { status }, { new: true })
    if (status === 'approved') revalidateTag('testimonials')
    return NextResponse.json({ testimony })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Admin: delete
export async function DELETE(req: Request) {
  try {
    await connectDB()
    const { id } = await req.json()
    await Testimony.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
