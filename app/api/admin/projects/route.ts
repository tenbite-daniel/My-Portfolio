import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'

export async function GET() {
  try {
    await connectDB()
    const projects = await Project.find().sort({ order: 1, createdAt: -1 }).lean()
    return NextResponse.json({ projects })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    await connectDB()
    const project = await Project.create(body)
    revalidatePath('/', 'layout')
    return NextResponse.json({ project })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { _id, ...body } = await req.json()
    await connectDB()
    const project = await Project.findByIdAndUpdate(_id, { $set: body }, { new: true })
    revalidatePath('/', 'layout')
    return NextResponse.json({ project })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { _id } = await req.json()
    await connectDB()
    await Project.findByIdAndDelete(_id)
    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
