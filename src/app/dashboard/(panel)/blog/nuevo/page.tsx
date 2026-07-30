import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import PostForm from '../PostForm'

export default function NewPostPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/blog" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6">
        <ArrowLeft size={14} /> Volver al blog
      </Link>
      <PageHeader title="Nuevo artículo" />
      <PostForm />
    </div>
  )
}
