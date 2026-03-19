import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { connectDB } from '@/lib/mongodb'
import { Resume } from '@/models/Resume'
import { resumeData } from '@/lib/portfolio-data'

export async function GET() {
  try {
    await connectDB()
    const doc = await Resume.findOne().lean() as Record<string, unknown> | null
    return NextResponse.json({
      experience: doc?.experience ?? resumeData.experience,
      education: doc?.education ?? resumeData.education,
      skills: doc?.skills ?? resumeData.skills,
      cvUrl: doc?.cvUrl ?? null,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    await connectDB()
    await Resume.findOneAndUpdate({}, { $set: body }, { upsert: true, new: true })
    revalidateTag('resume')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
