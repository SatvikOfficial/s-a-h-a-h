import { Ornament } from '@/components/ornament'
import { gita } from '@/lib/content'

export function GitaSection() {
  return (
    <section className="border-b border-gold/20 bg-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Ornament className="flex justify-center opacity-60" />

        {/* Verse */}
        <blockquote className="mt-8 text-center font-serif text-xl leading-relaxed text-primary sm:text-2xl sm:leading-relaxed">
          <p className="text-balance">{gita?.verse1 || ''}</p>
          <p className="text-balance">{gita?.verse2 || ''}</p>
          <p className="mt-6 text-balance">{gita?.verse3 || ''}</p>
          <p className="text-balance">{gita?.verse4 || ''}</p>
        </blockquote>

        <Ornament className="mt-8 flex justify-center opacity-60" />

        {/* Meaning */}
        <p className="mt-8 text-center font-serif text-base leading-relaxed text-foreground/85 sm:text-lg">
          {gita?.meaning || ''}
        </p>
      </div>
    </section>
  )
}
