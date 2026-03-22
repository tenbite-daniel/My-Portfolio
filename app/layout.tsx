import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
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
    const metadataBase = site?.canonicalUrl ? new URL(site.canonicalUrl) : undefined
    const title = site?.seoTitle || 'John Doe - Full-Stack Developer'
    const description = site?.seoDescription || 'Portfolio of John Doe, a Full-Stack Developer specializing in modern web technologies'
    const ogImage = site?.ogImage || undefined
    return {
      metadataBase,
      title,
      description,
      keywords: site?.seoKeywords || '',
      openGraph: {
        title,
        description,
        siteName: site?.siteName || undefined,
        ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] } : {}),
      },
      twitter: {
        card: (site?.twitterCard as 'summary' | 'summary_large_image') || 'summary_large_image',
        site: site?.twitterSite || undefined,
        creator: site?.twitterCreator || undefined,
        title,
        description,
        ...(ogImage ? { images: [ogImage] } : {}),
      },
      icons: {
        icon: site?.favicon
          ? [{ url: site.favicon }]
          : [
              { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
              { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
              { url: '/icon.svg', type: 'image/svg+xml' },
            ],
        apple: site?.favicon ? site.favicon : '/apple-icon.png',
      },
    }
  } catch {
    return {
      title: 'John Doe - Full-Stack Developer',
      description: 'Portfolio of John Doe, a Full-Stack Developer specializing in modern web technologies',
    }
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const site = await getSiteSettings().catch(() => null)
  const gaId = site?.googleAnalyticsId

  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        <Toaster richColors position="bottom-right" />
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
