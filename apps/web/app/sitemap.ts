import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.traderlabs.in';

  // Only include public landing pages. Do NOT include /dashboard, /trades, /journal, /admin, etc.
  const routes = [
    '',
    '/login',
    '/signup',
    '/about/changelog',
    '/about/contact',
    '/about/privacy',
    '/about/terms',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
