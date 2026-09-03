'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { friendlyError } from '@/lib/friendly-error'
import { sanitizePostContent } from '@/lib/sanitize-html'
import { requireAdmin } from './auth'

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

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  base: string,
  excludeId?: string,
) {
  let slug = base
  let n = 2
  while (true) {
    const { data } = await supabase.from('posts').select('id').eq('slug', slug).limit(1)
    if (!data || data.length === 0) return slug
    if (excludeId && data[0].id === excludeId) return slug
    slug = `${base}-${n++}`
  }
}

export async function createPostAction(_prev: PostState, formData: FormData): Promise<PostState> {
  try {
    await requireAdmin()
    const data = parseForm(formData)
    if (!data.title) return { error: 'El título es obligatorio.' }

    const supabase = await createSupabaseServerClient()
    const slug = await uniqueSlug(supabase, slugify(data.title, { lower: true, strict: true }))

    const { error } = await supabase.from('posts').insert({ ...data, slug })
    if (error) return { error: friendlyError(error, 'No se pudo crear el artículo.') }

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

    const supabase = await createSupabaseServerClient()
    const { data: existing } = await supabase.from('posts').select('slug, title').eq('id', id).single()
    let slug = existing?.slug
    if (existing && existing.title !== data.title) {
      slug = await uniqueSlug(supabase, slugify(data.title, { lower: true, strict: true }), id)
    }

    const { error } = await supabase
      .from('posts')
      .update({ ...data, slug, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { error: friendlyError(error, 'No se pudo guardar el artículo.') }

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
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw new Error(friendlyError(error, 'No se pudo eliminar el artículo.'))
  revalidatePath('/blog')
  redirect('/dashboard/blog?saved=deleted')
}
