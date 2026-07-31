'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { readTime } from '@/lib/utils'
import { focalImageProps } from '@/lib/image-focal'
import Reveal from '@/components/Reveal'

type Post = {
  slug: string
  title: string
  excerpt: string | null
  category: string | null
  content: string
  cover_image: string | null
  created_at: string
}

export default function BlogFilters({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category).filter((c): c is string => !!c))).sort(),
    [posts],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((p) => {
      if (category && p.category !== category) return false
      if (!q) return true
      return p.title.toLowerCase().includes(q) || (p.excerpt ?? '').toLowerCase().includes(q)
    })
  }, [posts, query, category])

  if (posts.length === 0) {
    return <p style={{ color: 'var(--brand-muted)' }}>Todavía no hay artículos publicados.</p>
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--brand-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar artículos..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm bg-transparent outline-none focus:border-[#f5bf00] transition-colors"
            style={{ border: '1px solid var(--brand-border)', color: 'var(--brand-text)' }}
          />
        </div>
        {categories.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors"
              style={
                category === null
                  ? { background: '#f5bf00', color: '#241a00' }
                  : { border: '1px solid var(--brand-border)', color: 'var(--brand-muted)' }
              }
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors"
                style={
                  category === c
                    ? { background: '#f5bf00', color: '#241a00' }
                    : { border: '1px solid var(--brand-border)', color: 'var(--brand-muted)' }
                }
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: 'var(--brand-muted)' }}>No se encontraron artículos con esos filtros.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => (
            <Reveal key={post.slug} delay={(i % 3) * 120}>
              <Link href={`/blog/${post.slug}`} className="card group block overflow-hidden h-full">
                {post.cover_image && (() => {
                  const fp = focalImageProps(post.cover_image)
                  return (
                    <div className="relative aspect-video -m-6 mb-6 overflow-hidden rounded-t-[inherit]">
                      <Image
                        src={fp.src}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={85}
                        style={fp.style}
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )
                })()}
                {post.category && <span className="eyebrow !mb-2 text-xs">{post.category}</span>}
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--brand-heading)' }}>
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm mb-4" style={{ color: 'var(--brand-muted)' }}>
                    {post.excerpt}
                  </p>
                )}
                <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--brand-muted)' }}>
                  {new Date(post.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })} · {readTime(post.content)}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </>
  )
}
