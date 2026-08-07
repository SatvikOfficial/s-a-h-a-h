import { SectionHeading } from '@/components/section-heading'
import { Icon } from '@/components/icon'
import { activities } from '@/lib/content'

export function ActivitiesSection() {
  return (
    <section id="activities" className="border-b border-gold/20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading title={activities.heading} subtitle={activities.intro} />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {activities.items.map((item) => (
            <li
              key={item.title}
              className="flex flex-col items-center rounded-lg border border-gold/30 bg-card p-6 text-center shadow-sm transition-colors hover:border-accent/60"
            >
              <span className="inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-gold/40">
                <Icon name={item.icon} className="size-7" />
              </span>
              <h3 className="mt-4 font-serif text-lg text-primary">{item.title}</h3>
              <p className="mt-2 text-pretty font-serif text-sm leading-relaxed text-foreground/80">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
