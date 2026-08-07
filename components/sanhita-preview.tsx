import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { SectionHeading } from '@/components/section-heading'
import { sanhita } from '@/lib/content'
import { cn } from '@/lib/utils'

export function SanhitaPreview() {
  return (
    <section id="sanhita" className="parchment-texture border-b border-gold/20 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <SectionHeading title={sanhita.heading} />
        <p className="mt-10 text-pretty font-serif text-base leading-relaxed text-foreground/85 sm:text-lg">
          {sanhita.homeExcerpt}
        </p>
        <Link
          href="/sanhita"
          className={cn(
            buttonVariants({ size: 'lg' }),
            'mt-8 h-11 px-6 font-serif text-base tracking-wide hover:bg-primary/90',
          )}
        >
          पूरी संहिता पढ़ें
          <ArrowRight className="ml-1 size-4" />
        </Link>
      </div>
    </section>
  )
}
