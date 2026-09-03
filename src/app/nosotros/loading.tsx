import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton de Nosotros: imita el bloque fundador (texto + foto) y la grilla de valores. */
export default function Loading() {
  return (
    <div role="status" aria-label="Cargando" className="min-h-screen bg-[#071424] pt-32 pb-24 px-5 md:px-10">
      <span className="sr-only">Cargando…</span>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
        <div>
          <Skeleton className="h-10 w-3/4 mb-2 bg-white/10" />
          <Skeleton className="h-10 w-1/2 mb-6 bg-white/10" />
          <Skeleton className="h-4 w-full mb-2 bg-white/10" />
          <Skeleton className="h-4 w-full mb-2 bg-white/10" />
          <Skeleton className="h-4 w-2/3 bg-white/10" />
        </div>
        <Skeleton className="aspect-[4/5] w-full rounded-2xl bg-white/10" />
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl bg-white/10" />
        ))}
      </div>
    </div>
  )
}
