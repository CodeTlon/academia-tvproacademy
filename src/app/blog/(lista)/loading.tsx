import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton del índice del blog. Vive en el grupo `(lista)` para no envolver a
 * `/blog/[slug]`: con un loading.tsx encima, el artículo empieza a streamear antes
 * de `notFound()` y un slug inexistente respondía 200 en vez de 404. */
export default function Loading() {
  return (
    <div role="status" aria-label="Cargando" className="min-h-screen bg-[#071424] pt-32 pb-24 px-5 md:px-10">
      <span className="sr-only">Cargando…</span>
      <div className="max-w-6xl mx-auto">
        <Skeleton className="h-4 w-24 mb-4 bg-white/10" />
        <Skeleton className="h-10 w-1/2 mb-4 bg-white/10" />
        <Skeleton className="h-4 w-2/3 mb-16 bg-white/10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  )
}
