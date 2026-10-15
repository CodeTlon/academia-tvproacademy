import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { posts as postsTable } from '@/db/schema'
import PageHeader from '@/components/dashboard/PageHeader'
import PostForm from '../PostForm'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Un id que no es UUID haría fallar la consulta en Postgres: se trata como "no existe".
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound()
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, id)).limit(1)
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
