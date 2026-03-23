import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tenbite Daniel — Full-Stack Developer',
    short_name: 'Tenbite Daniel',
    description: 'Full-Stack Developer specializing in web and mobile apps with Next.js and React Native',
    start_url: '/',
    display: 'standalone',
    background_color: '#17181f',
    theme_color: '#17181f',
    icons: [
      {
        src: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
