import { ListChecks } from 'lucide-react'

/** Caja de "puntos clave" arriba de contenido largo (blog posts, página Entrenamiento). */
export default function TLDRBox({ title = 'En resumen', points }: { title?: string; points: string[] }) {
  if (points.length === 0) return null

  return (
    <div
      className="rounded-xl border p-6 mb-10"
      style={{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <ListChecks size={18} className="text-gold" />
        <span className="text-xs font-bold uppercase tracking-widest text-gold">{title}</span>
      </div>
      <ul className="space-y-2">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: 'var(--brand-text)' }}>
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  )
}
