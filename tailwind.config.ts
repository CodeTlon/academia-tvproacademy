import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Estos tokens son leídos desde CSS variables definidas en globals.css
        // que a su vez son seteadas por demo-config.ts via layout.tsx
        demo: {
          bg: 'var(--demo-bg)',
          surface: 'var(--demo-surface)',
          'surface-alt': 'var(--demo-surface-alt)',
          heading: 'var(--demo-heading)',
          text: 'var(--demo-text)',
          muted: 'var(--demo-muted)',
          border: 'var(--demo-border)',
          accent: 'var(--demo-accent)',
          'on-accent': 'var(--demo-on-accent)',
          structural: 'var(--demo-structural)',
          'on-structural': 'var(--demo-on-structural)',
        },
        // Paleta fija del panel /dashboard (admin CMS) — no depende de las CSS
        // vars de demo-config.ts, siempre son los mismos colores de marca
        // reales de TV Pro Academy, sin importar el tema del sitio público.
        gold: {
          DEFAULT: '#f5bf00',
          dark: '#d9a600',
        },
        'on-gold': '#241a00',
      },
      fontFamily: {
        demo: ['var(--demo-font)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
