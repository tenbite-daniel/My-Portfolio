import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { connectDB } from '@/lib/mongodb'
import { CaseStudy } from '@/models/CaseStudy'

export async function GET() {
  try {
    await connectDB()
    const studies = await CaseStudy.find().sort({ order: 1 }).lean()
    return NextResponse.json({ studies })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    await connectDB()
    const count = await CaseStudy.countDocuments()
    const study = await CaseStudy.create({ ...body, order: count })
    revalidatePath('/', 'layout')
    return NextResponse.json({ study })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, ...body } = await req.json()
    await connectDB()
    const study = await CaseStudy.findByIdAndUpdate(id, body, { returnDocument: 'after' }).lean()
    revalidatePath('/', 'layout')
    return NextResponse.json({ study })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    await connectDB()
    await CaseStudy.findByIdAndDelete(id)
    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
