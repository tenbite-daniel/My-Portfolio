import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(req: Request) {
  try {
    const { data, folder = 'portfolio/avatar', public_id = 'profile-avatar', resource_type = 'image' } = await req.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (cloudinary.uploader as any).upload(data, { folder, overwrite: true, public_id, resource_type })
    return NextResponse.json({ url: result.secure_url })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
