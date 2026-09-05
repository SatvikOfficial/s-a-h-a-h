import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const routes: MetadataRoute.Sitemap = [
    // Homepage — primary landing, updated weekly with festivals/news
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Sanhita (code of conduct) — static reference content
    {
      url: absoluteUrl('/sanhita'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Blog — updated periodically with articles
    {
      url: absoluteUrl('/blog'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // News — refreshed frequently (Google News RSS)
    {
      url: absoluteUrl('/news'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Reporting — member registration / intruder reporting
    {
      url: absoluteUrl('/reporting'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Legal pages — rarely change
    {
      url: absoluteUrl('/terms'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/privacy'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  return routes
}
