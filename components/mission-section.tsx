'use client'

import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'
import { Icon } from '@/components/icon'
import { sankalp } from '@/lib/content'

export function MissionSection() {
  return (
    <section id="sankalp" className="parchment-texture border-b border-gold/20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading title={sankalp.heading} />
        </Reveal>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sankalp?.items &&
            sankalp.items.map((item, i) => (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08, ease: 'easeOut' }}
                whileHover={{ y: -5 }}
                className="group rounded-lg border border-gold/30 bg-card p-6 shadow-sm transition-colors hover:border-accent/60"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-secondary text-primary ring-1 ring-gold/40 transition-transform duration-300 group-hover:scale-110">
                  <Icon name={item.icon} />
                </span>
                <h3 className="mt-4 font-serif text-xl text-primary">{item.title}</h3>
                <p className="mt-2 text-pretty font-serif leading-relaxed text-foreground/80">
                  {item.text}
                </p>
              </motion.li>
            ))}
        </ul>
      </div>
    </section>
  )
}