import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { connectDB } from '@/lib/mongodb'
import { SiteSettings } from '@/models/SiteSettings'
import { Profile } from '@/models/Profile'
import './globals.css'

export const revalidate = 3600

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'

const DEFAULT_TITLE = 'Full-Stack Developer Portfolio'
const DEFAULT_DESCRIPTION = 'Portfolio of a Full-Stack Developer specializing in modern web technologies'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

async function getSiteSettings() {
  await connectDB()
  const doc = await SiteSettings.findOne().lean()
  return doc ? JSON.parse(JSON.stringify(doc)) : null
}

async function getProfile() {
  await connectDB()
  const doc = await Profile.findOne().lean()
  return doc ? JSON.parse(JSON.stringify(doc)) : null
}

function JsonLd({ name, jobTitle, description, url, avatar, ogImage, email, github, linkedin }: {
  name: string
  jobTitle: string
  description: string
  url: string
  avatar: string | null
  ogImage: string | null
  email?: string
  github?: string
  linkedin?: string
}) {
  const sameAs = [github, linkedin].filter(Boolean)
  const personImage = avatar || ogImage

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${url}/#person`,
        name,
        jobTitle,
        description,
        url,
        ...(personImage && { image: personImage }),
        ...(email && { email }),
        ...(sameAs.length && { sameAs }),
      },
      {
        '@type': 'WebSite',
        '@id': `${url}/#website`,
        url,
        name,
        description,
        publisher: { '@id': `${url}/#person` },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [site, profile] = await Promise.all([getSiteSettings(), getProfile()])
    const metadataBase = new URL(site?.canonicalUrl || BASE_URL)
    const title = site?.seoTitle || DEFAULT_TITLE
    const description = site?.seoDescription || DEFAULT_DESCRIPTION
    const ogImage = site?.ogImage || site?.defaultOgImage || '/og-default.webp'

    return {
      metadataBase,
      title,
      description,
      keywords: site?.seoKeywords || '',
      authors: profile?.name ? [{ name: profile.name, url: '/' }] : undefined,
      alternates: { canonical: '/' },
      openGraph: {
        type: 'website',
        url: '/',
        locale: 'en_US',
        title,
        description,
        siteName: site?.siteName || undefined,
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        site: site?.twitterSite || undefined,
        creator: site?.twitterCreator || undefined,
        title,
        description,
        images: [ogImage],
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
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    }
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [site, profile] = await Promise.all([
    getSiteSettings().catch(() => null),
    getProfile().catch(() => null),
  ])
  const gaId = site?.googleAnalyticsId

  let jsonLdProps = null
  try {
    jsonLdProps = {
      name: profile?.name || 'Portfolio',
      jobTitle: profile?.title || 'Full-Stack Developer',
      description: site?.seoDescription || DEFAULT_DESCRIPTION,
      url: BASE_URL,
      ogImage: site?.ogImage || null,
      avatar: profile?.avatar || null,
      email: profile?.email,
      github: profile?.social?.github,
      linkedin: profile?.social?.linkedin,
    }
  } catch {
    // non-critical — skip if DB is unavailable
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ThemeProvider>
        {jsonLdProps && <JsonLd {...jsonLdProps} />}
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
        </ThemeProvider>
      </body>
    </html>
  )
}
