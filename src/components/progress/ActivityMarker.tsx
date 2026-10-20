import type { ActivityKind } from '../../lib/progress'
import { cn } from '../../lib/tones'
import { ACTIVITY_META } from './activityMeta'

/** Círculo con ícono. Siempre lleva ícono (no solo color), para que se distinga sin depender del color. */
export function ActivityMarker({ kind, size = 'md' }: { kind: ActivityKind | null; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'size-5' : 'size-8'
  const iconSize = size === 'sm' ? 12 : 16
  if (!kind) return <span aria-hidden="true" className={cn('block rounded-full bg-ink-100', box)} />
  const { icon: Icon, circle, iconClass } = ACTIVITY_META[kind]
  return (
    <span aria-hidden="true" className={cn('flex items-center justify-center rounded-full', box, circle)}>
      <Icon size={iconSize} strokeWidth={2.6} className={iconClass} />
    </span>
  )
}

export function ActivityLegend() {
  return (
    <ul aria-label="Leyenda" className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-700">
      {(Object.keys(ACTIVITY_META) as ActivityKind[]).map((kind) => (
        <li key={kind} className="flex items-center gap-1.5">
          <ActivityMarker kind={kind} size="sm" />
          {ACTIVITY_META[kind].label}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <ActivityMarker kind={null} size="sm" />
        Sin actividad
      </li>
    </ul>
  )
}
