'use client'

import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'
import { org } from '@/lib/content'
import { SocialLinks } from '@/components/social-icons'

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  org.contact.address
)}`

export function ContactSection() {
  return (
    <section id="contact" className="parchment-texture border-b border-gold/20 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading title="संपर्क" />
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-10 text-center">
            <p className="font-serif text-2xl text-primary">{org.shortName}</p>
            <p className="mt-1 text-sm uppercase tracking-[0.15em] text-muted-foreground">
              {org.fullName}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="mx-auto mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
            <ContactItem href={`mailto:${org.contact.email}`} icon={<Mail className="size-5" />} label="ईमेल">
              {org.contact.email}
            </ContactItem>
            <ContactItem href={`tel:${org.contact.mobile.replace(/\s/g, '')}`} icon={<Phone className="size-5" />} label="मोबाइल">
              {org.contact.mobile}
            </ContactItem>
            <ContactItem href={mapsHref} icon={<MapPin className="size-5" />} label="पता">
              {org.contact.address}
              <ExternalLink className="ml-1 inline size-3.5 align-[-1px]" aria-hidden="true" />
            </ContactItem>
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <SocialLinks className="mt-10" />
        </Reveal>
      </div>
    </section>
  )
}

function ContactItem({
  icon,
  label,
  children,
  href,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
  href: string
}) {
  return (
    <motion.li whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }} className="h-full">
      <a
        href={href}
        className="group flex size-full flex-col items-center gap-2 rounded-lg border border-gold/30 bg-card p-5 text-center transition-colors hover:border-primary/40 hover:bg-secondary/60"
      >
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary text-primary ring-1 ring-gold/40 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </span>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="font-serif text-sm text-foreground/85 transition-colors group-hover:text-primary">
          {children}
        </span>
      </a>
    </motion.li>
  )
}