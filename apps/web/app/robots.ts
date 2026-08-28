import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/dashboard/*',
        '/journal',
        '/journal/*',
        '/settings',
        '/settings/*',
        '/api/*',
        '/shared/*', // Publicly shared links are not indexed by default to protect privacy
      ],
    },
    sitemap: 'https://traderlabs.in/sitemap.xml',
  }
}
