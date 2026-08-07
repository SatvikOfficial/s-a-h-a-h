import { SectionHeading } from '@/components/section-heading'
import { revolution } from '@/lib/content'

export function RevolutionSection() {
  const paragraphs = revolution?.mainMessage
    ? revolution.mainMessage.split('\n\n').filter(Boolean)
    : []

  return (
    <section className="parchment-texture border-b border-gold/20 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading title={revolution?.heading || ''} />

        <div className="mt-10 space-y-6">
          <p className="text-pretty font-serif text-base leading-relaxed text-foreground/85 sm:text-lg">
            {revolution?.intro || ''}
          </p>

          {paragraphs.map((para, idx) => (
            <p
              key={idx}
              className="whitespace-pre-wrap text-pretty font-serif text-base leading-relaxed text-foreground/85 sm:text-lg"
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
