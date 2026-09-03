// CSP: 'unsafe-inline' en script-src es necesario por el <Script> inline de
// GoogleAnalytics.tsx (gtag consent bootstrap) — pasar a nonces sería más
// estricto pero requiere generar el nonce en middleware.ts y pasarlo a cada
// <Script>, fuera de alcance de un fix de bajo riesgo. connect-src incluye
// el dominio de Supabase (API + Auth); frame-src permite embeds de YouTube
// (Tiptap extension-youtube en el contenido del blog).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // '**' porque el dashboard deja pegar cualquier URL de imagen (portada de
    // blog, drills de metodología) — sin esto, next/image tira 400 apenas el
    // cliente pega una foto que no sea de un dominio pre-listado a mano.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    qualities: [82, 85, 90],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
