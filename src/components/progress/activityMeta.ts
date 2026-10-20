import { Check, Leaf, Moon, Timer, type LucideIcon } from 'lucide-react'
import type { ActivityKind } from '../../lib/progress'

export const ACTIVITY_META: Record<ActivityKind, { label: string; icon: LucideIcon; circle: string; iconClass: string }> = {
  strength: { label: 'Rutina de fuerza', icon: Check, circle: 'bg-sage-500', iconClass: 'text-white' },
  short: { label: 'Rutina corta', icon: Timer, circle: 'bg-rose-100', iconClass: 'text-rose-700' },
  mobility: { label: 'Movilidad', icon: Leaf, circle: 'bg-sage-100', iconClass: 'text-sage-700' },
  rest: { label: 'Descanso', icon: Moon, circle: 'bg-bloom-100', iconClass: 'text-bloom-700' },
}

export function describeActivities(kinds: ActivityKind[]): string {
  return kinds.length ? kinds.map((kind) => ACTIVITY_META[kind].label.toLowerCase()).join(', ') : 'sin actividad'
}
