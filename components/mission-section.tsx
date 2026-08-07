import { SectionHeading } from '@/components/section-heading'
import { Icon } from '@/components/icon'
import { sankalp } from '@/lib/content'

export function MissionSection() {
  return (
    <section id="sankalp" className="parchment-texture border-b border-gold/20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading title={sankalp.heading} />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sankalp?.items && sankalp.items.map((item) => (
            <li
              key={item.title}
              className="group rounded-lg border border-gold/30 bg-card p-6 shadow-sm transition-colors hover:border-accent/60"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-secondary text-primary ring-1 ring-gold/40">
                <Icon name={item.icon} />
              </span>
              <h3 className="mt-4 font-serif text-xl text-primary">{item.title}</h3>
              <p className="mt-2 text-pretty font-serif leading-relaxed text-foreground/80">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
