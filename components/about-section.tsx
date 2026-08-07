import { SectionHeading } from '@/components/section-heading'
import { about } from '@/lib/content'

export function AboutSection() {
  return (
    <section id="about" className="border-b border-gold/20 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading title={about.heading} />
        <div className="mt-10 space-y-5">
          {about.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-pretty font-serif text-base leading-relaxed text-foreground/85 sm:text-lg"
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
