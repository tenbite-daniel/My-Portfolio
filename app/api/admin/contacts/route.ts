import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Contact } from '@/models/Contact'

// GET /api/admin/contacts — all contacts grouped by email
export async function GET() {
  try {
    await connectDB()
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean()

    // Group by email, each group has messages sorted oldest to newest
    const grouped: Record<string, {
      email: string
      name: string
      unreadCount: number
      latestAt: Date
      messages: typeof contacts
    }> = {}

    for (const c of contacts) {
      const key = c.email.toLowerCase()
      if (!grouped[key]) {
        grouped[key] = { email: c.email, name: c.name, unreadCount: 0, latestAt: c.createdAt as Date, messages: [] }
      }
      if (!c.read) grouped[key].unreadCount++
      if ((c.createdAt as Date) > grouped[key].latestAt) {
        grouped[key].latestAt = c.createdAt as Date
        grouped[key].name = c.name
      }
      grouped[key].messages.push(c)
    }

    // Sort messages within each group oldest to newest
    const conversations = Object.values(grouped)
      .sort((a, b) => b.latestAt.getTime() - a.latestAt.getTime())
      .map(g => ({ ...g, messages: g.messages.slice().reverse() }))

    return NextResponse.json({ conversations })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/contacts — mark message(s) as read
export async function PATCH(req: Request) {
  try {
    const { id, email } = await req.json()
    await connectDB()
    if (email) {
      await Contact.updateMany({ email: { $regex: new RegExp(`^${email}$`, 'i') } }, { read: true })
    } else if (id) {
      await Contact.findByIdAndUpdate(id, { read: true })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
