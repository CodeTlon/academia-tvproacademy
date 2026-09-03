interface JsonLdProps {
  data: Record<string, unknown>
}

/** Inyecta un bloque `<script type="application/ld+json">`. Patrón clonado de
 * codetlon-site/src/components/seo/JsonLd.tsx: componente genérico que recibe
 * el objeto schema ya armado, sin acoplarse a un tipo de schema en particular. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
