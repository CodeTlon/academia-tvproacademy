import { Check, Phone, MapPin, Clock } from 'lucide-react'
import { demoConfig } from '@/lib/demo-config'
import { waLink } from '@/lib/utils'
import Reveal from '@/components/Reveal'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'

export default function Contact() {
  const { business, content } = demoConfig

  return (
    <section id="contacto" className="min-h-screen flex items-center py-24 md:py-32 px-5 md:px-10 bg-[#030f1e]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <Reveal>
          <h2 className="font-extrabold uppercase text-3xl md:text-5xl text-white mb-6">
            Nuestras Instalaciones <br />
            <span className="text-[#f5bf00]">Y Contacto</span>
          </h2>
          <p className="text-lg text-[#d2c5ab] leading-relaxed mb-8">
            Si jugás en algún torneo y tu equipo necesita donde entrenar, comunicate con nosotros. Para que entrenes de la mejor manera.
          </p>
          <ul className="space-y-3 mb-10">
            {content.facilities.map((item) => (
              <li key={item} className="flex items-center gap-3 text-[#d7e3fa] font-medium">
                <Check size={20} className="text-[#f5bf00]" />
                {item}
              </li>
            ))}
          </ul>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Clock size={20} className="text-[#f5bf00]" />
              <span className="font-bold uppercase tracking-widest text-sm text-white">Horarios de Entrenamiento</span>
            </div>
            <ul className="space-y-1 pl-8">
              {content.schedule.map((slot) => (
                <li key={slot.day} className="flex justify-between max-w-xs text-[#d2c5ab]">
                  <span>{slot.day}</span>
                  <span className="text-[#f5bf00] font-semibold">{slot.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={150} className="relative bg-[#071424]/70 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-10">
          <h3 className="font-bold uppercase text-2xl text-white mb-6">Reservá tu turno</h3>
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-[#d2c5ab]">
              <Phone size={20} className="text-[#f5bf00] shrink-0" />
              <span>{business.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-[#d2c5ab]">
              <MapPin size={20} className="text-[#f5bf00] shrink-0" />
              <span>{business.address}</span>
            </div>
          </div>
          <a
            href={waLink(business.whatsapp, `Hola! Quiero reservar un turno en ${business.name}`)}
            className="w-full inline-flex items-center justify-center gap-3 bg-[#f5bf00] text-[#241a00] font-bold uppercase tracking-wider px-8 py-4 rounded-full shadow-[0_0_20px_rgba(245,191,0,0.4)] hover:shadow-[0_0_30px_rgba(245,191,0,0.6)] transition-shadow"
          >
            <WhatsAppIcon size={20} />
            Escribinos Ahora
          </a>
        </Reveal>
      </div>
    </section>
  )
}
