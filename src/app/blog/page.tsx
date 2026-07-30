import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { readTime } from '@/lib/utils'
import { demoConfig } from '@/lib/demo-config'
import Reveal from '@/components/Reveal'

export const metadata: Metadata = {
  title: `Blog | ${demoConfig.business.displayName}`,
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

          {!posts || posts.length === 0 ? (
            <p style={{ color: 'var(--demo-muted)' }}>Todavía no hay artículos publicados.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <Reveal key={post.slug} delay={(i % 3) * 120}>
                  <Link href={`/blog/${post.slug}`} className="card group block overflow-hidden h-full">
                    {post.cover_image && (
                      <div className="relative aspect-video -m-6 mb-6 overflow-hidden rounded-t-[inherit]">
                        <Image
                          src={post.cover_image}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          quality={85}
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    )}
                    {post.category && <span className="eyebrow !mb-2 text-xs">{post.category}</span>}
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--demo-heading)' }}>
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm mb-4" style={{ color: 'var(--demo-muted)' }}>
                        {post.excerpt}
                      </p>
                    )}
                    <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--demo-muted)' }}>
                      {new Date(post.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })} · {readTime(post.content)}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
