import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { connectDB } from '@/lib/mongodb'
import { Profile } from '@/models/Profile'
import { SiteSettings } from '@/models/SiteSettings'

export async function GET() {
  try {
    await connectDB()
    const [profile, site] = await Promise.all([
      Profile.findOne().lean(),
      SiteSettings.findOne().lean(),
    ])
    return NextResponse.json({ profile, site })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { section, data } = await req.json()
    await connectDB()

    if (section === 'profile') {
      const profile = await Profile.findOneAndUpdate({}, data, { upsert: true, returnDocument: 'after' })
      revalidateTag('profile', 'max')
      return NextResponse.json({ profile })
    }

    if (section === 'site') {
      const site = await SiteSettings.findOneAndUpdate({}, data, { upsert: true, returnDocument: 'after' })
      revalidateTag('site', 'max')
      return NextResponse.json({ site })
    }

    return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
