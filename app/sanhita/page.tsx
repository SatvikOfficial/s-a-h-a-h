import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SectionHeading } from '@/components/section-heading'
import { buttonVariants } from '@/components/ui/button'
import { sanhita, org } from '@/lib/content'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: `हमारी संहिता — ${org.shortName}`,
  description: sanhita.intro,
}

export default function SanhitaPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="parchment-texture border-b border-gold/30 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <SectionHeading title={sanhita.heading} subtitle={sanhita.intro} />
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <ol className="space-y-6">
              {sanhita.sections.map((item, i) => (
                <li
                  key={item.title}
                  className="flex gap-4 rounded-lg border border-gold/30 bg-card p-5 shadow-sm sm:p-6"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-sm text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <h2 className="font-serif text-xl text-primary">{item.title}</h2>
                    <p className="mt-1.5 text-pretty font-serif leading-relaxed text-foreground/85">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-12 flex justify-center">
              <Link
                href="/#join"
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'h-11 border-primary/40 bg-transparent px-6 font-serif text-primary hover:bg-secondary',
                )}
              >
                <ArrowLeft className="mr-1 size-4" />
                मुख्य पृष्ठ पर लौटें
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
