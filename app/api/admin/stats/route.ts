import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Testimony } from '@/models/Testimony'
import { Project } from '@/models/Project'
import { Blog } from '@/models/Blog'

export async function GET() {
  try {
    await connectDB()

    const [pendingTestimonials, approvedTestimonials, totalProjects, totalBlogs] = await Promise.all([
      Testimony.countDocuments({ approved: false }),
      Testimony.countDocuments({ approved: true }),
      Project.countDocuments(),
      Blog.countDocuments(),
    ])

    return NextResponse.json({
      pendingTestimonials,
      approvedTestimonials,
      totalProjects,
      totalBlogs,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
