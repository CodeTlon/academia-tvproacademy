// ============================================================
// ARCHIVO PRINCIPAL DE CONFIGURACIÓN DEL SITIO
// Editá solo este archivo para personalizar el sitio (fallback de site_settings).
// Diseño leído 1:1 de client-assets/tvproacademy (Stitch export
// "landing_page_tvpro_academy" + DESIGN.md "Gold Strike Performance").
// ============================================================

export const siteConfig = {

  // ── Información del negocio ──────────────────────────────
  business: {
    name: 'TVPRO ACADEMY',
    displayName: 'TV Pro Academy',
    tagline: 'Entrenamiento específico para jugadores que buscan dar el salto de calidad.',
    phone: '+3516577504',
    email: 'hola@tvproacademy.com',
    address: 'Benito Soria esq. Belgrano, Barrio Vélez Sarsfield, Córdoba',
    whatsapp: '5493516577504',
  },

  // ── Identidad visual (tokens semánticos) ──────────────────
  // Mapeados desde DESIGN.md "Gold Strike Performance": dark mode,
  // navy profundo + dorado de alta energía, bordes 1px en vez de sombras.
  brand: {
    background:   '#071424',
    surface:      '#0e1b2c',
    surfaceAlt:   '#142031',
    heading:      '#ffffff',
    text:         '#d7e3fa',
    muted:        '#a9b7cc',
    border:       'rgba(255,255,255,0.1)',
    accent:       '#f5bf00',
    onAccent:     '#241a00',
    structural:   '#071424',
    onStructural: '#ffffff',
    font: 'Montserrat',
  },

  // ── Lenguaje visual ──────────────────────────────────────
  style: {
    theme:  'dark' as 'light' | 'dark',
    radius: 'soft' as 'sharp' | 'soft' | 'round',
    cards:  'border' as 'shadow' | 'border' | 'glass',
  },

  // ── Imágenes (locales, descargadas del export de Stitch) ──
  images: {
    hero: '/images/hero.webp',
    about: '/images/founder.webp',
    gallery: [
      '/images/footwork.webp',
      '/images/control-balon.webp',
      '/images/decisiones.webp',
    ],
  },

  // ── Contenido editable ───────────────────────────────────
  content: {

    hero: {
      title: 'Entrená como',
      titleAccent: 'un profesional',
      bullets: ['Técnica individual', 'Velocidad y coordinación', 'Toma de decisiones'],
      videoDesktop: '/videos/hero-desktop.mp4',
      videoMobile: '/videos/hero-mobile.mp4',
    },

    about: {
      eyebrow: 'Conocé a',
      founderName: 'Tomás Varela',
      role: 'Fundador y Entrenador',
      body: 'Sumate a TVPro y empezá a mejorar tu juego. Nuestra academia nació con la visión de acercar el entrenamiento de élite a jugadores que buscan dar el salto de calidad. No importa en qué liga juegues, si tenés la disciplina, nosotros te damos las herramientas.',
      badge: 'Experiencia Profesional',
      values: [
        {
          icon: 'Target',
          title: 'Disciplina',
          description: 'Rutinas exigentes y medibles, sesión tras sesión, sin atajos.',
        },
        {
          icon: 'TrendingUp',
          title: 'Progreso Real',
          description: 'Evaluamos y ajustamos el plan de cada jugador según su evolución.',
        },
        {
          icon: 'Users',
          title: 'Trabajo Individual',
          description: 'Grupos reducidos para que cada jugador reciba atención personalizada.',
        },
      ],
    },

    // "Metodología" — drills de entrenamiento (sin precio, no es un servicio pago suelto)
    services: [
      {
        icon: 'Footprints',
        tag: 'Agility',
        title: 'Footwork',
        description: 'Mejorá tu agilidad y control de pies en espacios reducidos.',
        image: '/images/footwork.webp',
      },
      {
        icon: 'CircleDot',
        tag: 'Technique',
        title: 'Control de Balón',
        description: 'Recepciones orientadas y dominio absoluto bajo presión.',
        image: '/images/control-balon.webp',
      },
      {
        icon: 'Brain',
        tag: 'Mental',
        title: 'Toma de Decisiones',
        description: 'Ejercicios cognitivos para resolver situaciones de juego reales.',
        image: '/images/decisiones.webp',
      },
    ],

    facilities: ['Vestuarios', 'Baños', 'Elementos de trabajo'],

    process: [
      {
        title: 'Evaluación Inicial',
        description: 'Analizamos el nivel técnico, físico y mental del jugador en la primera sesión.',
      },
      {
        title: 'Plan Personalizado',
        description: 'Diseñamos un programa de entrenamiento según la posición y los objetivos del jugador.',
      },
      {
        title: 'Seguimiento Continuo',
        description: 'Medimos avances y ajustamos la exigencia sesión a sesión.',
      },
    ],

    schedule: [
      { day: 'Lunes a Viernes', hours: '16:00 – 21:00' },
      { day: 'Sábados', hours: '09:00 – 13:00' },
    ],

  },
}

export type SiteConfig = typeof siteConfig
