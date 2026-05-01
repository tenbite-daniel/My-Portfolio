import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { About } from '@/models/About'
import { Resume } from '@/models/Resume'

export async function GET() {
  try {
    await connectDB()
    const [about, resume] = await Promise.all([
      About.findOne({}, { showBlog: 1, showCaseStudies: 1 }).lean() as Promise<{ showBlog?: boolean; showCaseStudies?: boolean } | null>,
      Resume.findOne({}, { cvUrl: 1 }).lean() as Promise<{ cvUrl?: string } | null>,
    ])
    return NextResponse.json({
      showBlog: about?.showBlog !== false,
      showCaseStudies: about?.showCaseStudies !== false,
      cvUrl: resume?.cvUrl ?? null,
    }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json({ showBlog: true, showCaseStudies: true, cvUrl: null })
  }
}
