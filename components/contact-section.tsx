import { Mail, Phone, MapPin } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { org } from '@/lib/content'
import { SocialLinks } from '@/components/social-icons'

export function ContactSection() {
  return (
    <section id="contact" className="parchment-texture border-b border-gold/20 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading title="संपर्क" />

        <div className="mt-10 text-center">
          <p className="font-serif text-2xl text-primary">{org.shortName}</p>
          <p className="mt-1 text-sm uppercase tracking-[0.15em] text-muted-foreground">
            {org.fullName}
          </p>
        </div>

        <ul className="mx-auto mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
          <ContactItem icon={<Mail className="size-5" />} label="ईमेल">
            <a href={`mailto:${org.contact.email}`} className="hover:text-primary">
              {org.contact.email}
            </a>
          </ContactItem>
          <ContactItem icon={<Phone className="size-5" />} label="मोबाइल">
            <a href={`tel:${org.contact.mobile}`} className="hover:text-primary">
              {org.contact.mobile}
            </a>
          </ContactItem>
          <ContactItem icon={<MapPin className="size-5" />} label="पता">
            {org.contact.address}
          </ContactItem>
        </ul>

        <SocialLinks className="mt-10" />
      </div>
    </section>
  )
}

function ContactItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <li className="flex flex-col items-center gap-2 rounded-lg border border-gold/30 bg-card p-5 text-center">
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary text-primary ring-1 ring-gold/40">
        {icon}
      </span>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-serif text-sm text-foreground/85">{children}</span>
    </li>
  )
}
