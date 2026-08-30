import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'
import { flow } from '@/lib/content'
import { ChevronDown } from 'lucide-react'

export function FlowSection() {
  return (
    <section className="border-b border-gold/20 bg-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading title={flow.heading} />
        </Reveal>

        {/* Steps */}
        <div className="mt-16 flex flex-col items-center gap-6 sm:gap-8">
          {flow?.steps && flow.steps.map((step, idx) => (
            <Reveal key={step.label} delay={idx * 0.1}>
              <div className="flex flex-col items-center gap-3">
                <div className="text-center">
                  <h3 className="font-serif text-3xl font-normal text-primary sm:text-4xl">
                    {step.label}
                  </h3>
                  <p className="mt-1 font-serif text-sm text-foreground/70">
                    {step.description}
                  </p>
                </div>
                {idx < (flow?.steps?.length || 0) - 1 && (
                  <ChevronDown className="size-6 text-primary/40 sm:size-8" />
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {/* Message */}
        <Reveal delay={0.1}>
          <div className="mt-16 space-y-6">
            <p className="text-pretty text-center font-serif text-base leading-relaxed text-foreground/85 sm:text-lg">
              {flow?.message || ''}
            </p>
            <p className="text-center font-serif text-lg font-normal text-primary sm:text-xl">
              {flow?.callToAction || ''}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
