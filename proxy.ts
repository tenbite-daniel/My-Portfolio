import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { MongoClient } from 'mongodb'

let client: MongoClient | null = null
async function getMaintenanceMode(): Promise<boolean> {
  try {
    if (!client) client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    const doc = await client.db().collection('sitesettings').findOne({}, { projection: { maintenanceMode: 1, maintenanceEndsAt: 1 } })
    if (!doc?.maintenanceMode) return false
    if (doc.maintenanceEndsAt && new Date(doc.maintenanceEndsAt) <= new Date()) return false
    return true
  } catch {
    return false
  }
}

export async function proxy(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const isAdminSubdomain = host.startsWith('admin.')
  const { pathname } = req.nextUrl

  // On admin subdomain, rewrite root to /admin
  if (isAdminSubdomain) {
    const rewrittenPath = pathname === '/' ? '/admin' : `/admin${pathname}`
    req.nextUrl.pathname = rewrittenPath
    return NextResponse.rewrite(req.nextUrl)
  }

  // Skip API routes and login page
  if (pathname.startsWith('/api/') || pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    const valid = verifyToken(token)
    if (!valid) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return NextResponse.next()
  }

  // Maintenance mode
  if (pathname !== '/maintenance') {
    const maintenanceMode = await getMaintenanceMode()
    if (maintenanceMode) {
      return NextResponse.rewrite(new URL('/maintenance', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)'],
}
