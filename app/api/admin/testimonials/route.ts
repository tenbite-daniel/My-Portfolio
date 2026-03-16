import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Testimony } from '@/models/Testimony'

// GET all testimonials
export async function GET(req: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // 'pending' | 'approved' | null (all)

    const filter = status === 'pending' ? { approved: false } : status === 'approved' ? { approved: true } : {}
    const testimonials = await Testimony.find(filter).sort({ createdAt: -1 })

    return NextResponse.json({ testimonials })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH approve/reject a testimony
export async function PATCH(req: Request) {
  try {
    await connectDB()
    const { id, approved } = await req.json()
    await Testimony.findByIdAndUpdate(id, { approved })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE a testimony
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
