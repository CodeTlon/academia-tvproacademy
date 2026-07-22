import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { blogPosts, getPostBySlug } from '@/lib/blog-data'
import { demoConfig } from '@/lib/demo-config'
import { waLink } from '@/lib/utils'

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return { title: `${post.title} | ${demoConfig.business.displayName}`, description: post.excerpt }
}

export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const { business } = demoConfig
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3)

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 px-5 md:px-10">
        <article className="max-w-3xl mx-auto">
          <Link href="/blog" className="flex w-fit items-center gap-2 text-sm font-semibold mb-8" style={{ color: 'var(--demo-accent)' }}>
            <ArrowLeft size={16} />
            Volver al blog
          </Link>

          <span className="eyebrow text-xs">{post.category}</span>
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase mb-4" style={{ color: 'var(--demo-heading)' }}>
            {post.title}
          </h1>
          <div className="text-sm mb-8" style={{ color: 'var(--demo-muted)' }}>
            {new Date(post.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })} · {post.readTime}
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden mb-10">
            <Image src={post.image} alt={post.title} fill sizes="100vw" quality={85} priority className="object-cover" />
          </div>

          <div className="space-y-6 text-lg leading-relaxed" style={{ color: 'var(--demo-text)' }}>
            {post.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="card mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-semibold" style={{ color: 'var(--demo-heading)' }}>¿Querés entrenar con nosotros?</p>
            <a href={waLink(business.whatsapp, `Hola! Leí el artículo "${post.title}" y quiero más info`)} className="btn-primary">
              <WhatsAppIcon size={18} />
              Escribinos
            </a>
          </div>
        </article>

        {related.length > 0 && (
          <div className="max-w-6xl mx-auto mt-20">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--demo-heading)' }}>Más artículos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="card block">
                  <span className="eyebrow !mb-2 text-xs">{r.category}</span>
                  <h3 className="font-bold" style={{ color: 'var(--demo-heading)' }}>{r.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
