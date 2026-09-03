import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton de Contacto: imita el bloque de instalaciones + la card de reserva. */
export default function Loading() {
  return (
    <div role="status" aria-label="Cargando" className="min-h-screen bg-[#071424] pt-32 pb-24 px-5 md:px-10">
      <span className="sr-only">Cargando…</span>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <Skeleton className="h-10 w-4/5 mb-2 bg-white/10" />
          <Skeleton className="h-10 w-2/3 mb-6 bg-white/10" />
          <Skeleton className="h-4 w-full mb-2 bg-white/10" />
          <Skeleton className="h-4 w-3/4 mb-8 bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 bg-white/10" />
            <Skeleton className="h-5 w-48 bg-white/10" />
            <Skeleton className="h-5 w-36 bg-white/10" />
          </div>
        </div>
        <Skeleton className="h-80 rounded-2xl bg-white/10" />
      </div>
    </div>
  )
}
