import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton de Entrenamiento: imita el intro + grilla de metodología. */
export default function Loading() {
  return (
    <div role="status" aria-label="Cargando" className="min-h-screen bg-[#071424] pt-32 pb-24 px-5 md:px-10">
      <span className="sr-only">Cargando…</span>
      <div className="max-w-3xl mx-auto mb-16">
        <Skeleton className="h-4 w-32 mb-4 bg-white/10" />
        <Skeleton className="h-10 w-2/3 mb-6 bg-white/10" />
        <Skeleton className="h-4 w-full mb-2 bg-white/10" />
        <Skeleton className="h-4 w-4/5 mb-6 bg-white/10" />
        <Skeleton className="h-24 w-full rounded-xl bg-white/10" />
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-xl bg-white/10" />
        ))}
      </div>
    </div>
  )
}
