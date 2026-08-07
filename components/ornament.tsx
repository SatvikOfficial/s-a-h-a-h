import { cn } from '@/lib/utils'

/** Subtle traditional divider — a gold rule with a central diamond motif. */
export function Ornament({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex items-center justify-center gap-3', className)}
      aria-hidden="true"
    >
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60 sm:w-24" />
      <span className="relative flex items-center justify-center">
        <span className="size-2 rotate-45 border border-gold/70" />
        <span className="absolute size-1 rotate-45 bg-accent" />
      </span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60 sm:w-24" />
    </div>
  )
}
