import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import PageHeader from '@/components/dashboard/PageHeader'
import PostForm from '../PostForm'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: post } = await supabase.from('posts').select('*').eq('id', id).single()
  if (!post) notFound()

  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/blog" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6">
        <ArrowLeft size={14} /> Volver al blog
      </Link>
      <PageHeader title="Editar artículo" />
      <PostForm post={post} />
    </div>
  )
}
