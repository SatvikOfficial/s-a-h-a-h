'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'

const tributes = [
  {
    image: '/Shivaji_British_Museum.jpg',
    alt: 'छत्रपति शिवाजी महाराज',
    name: 'छत्रपति शिवाजी महाराज',
    text: 'स्वराज्य के स्थापक। धर्म, मर्यादा और हिंदवी स्वराज्य के प्रतीक।',
    mirror: true,
  },
  {
    image: '/ambedgar.webp',
    alt: 'डॉ. भीमराव अंबेडकर',
    name: 'डॉ. भीमराव अंबेडकर',
    text: 'भारतीय संविधान के निर्माता। समानता और सामाजिक न्याय के पुरोधा।',
    mirror: false,
  },
]

export function Tributes() {
  return (
    <section id="tributes" className="border-b border-gold/20 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            title="हमारे प्रेरणास्रोत"
            subtitle="सनातन धर्म, जागरण और समाज की सेवा में हमारी प्रेरणा।"
          />
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {tributes.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center rounded-lg border border-gold/30 bg-card p-6 text-center shadow-sm transition-colors hover:border-accent/60"
              >
                <div className="size-32 overflow-hidden rounded-full ring-2 ring-gold/40">
                  <Image
                    src={t.image}
                    alt={t.alt}
                    width={128}
                    height={128}
                    className={`size-full object-cover object-top transition-transform duration-500 ${t.mirror ? '-scale-x-100 hover:-scale-x-110' : 'hover:scale-110'}`}
                  />
                </div>
                <h3 className="mt-4 font-serif text-xl text-primary">{t.name}</h3>
                <p className="mt-2 font-serif text-sm leading-relaxed text-foreground/80">
                  {t.text}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}