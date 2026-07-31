import Image from 'next/image'
import * as LucideIcons from 'lucide-react'
import { getSiteSettings } from '@/lib/site-settings'
import { focalImageProps } from '@/lib/image-focal'
import Reveal from '@/components/Reveal'

const resolveIcon = (name: string): React.ElementType =>
  (LucideIcons[name as keyof typeof LucideIcons] as React.ElementType) ?? LucideIcons.Sparkles

export default async function Services() {
  const { services, process: steps } = await getSiteSettings()

  return (
    <section id="entrenamiento" className="relative py-24 md:py-32 px-5 md:px-10 bg-[#030f1e]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,191,0,0.08)_0%,transparent_60%)]" />
      <div className="relative max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <h2 className="font-extrabold uppercase text-3xl md:text-5xl text-white mb-4">
            Nuestra <span className="text-[#f5bf00]">Metodología</span>
          </h2>
          <p className="text-lg text-[#d2c5ab] max-w-2xl mx-auto">
            Ejercicios de alta intensidad diseñados para potenciar cada aspecto de tu juego bajo presión.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((drill, i) => {
            const Icon = resolveIcon(drill.icon)
            return (
              <Reveal key={drill.title} delay={i * 120}>
                <div className="group bg-[#071424] border border-white/10 rounded-xl overflow-hidden hover:scale-[1.02] hover:border-[#f5bf00] transition-all duration-500 hover:shadow-[0_10px_40px_-10px_rgba(245,191,0,0.3)]">
                  <div className="relative aspect-video overflow-hidden bg-[#0e1b2c]">
                    {drill.image && (() => {
                      const fp = focalImageProps(drill.image)
                      return (
                        <Image
                          src={fp.src}
                          alt={drill.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          quality={85}
                          style={fp.style}
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )
                    })()}
                    <div className="absolute inset-0 bg-[#071424]/40 group-hover:bg-[#071424]/20 transition-colors" />
                  </div>
                  <div className="p-8">
                    <span className="inline-flex items-center gap-2 px-3 py-1 border border-[#f5bf00] text-[#f5bf00] text-xs font-bold uppercase tracking-wide rounded-full mb-4">
                      <Icon size={14} />
                      {drill.tag}
                    </span>
                    <h3 className="font-bold uppercase text-xl text-[#f5bf00] mb-2">{drill.title}</h3>
                    <p className="text-sm text-[#d2c5ab] leading-relaxed">{drill.description}</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 120}>
              <div className="relative pl-16">
                <span className="absolute left-0 top-0 flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#f5bf00] text-[#f5bf00] font-black text-lg">
                  {i + 1}
                </span>
                <h3 className="font-bold uppercase text-lg text-white mb-2">{step.title}</h3>
                <p className="text-sm text-[#d2c5ab] leading-relaxed">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
