'use client'

import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'
import { Icon } from '@/components/icon'
import { activities } from '@/lib/content'

export function ActivitiesSection() {
  return (
    <section id="activities" className="border-b border-gold/20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading title={activities.heading} subtitle={activities.intro} />
        </Reveal>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {activities.items.map((item, i) => (
            <motion.li
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.45, delay: (i % 4) * 0.07, ease: 'easeOut' }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center rounded-lg border border-gold/30 bg-card p-6 text-center shadow-sm transition-colors hover:border-accent/60"
            >
              <span className="inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-gold/40 transition-transform duration-300 group-hover:scale-110">
                <Icon name={item.icon} className="size-7" />
              </span>
              <h3 className="mt-4 font-serif text-lg text-primary">{item.title}</h3>
              <p className="mt-2 text-pretty font-serif text-sm leading-relaxed text-foreground/80">
                {item.text}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}