import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton de home: imita el hero (título + bullets + CTA) y la grilla de QuickLinks. */
export default function Loading() {
  return (
    <div role="status" aria-label="Cargando" className="min-h-screen bg-[#071424] pt-32 pb-24 px-5 md:px-10">
      <span className="sr-only">Cargando…</span>
      <div className="max-w-3xl mx-auto md:mx-0">
        <Skeleton className="h-14 md:h-20 w-4/5 mb-4 bg-white/10" />
        <Skeleton className="h-14 md:h-20 w-3/5 mb-8 bg-white/10" />
        <div className="space-y-3 mb-10">
          <Skeleton className="h-6 w-56 bg-white/10" />
          <Skeleton className="h-6 w-64 bg-white/10" />
          <Skeleton className="h-6 w-48 bg-white/10" />
        </div>
        <Skeleton className="h-14 w-48 rounded-full bg-white/10" />
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl bg-white/10" />
        ))}
      </div>
    </div>
  )
}
