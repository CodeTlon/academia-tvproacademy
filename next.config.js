/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // '**' porque el dashboard deja pegar cualquier URL de imagen (portada de
    // blog, drills de metodología) — sin esto, next/image tira 400 apenas el
    // cliente pega una foto que no sea de un dominio pre-listado a mano.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    qualities: [82, 85, 90],
  },
}

module.exports = nextConfig
