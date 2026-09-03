import { getSiteSettings } from '@/lib/site-settings'
import { JsonLd } from '@/components/seo/JsonLd'
import Reveal from '@/components/Reveal'

/** Preguntas frecuentes de la página Entrenamiento. Contenido basado 1:1 en
 * site-config.ts (horarios, dirección, instalaciones, proceso) — nada inventado. */
export default async function FAQ() {
  const { business, facilities, schedule, process: steps } = await getSiteSettings()

  const scheduleText = schedule.map((s) => `${s.day} de ${s.hours}`).join(' y ')

  const faqs = [
    {
      question: '¿Cómo es el proceso para empezar a entrenar?',
      answer: `Arrancás con una ${steps[0]?.title.toLowerCase() ?? 'evaluación inicial'}: analizamos tu nivel técnico, físico y mental en la primera sesión. A partir de ahí armamos un plan personalizado según tu posición y objetivos, y hacemos seguimiento continuo sesión a sesión.`,
    },
    {
      question: '¿Qué días y horarios hay entrenamiento?',
      answer: `Entrenamos ${scheduleText}. Coordinamos el turno específico por WhatsApp.`,
    },
    {
      question: '¿Dónde quedan las instalaciones?',
      answer: `En ${business.address}. El predio cuenta con ${facilities.join(', ').toLowerCase()}.`,
    },
    {
      question: '¿Puedo entrenar sin importar en qué liga o categoría juego?',
      answer: 'Sí. No importa en qué liga juegues: si tenés la disciplina para entrenar en serio, te damos las herramientas para dar el salto de calidad.',
    },
    {
      question: '¿En qué se enfoca el entrenamiento?',
      answer: 'En tres ejes: footwork (agilidad y control de pies en espacios reducidos), control de balón bajo presión y toma de decisiones mediante ejercicios cognitivos para resolver situaciones reales de juego.',
    },
    {
      question: '¿Cómo reservo un turno o pido más información?',
      answer: `Escribinos por WhatsApp al ${business.phone} y coordinamos tu turno de entrenamiento.`,
    },
  ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  return (
    <section className="py-24 md:py-32 px-5 md:px-10 bg-[#030f1e]" aria-labelledby="faq-heading">
      <JsonLd data={faqSchema} />
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center mb-14">
          <p className="eyebrow">Dudas frecuentes</p>
          <h2 id="faq-heading" className="font-extrabold uppercase text-3xl md:text-4xl text-white">
            Preguntas <span className="text-[#f5bf00]">Frecuentes</span>
          </h2>
        </Reveal>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Reveal key={faq.question} delay={i * 80}>
              <details className="group bg-[#071424] border border-white/10 rounded-xl p-6 open:border-[#f5bf00] transition-colors">
                <summary className="flex items-center justify-between gap-4 font-bold text-white cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00] rounded-md">
                  {faq.question}
                  <span className="text-[#f5bf00] text-xl leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-sm text-[#d2c5ab] leading-relaxed">{faq.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
