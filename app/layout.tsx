import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { connectDB } from '@/lib/mongodb'
import { SiteSettings } from '@/models/SiteSettings'
import { cacheTag } from 'next/cache'
import './globals.css'

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
});

async function getSiteSettings() {
  'use cache'
  cacheTag('site')
  await connectDB()
  const doc = await SiteSettings.findOne().lean()
  return JSON.parse(JSON.stringify(doc))
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const site = await getSiteSettings()
    return {
      title: site?.seoTitle || 'John Doe - Full-Stack Developer',
      description: site?.seoDescription || 'Portfolio of John Doe, a Full-Stack Developer specializing in modern web technologies',
      keywords: site?.seoKeywords || '',
      openGraph: site?.ogImage ? { images: [{ url: site.ogImage }] } : undefined,
      icons: {
        icon: [
          { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
          { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
          { url: '/icon.svg', type: 'image/svg+xml' },
        ],
        apple: '/apple-icon.png',
      },
    }
  } catch {
    return {
      title: 'John Doe - Full-Stack Developer',
      description: 'Portfolio of John Doe, a Full-Stack Developer specializing in modern web technologies',
    }
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
