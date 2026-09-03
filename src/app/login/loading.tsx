// Blindaje: evita que el nuevo `src/app/loading.tsx` (skeleton del sitio
// público) se filtre al login. Sin fallback propio antes de este cambio, así
// que `null` preserva el comportamiento previo.
export default function Loading() {
  return null
}
