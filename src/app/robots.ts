import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tvproacademy.com.ar'

// Fuera de producción (test, previews) no se indexa nada: test comparte contenido con el sitio real.
const ES_PRODUCCION = (() => {
  try {
    return new URL(SITE_URL).hostname === 'tvproacademy.com.ar'
  } catch {
    return false
  }
})()

export default function robots(): MetadataRoute.Robots {
  if (!ES_PRODUCCION) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/portal', '/login'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
