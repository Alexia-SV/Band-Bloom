import type { EmojiName } from '../../data/emoji'
import { routeHref } from '../../lib/router'
import { cn, TONE_STYLES } from '../../lib/tones'
import type { RoutineId, Tone } from '../../types'
import { IconBubble } from '../ui/IconBubble'

const SHORTCUTS: Array<{ id: RoutineId; label: string; duration: string; emoji: EmojiName; tone: Tone }> = [
  { id: 'mobility', label: 'Movilidad', duration: '7 min', emoji: 'person-in-lotus-position', tone: 'sage' },
  { id: 'short', label: 'Rutina corta', duration: '10 min', emoji: 'stopwatch', tone: 'rose' },
  { id: 'c', label: 'Rutina completa', duration: '20–25 min', emoji: 'flexed-biceps', tone: 'lavender' },
]

export function QuickAccess() {
  return (
    <section aria-labelledby="quick-access-title">
      <h2 id="quick-access-title" className="mb-3 font-bold">
        ¿Poco tiempo o poca energía?
      </h2>
      <ul className="grid grid-cols-3 gap-3">
        {SHORTCUTS.map(({ id, label, duration, emoji, tone }) => (
          <li key={id}>
            <a
              href={routeHref({ name: 'routine', id })}
              className={cn(
                'flex h-full min-h-32 flex-col items-center justify-center gap-2 rounded-card p-3 text-center shadow-soft ring-1 transition hover:-translate-y-0.5',
                TONE_STYLES[tone].card,
              )}
            >
              <IconBubble emoji={emoji} tone={tone} />
              <span className="text-sm font-semibold leading-tight text-ink-900">{label}</span>
              <span className="text-xs text-ink-500">{duration}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
