import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Resume } from '@/models/Resume'

export async function GET(req: Request) {
  try {
    await connectDB()
    const doc = await Resume.findOne().lean() as Record<string, unknown> | null
    const cvUrl = doc?.cvUrl as string | undefined

    if (!cvUrl) {
      return NextResponse.json({ error: 'No CV uploaded' }, { status: 404 })
    }

    const response = await fetch(cvUrl)
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch CV' }, { status: 502 })
    }

    const preview = new URL(req.url).searchParams.get('preview') === '1'
    const buffer = await response.arrayBuffer()
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': preview
          ? 'inline; filename="Tenbite Daniel Resume.pdf"'
          : 'attachment; filename="Tenbite Daniel Resume.pdf"',
        'Cache-Control': 'no-cache',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
