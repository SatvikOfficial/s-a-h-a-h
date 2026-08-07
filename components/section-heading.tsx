import { Ornament } from '@/components/ornament'

export function SectionHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="font-serif text-3xl font-normal tracking-wide text-primary sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-pretty font-serif text-base text-foreground/70 sm:text-lg">
          {subtitle}
        </p>
      ) : null}
      <Ornament className="mt-5" />
    </div>
  )
}
