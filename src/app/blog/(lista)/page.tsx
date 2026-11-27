import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { posts as postsTable } from '@/db/schema'
import { siteConfig } from '@/lib/site-config'
import Reveal from '@/components/Reveal'
import PublicExtras from '@/components/layout/PublicExtras'
import BlogFilters from './BlogFilters'

export const metadata: Metadata = {
  title: `Blog | ${siteConfig.business.displayName}`,
  description: 'Artículos sobre entrenamiento, técnica y rendimiento para jugadores de fútbol.',
}

export default async function BlogIndex() {
  const posts = await db
    .select({ slug: postsTable.slug, title: postsTable.title, excerpt: postsTable.excerpt, category: postsTable.category, content: postsTable.content, cover_image: postsTable.cover_image, created_at: postsTable.created_at })
    .from(postsTable)
    .where(eq(postsTable.published, true))
    .orderBy(desc(postsTable.created_at))

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 px-5 md:px-10">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <p className="eyebrow">Recursos</p>
            <h1 className="section-title text-4xl md:text-5xl">Blog & Artículos</h1>
            <p className="section-subtitle mb-16">
              Notas sobre técnica, agilidad y toma de decisiones para jugadores que buscan dar el salto de calidad.
            </p>
          </Reveal>

          <BlogFilters posts={posts} />
        </div>
      </main>
      <PublicExtras />
      <Footer />
    </>
  )
}
