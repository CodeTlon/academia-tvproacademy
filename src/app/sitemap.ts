import type { MetadataRoute } from 'next'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { posts as postsTable } from '@/db/schema'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tvproacademy.com.ar'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Sin base (build de CI) el sitemap sale solo con las rutas fijas.
  const posts = await db
    .select({ slug: postsTable.slug, updated_at: postsTable.updated_at })
    .from(postsTable)
    .where(eq(postsTable.published, true))
    .catch(() => [])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/entrenamiento`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/nosotros`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contacto`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.7 },
  ]

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...postRoutes]
}
