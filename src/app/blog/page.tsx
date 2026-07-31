import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { siteConfig } from '@/lib/site-config'
import Reveal from '@/components/Reveal'
import BlogFilters from './BlogFilters'

export const metadata: Metadata = {
  title: `Blog | ${siteConfig.business.displayName}`,
  description: 'Artículos sobre entrenamiento, técnica y rendimiento para jugadores de fútbol.',
}

export default async function BlogIndex() {
  const supabase = await createSupabaseServerClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, title, excerpt, category, content, cover_image, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

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

          <BlogFilters posts={posts ?? []} />
        </div>
      </main>
      <Footer />
    </>
  )
}
