import { Check, ArrowRight } from 'lucide-react'
import { demoConfig } from '@/lib/demo-config'
import Reveal from '@/components/Reveal'

export default function Hero() {
  const { business, content } = demoConfig
  const { hero } = content

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-32 pb-24 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.webp"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
        >
          <source src="/videos/hero-desktop.mp4" type="video/mp4" media="(min-width: 768px)" />
          <source src="/videos/hero-mobile.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#071424] via-[#071424]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071424] via-[#071424]/60 to-transparent" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f5bf00]/50 to-transparent blur-[2px] -rotate-12 scale-150" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f5bf00]/30 to-transparent blur-[4px] rotate-6 scale-150" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-10">
      <div className="max-w-3xl">
        <Reveal>
          <h1 className="font-black uppercase text-5xl md:text-7xl leading-[1.1] tracking-tight text-white drop-shadow-2xl mb-8">
            {hero.title} <br />
            <span className="text-[#f5bf00] italic">{hero.titleAccent}</span>
          </h1>
        </Reveal>
        <Reveal delay={150}>
          <ul className="space-y-4 mb-12 text-lg md:text-xl text-[#d2c5ab] font-semibold">
            {hero.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-4">
                <Check size={28} className="text-[#f5bf00] drop-shadow-[0_0_8px_rgba(245,191,0,0.8)]" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={300}>
          <a
            href={`https://wa.me/${business.whatsapp}`}
            className="group inline-flex items-center justify-center gap-3 bg-[#f5bf00] text-[#241a00] font-bold uppercase tracking-wider text-lg px-10 py-4 rounded-full shadow-[0_0_20px_rgba(245,191,0,0.4)] hover:shadow-[0_0_30px_rgba(245,191,0,0.6)] transition-shadow"
          >
            Reservá tu turno
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </Reveal>
      </div>
      </div>
    </section>
  )
}
