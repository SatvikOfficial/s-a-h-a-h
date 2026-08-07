import {
  Flame,
  Users,
  Landmark,
  HandHeart,
  Lightbulb,
  Shield,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const map: Record<string, LucideIcon> = {
  flame: Flame,
  users: Users,
  landmark: Landmark,
  handHeart: HandHeart,
  lightbulb: Lightbulb,
  shield: Shield,
}

export function Icon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Cmp = map[name] ?? Flame
  return <Cmp className={cn('size-6', className)} aria-hidden="true" />
}
