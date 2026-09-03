import PageSkeleton from '@/components/dashboard/PageSkeleton'

// Blindaje: el nuevo `src/app/loading.tsx` (skeleton de marca del sitio público)
// es el fallback de Suspense de TODO el árbol si un segmento no tiene el suyo.
// Sin este archivo, navegar al panel mostraría el skeleton navy del sitio
// público en vez de la UI del CMS. Activa PageSkeleton (ya existía, sin usar).
export default function Loading() {
  return <PageSkeleton />
}
