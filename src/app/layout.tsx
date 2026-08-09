import type { Metadata } from 'next'
import { Inter, Playfair_Display, Montserrat, Roboto, Lato, Open_Sans, Poppins, Raleway, Oswald, Nunito } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/lib/site-config'

// Fuentes pre-cargadas disponibles para el sitio
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-roboto' })
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato' })
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-opensans' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-poppins' })
const raleway = Raleway({ subsets: ['latin'], variable: '--font-raleway' })
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' })
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })

const FONT_MAP: Record<string, string> = {
  'Inter': '--font-inter',
  'Playfair Display': '--font-playfair',
  'Montserrat': '--font-montserrat',
  'Roboto': '--font-roboto',
  'Lato': '--font-lato',
  'Open Sans': '--font-opensans',
  'Poppins': '--font-poppins',
  'Raleway': '--font-raleway',
  'Oswald': '--font-oswald',
  'Nunito': '--font-nunito',
}

const title = `${siteConfig.business.displayName} | Entrená Como un Profesional`

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tvproacademy.com.ar',
  ),
  title,
  description: siteConfig.business.tagline,
  alternates: { canonical: '/' },
  icons: { icon: '/icon.png', apple: '/apple-touch-icon.png' },
  openGraph: {
    title,
    description: siteConfig.business.tagline,
    type: 'website',
    locale: 'es_AR',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: siteConfig.business.tagline,
    images: ['/images/og-image.jpg'],
  },
}

const RADIUS_MAP: Record<string, [string, string]> = {
  sharp: ['0.25rem', '0.5rem'],   // industrial / brutalista
  soft:  ['0.5rem', '0.75rem'],
  round: ['0.75rem', '1rem'],     // suave / luxury (default)
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { brand, style } = siteConfig
  const fontVar = FONT_MAP[brand.font] ?? '--font-inter'
  const [radius, radiusLg] = RADIUS_MAP[style.radius] ?? RADIUS_MAP.round

  const cssVars = {
    '--brand-bg': brand.background,
    '--brand-surface': brand.surface,
    '--brand-surface-alt': brand.surfaceAlt,
    '--brand-heading': brand.heading,
    '--brand-text': brand.text,
    '--brand-muted': brand.muted,
    '--brand-border': brand.border,
    '--brand-accent': brand.accent,
    '--brand-on-accent': brand.onAccent,
    '--brand-structural': brand.structural,
    '--brand-on-structural': brand.onStructural,
    '--brand-font': `var(${fontVar})`,
    '--brand-radius': radius,
    '--brand-radius-lg': radiusLg,
  } as React.CSSProperties

  const allFontVars = [
    inter.variable,
    playfair.variable,
    montserrat.variable,
    roboto.variable,
    lato.variable,
    openSans.variable,
    poppins.variable,
    raleway.variable,
    oswald.variable,
    nunito.variable,
  ].join(' ')

  return (
    <html lang="es" className={allFontVars} data-cards={style.cards} style={cssVars}>
      <body>
        {children}
      </body>
    </html>
  )
}
