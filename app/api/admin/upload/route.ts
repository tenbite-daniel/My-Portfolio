import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(req: Request) {
  try {
    const { data, folder = 'portfolio/avatar', public_id = 'profile-avatar' } = await req.json()
    const result = await cloudinary.uploader.upload(data, { folder, overwrite: true, public_id })
    return NextResponse.json({ url: result.secure_url })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
