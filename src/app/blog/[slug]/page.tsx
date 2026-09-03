import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { sanitizePostContent } from '@/lib/sanitize-html'
import { getSiteSettings } from '@/lib/site-settings'
import { focalImageProps } from '@/lib/image-focal'
import { readTime, waLink } from '@/lib/utils'
import { siteConfig } from '@/lib/site-config'
import PublicExtras from '@/components/layout/PublicExtras'
import ShareButton from '@/components/ui/ShareButton'
import TLDRBox from '@/components/ui/TLDRBox'

/** Puntos clave del TLDRBox a partir del excerpt del post (sin campo dedicado
 * en el schema de `posts` — se deriva por oración para no requerir migración). */
function tldrFromExcerpt(excerpt: string | null): string[] {
  if (!excerpt) return []
  return excerpt
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const { data: post } = await supabase.from('posts').select('title, excerpt').eq('slug', slug).eq('published', true).single()
  if (!post) return {}
  return { title: `${post.title} | ${siteConfig.business.displayName}`, description: post.excerpt ?? undefined }
}

export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const { data: post } = await supabase.from('posts').select('*').eq('slug', slug).eq('published', true).single()
  if (!post) notFound()

  const { data: related } = await supabase
    .from('posts')
    .select('slug, title, category')
    .eq('published', true)
    .neq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(3)

  const { business } = await getSiteSettings()

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 px-5 md:px-10">
        <article className="max-w-3xl mx-auto">
          <Link href="/blog" className="flex w-fit items-center gap-2 text-sm font-semibold mb-8" style={{ color: 'var(--brand-accent)' }}>
            <ArrowLeft size={16} />
            Volver al blog
          </Link>

          {post.category && <span className="eyebrow text-xs">{post.category}</span>}
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase mb-4" style={{ color: 'var(--brand-heading)' }}>
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="text-sm" style={{ color: 'var(--brand-muted)' }}>
              {new Date(post.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })} · {readTime(post.content)}
            </div>
            <ShareButton title={post.title} />
          </div>

          <TLDRBox points={tldrFromExcerpt(post.excerpt)} />

          {post.cover_image && (() => {
            const fp = focalImageProps(post.cover_image)
            return (
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-10">
                <Image src={fp.src} alt={post.title} fill sizes="100vw" quality={85} priority style={fp.style} className="object-cover" />
              </div>
            )
          })()}

          <div
            className="prose-post text-lg leading-relaxed"
            style={{ color: 'var(--brand-text)' }}
            // Segunda capa de sanitización (además de posts.ts al guardar): cubre
            // filas ya existentes en la DB de antes de este fix, y cualquier fila
            // escrita por fuera de esta Server Action (ej. API REST directa).
            dangerouslySetInnerHTML={{ __html: sanitizePostContent(post.content) }}
          />

          <div className="card mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-semibold" style={{ color: 'var(--brand-heading)' }}>¿Querés entrenar con nosotros?</p>
            <a href={waLink(business.whatsapp, `Hola! Leí el artículo "${post.title}" y quiero más info`)} className="btn-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071424]">
              <WhatsAppIcon size={18} />
              Escribinos
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm font-semibold">
            <Link href="/entrenamiento" className="hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00] rounded-md" style={{ color: 'var(--brand-accent)' }}>
              Ver metodología de entrenamiento
            </Link>
            <Link href="/contacto" className="hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00] rounded-md" style={{ color: 'var(--brand-accent)' }}>
              Reservar un turno
            </Link>
          </div>
        </article>

        {related && related.length > 0 && (
          <div className="max-w-6xl mx-auto mt-20">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--brand-heading)' }}>Más artículos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="card block hover:scale-[1.02] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00]">
                  {r.category && <span className="eyebrow !mb-2 text-xs">{r.category}</span>}
                  <h3 className="font-bold" style={{ color: 'var(--brand-heading)' }}>{r.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <PublicExtras />
      <Footer />
    </>
  )
}
