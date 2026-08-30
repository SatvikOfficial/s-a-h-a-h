import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'
import { about } from '@/lib/content'

export function AboutSection() {
  return (
    <section id="about" className="border-b border-gold/20 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading title={about.heading} />
        </Reveal>
        <div className="mt-10 space-y-5">
          {about.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p className="text-pretty font-serif text-base leading-relaxed text-foreground/85 sm:text-lg">
                {p}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
