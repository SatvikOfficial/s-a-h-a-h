import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Ornament } from '@/components/ornament'
import { Reveal } from '@/components/reveal'
import { org } from '@/lib/content'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section
      id="home"
      className="parchment-texture relative overflow-hidden border-b border-gold/30"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
        {/* Logo */}
        <Reveal delay={0}>
          <div className="relative">
            <div
              className="absolute inset-0 -z-10 rounded-full bg-accent/20 blur-2xl"
              aria-hidden="true"
            />
            <Image
              src={org.logo || '/placeholder.svg'}
              alt={`${org.shortName} — ${org.fullName}`}
              width={220}
              height={220}
              priority
              className="mx-auto size-40 rounded-full object-cover shadow-lg ring-2 ring-gold/50 transition-transform duration-500 sm:size-52"
            />
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="mt-8 font-serif text-4xl font-normal tracking-[0.08em] text-primary sm:text-6xl">
            {org.shortName}
          </h1>
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground sm:text-base">
            {org.fullName}
          </p>
        </Reveal>

        <Ornament className="my-8" />

        {/* Main Heading */}
        <Reveal delay={0.1}>
          <h2 className="font-serif text-3xl font-normal leading-relaxed text-primary sm:text-5xl sm:leading-relaxed">
            {org.heroHeading}
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-6 max-w-2xl text-pretty font-serif text-lg leading-relaxed text-foreground/90 sm:text-xl">
            {org.heroSubheading}
          </p>
        </Reveal>

        <Ornament className="my-8" />

        <Reveal delay={0.2}>
          <p className="mt-6 max-w-3xl text-pretty font-serif text-base leading-relaxed text-foreground/80 sm:text-lg">
            {org.intro}
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#join"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-11 px-6 font-serif text-base tracking-wide transition-all duration-200 hover:bg-primary/90 active:scale-[0.97]',
              )}
            >
              S.A.H.A.S. से जुड़ें
            </Link>
            <Link
              href="/#sankalp"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'h-11 border-primary/40 bg-transparent px-6 font-serif text-base tracking-wide text-primary transition-all duration-200 hover:bg-secondary active:scale-[0.97]',
              )}
            >
              हमारा संकल्प
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
