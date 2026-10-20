import { Dumbbell, Flower2, Timer, type LucideIcon } from 'lucide-react'
import type { RoutineKind } from '../types'

export const ROUTINE_ICONS: Record<RoutineKind, LucideIcon> = {
  strength: Dumbbell,
  short: Timer,
  mobility: Flower2,
}
