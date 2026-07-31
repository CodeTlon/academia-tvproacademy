import Link from 'next/link'
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { deletePostAction } from '@/actions/posts'
import PageHeader from '@/components/dashboard/PageHeader'
import DeleteButton from '@/components/dashboard/DeleteButton'

export default async function BlogListPage() {
  const supabase = await createSupabaseServerClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, category, published, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Blog"
        description="Artículos publicados en /blog."
        actions={
          <Link
            href="/dashboard/blog/nuevo"
            className="inline-flex items-center gap-2 bg-gold text-on-gold px-4 py-2.5 rounded-md font-bold text-sm hover:brightness-95 transition-all active:scale-95"
          >
            <Plus size={16} /> Nuevo artículo
          </Link>
        }
      />

      {!posts || posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Todavía no hay artículos. Creá el primero con &quot;Nuevo artículo&quot;.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm divide-y divide-zinc-100">
          {posts.map((post) => (
            <div key={post.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-zinc-900">{post.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                  {post.category && <span>{post.category}</span>}
                  <span className="inline-flex items-center gap-1">
                    {post.published ? <Eye size={12} className="text-green-600" /> : <EyeOff size={12} />}
                    {post.published ? 'Publicado' : 'Borrador'}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/dashboard/blog/${post.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 border border-zinc-200 px-3 py-2 rounded-md transition-colors"
                >
                  <Pencil size={13} /> Editar
                </Link>
                <form action={deletePostAction}>
                  <input type="hidden" name="id" value={post.id} />
                  <DeleteButton confirmMessage={`¿Eliminar "${post.title}"? Esta acción no se puede deshacer.`} />
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
