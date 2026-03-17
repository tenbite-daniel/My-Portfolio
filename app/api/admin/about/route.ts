import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { About } from '@/models/About'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await connectDB()
    const about = await About.findOne().lean()
    return NextResponse.json({ about })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    await connectDB()
    const collection = mongoose.connection.db!.collection('abouts')
    const result = await collection.findOneAndUpdate(
      {},
      { $set: body },
      { upsert: true, returnDocument: 'after' }
    )
    return NextResponse.json({ about: result })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
