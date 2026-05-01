import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { SiteSettings } from '@/models/SiteSettings'

export async function GET() {
  try {
    await connectDB()
    const site = await SiteSettings.findOne().lean() as {
      maintenanceMode?: boolean
      maintenanceEndsAt?: Date | null
    } | null

    if (!site) return NextResponse.json({ maintenanceMode: false, maintenanceEndsAt: null })

    const endsAt = site.maintenanceEndsAt ? new Date(site.maintenanceEndsAt) : null
    const expired = endsAt && endsAt <= new Date()

    // Auto-disable if timer has expired
    if (site.maintenanceMode && expired) {
      await SiteSettings.findOneAndUpdate({}, { $set: { maintenanceMode: false, maintenanceEndsAt: null } })
      return NextResponse.json({ maintenanceMode: false, maintenanceEndsAt: null })
    }

    return NextResponse.json({
      maintenanceMode: site.maintenanceMode ?? false,
      maintenanceEndsAt: endsAt ? endsAt.toISOString() : null,
    })
  } catch {
    return NextResponse.json({ maintenanceMode: false, maintenanceEndsAt: null })
  }
}
