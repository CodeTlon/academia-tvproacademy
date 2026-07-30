import Image from 'next/image'
import * as LucideIcons from 'lucide-react'
import { demoConfig } from '@/lib/demo-config'
import { getSiteSettings } from '@/lib/site-settings'
import Reveal from '@/components/Reveal'

const resolveIcon = (name: string): React.ElementType =>
  (LucideIcons[name as keyof typeof LucideIcons] as React.ElementType) ?? LucideIcons.Sparkles

export default async function About() {
  const { images } = demoConfig
  const { business, about } = await getSiteSettings()

  return (
    <>
      <section id="nosotros" className="py-24 md:py-32 px-5 md:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <Reveal className="order-2 md:order-1">
            <h2 className="font-extrabold uppercase text-3xl md:text-5xl text-white mb-2">
              {about.eyebrow} <br />
              <span className="text-[#f5bf00]">{about.founderName}</span>
            </h2>
            <p className="text-sm font-bold uppercase tracking-widest text-[#d2c5ab] mb-6">{about.role}</p>
            <p className="text-lg text-[#d2c5ab] leading-relaxed mb-8">{about.body}</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-1 bg-[#f5bf00] rounded-full" />
              <span className="text-sm font-bold uppercase tracking-widest text-[#f5bf00]">{about.badge}</span>
            </div>
          </Reveal>

          <Reveal delay={150} className="order-1 md:order-2 relative">
            <div className="absolute inset-0 bg-[#f5bf00] blur-[100px] opacity-20 rounded-full" />
            <div className="relative bg-[#071424]/70 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/40 transform md:rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
                <Image
                  src={images.about}
                  alt={`${about.founderName}, fundador y entrenador de ${business.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={90}
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-4 border border-white/20 rounded-lg pointer-events-none" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 md:py-32 px-5 md:px-10 bg-[#030f1e]">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="font-extrabold uppercase text-3xl md:text-5xl text-white mb-4">
              Nuestros <span className="text-[#f5bf00]">Valores</span>
            </h2>
            <p className="text-lg text-[#d2c5ab] max-w-2xl mx-auto">
              Los pilares que sostienen cada sesión de entrenamiento en TVPRO ACADEMY.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {about.values.map((value, i) => {
              const Icon = resolveIcon(value.icon)
              return (
                <Reveal key={value.title} delay={i * 120}>
                  <div className="h-full bg-[#071424] border border-white/10 rounded-xl p-8 hover:border-[#f5bf00] transition-colors duration-500">
                    <Icon size={32} className="text-[#f5bf00] mb-4" />
                    <h3 className="font-bold uppercase text-xl text-white mb-2">{value.title}</h3>
                    <p className="text-sm text-[#d2c5ab] leading-relaxed">{value.description}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
