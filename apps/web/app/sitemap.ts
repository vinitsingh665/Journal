import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.traderlabs.in';
  const buildDate = new Date('2026-10-22');

  const routes: {
    path: string;
    priority: number;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    lastModified: Date;
  }[] = [
    { path: '', priority: 1.0, changeFrequency: 'weekly', lastModified: buildDate },
    { path: '/login', priority: 0.8, changeFrequency: 'monthly', lastModified: buildDate },
    { path: '/signup', priority: 0.9, changeFrequency: 'monthly', lastModified: buildDate },
    { path: '/about/faq', priority: 0.8, changeFrequency: 'weekly', lastModified: buildDate },
    { path: '/about/changelog', priority: 0.7, changeFrequency: 'weekly', lastModified: buildDate },
    { path: '/about/contact', priority: 0.6, changeFrequency: 'monthly', lastModified: buildDate },
    { path: '/about/privacy', priority: 0.4, changeFrequency: 'yearly', lastModified: new Date('2026-08-01') },
    { path: '/about/terms', priority: 0.4, changeFrequency: 'yearly', lastModified: new Date('2026-08-01') },
    { path: '/about/bug-report', priority: 0.5, changeFrequency: 'monthly', lastModified: buildDate },
  ];

  return routes.map((item) => ({
    url: `${baseUrl}${item.path}`,
    lastModified: item.lastModified,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));
}
