import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { Admin } from '@/models/Admin'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    const payload = token ? verifyToken(token) : null
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { currentPassword, newEmail, newPassword } = await req.json()
    await connectDB()

    const admin = await Admin.findOne({ email: payload.email })
    if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 })

    const valid = await bcrypt.compare(currentPassword, admin.password)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

    if (newEmail) admin.email = newEmail
    if (newPassword) admin.password = await bcrypt.hash(newPassword, 12)
    await admin.save()

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
