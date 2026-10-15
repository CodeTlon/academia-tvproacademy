'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { and, eq, ne } from 'drizzle-orm'
import { db } from '@/lib/db'
import { posts } from '@/db/schema'
import { friendlyError } from '@/lib/friendly-error'
import { sanitizePostContent } from '@/lib/sanitize-html'
import { requireAdmin } from '@/lib/session'

export type PostState = { error?: string } | undefined

function parseForm(formData: FormData) {
  return {
    title: String(formData.get('title') ?? '').trim(),
    excerpt: String(formData.get('excerpt') ?? '').trim() || null,
    // Sanitizado acá, antes de que llegue a la DB — el editor Tiptap manda HTML
    // crudo (editor.getHTML()) y esto es lo único que se sirve luego sin escapar
    // (dangerouslySetInnerHTML en blog/[slug]/page.tsx). Ver lib/sanitize-html.ts.
    content: sanitizePostContent(String(formData.get('content') ?? '')),
    cover_image: String(formData.get('cover_image') ?? '').trim() || null,
    category: String(formData.get('category') ?? '').trim() || null,
    published: formData.get('published') === 'on',
  }
}

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base
  let n = 2
  while (true) {
    const rows = await db.select({ id: posts.id }).from(posts).where(excludeId ? and(eq(posts.slug, slug), ne(posts.id, excludeId)) : eq(posts.slug, slug)).limit(1)
    if (rows.length === 0) return slug
    slug = `${base}-${n++}`
  }
}

export async function createPostAction(_prev: PostState, formData: FormData): Promise<PostState> {
  try {
    await requireAdmin()
    const data = parseForm(formData)
    if (!data.title) return { error: 'El título es obligatorio.' }

    const slug = await uniqueSlug(slugify(data.title, { lower: true, strict: true }))
    await db.insert(posts).values({ ...data, slug })

    revalidatePath('/blog')
  } catch (e) {
    return { error: friendlyError(e, 'No se pudo crear el artículo.') }
  }
  redirect('/dashboard/blog?saved=created')
}

export async function updatePostAction(id: string, _prev: PostState, formData: FormData): Promise<PostState> {
  try {
    await requireAdmin()
    const data = parseForm(formData)
    if (!data.title) return { error: 'El título es obligatorio.' }

    const [existing] = await db.select({ slug: posts.slug, title: posts.title }).from(posts).where(eq(posts.id, id)).limit(1)
    if (!existing) return { error: 'No se encontró el artículo.' }
    let slug = existing.slug
    if (existing.title !== data.title) {
      slug = await uniqueSlug(slugify(data.title, { lower: true, strict: true }), id)
    }
    await db.update(posts).set({ ...data, slug, updated_at: new Date().toISOString() }).where(eq(posts.id, id))

    revalidatePath('/blog')
    if (slug) revalidatePath(`/blog/${slug}`)
  } catch (e) {
    return { error: friendlyError(e, 'No se pudo guardar el artículo.') }
  }
  redirect('/dashboard/blog?saved=updated')
}

export async function deletePostAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await requireAdmin()
  try {
    await db.delete(posts).where(eq(posts.id, id))
  } catch (e) {
    throw new Error(friendlyError(e, 'No se pudo eliminar el artículo.'))
  }
  revalidatePath('/blog')
  redirect('/dashboard/blog?saved=deleted')
}
