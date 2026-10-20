import { ChevronRight, CircleCheck, Timer } from 'lucide-react'
import { routeHref } from '../../lib/router'
import { cn, TONE_STYLES } from '../../lib/tones'
import type { Routine } from '../../types'
import { ROUTINE_COVERS } from '../../data/covers'
import { routineTitle } from '../../data/routines'
import { ROUTINE_EMOJI } from '../routineIcons'
import { FavoriteButton } from '../ui/FavoriteButton'
import { IconBubble } from '../ui/IconBubble'

interface RoutineCardProps {
  routine: Routine
  /** Texto pequeño arriba del título, por ejemplo "Lunes" u "Opcional". */
  eyebrow?: string
  /** Muestra "Hecha esta semana". */
  doneThisWeek?: boolean
}

/**
 * Tarjeta de rutina. Toda la tarjeta es clicable (el enlace del título se extiende con ::after),
 * pero el botón de favorita queda por encima para no anidar elementos interactivos.
 */
export function RoutineCard({ routine, eyebrow, doneThisWeek = false }: RoutineCardProps) {
  const tone = TONE_STYLES[routine.tone]
  const cover = ROUTINE_COVERS[routine.id]
  // La foto se desvanece hacia la izquierda para fundirse con el color de la tarjeta (como en el mockup).
  const fade = 'linear-gradient(to left, black 45%, transparent 100%)'
  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-card p-5 shadow-soft ring-1 transition hover:-translate-y-0.5 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-bloom-500',
        tone.card,
      )}
    >
      <img
        src={cover.src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-[36%] object-cover"
        style={{ objectPosition: cover.position, maskImage: fade, WebkitMaskImage: fade }}
      />
      <div className="relative flex items-start gap-3 pr-[30%]">
        <IconBubble emoji={ROUTINE_EMOJI[routine.kind]} tone={routine.tone} size="sm" />
        <div className="min-w-0 flex-1">
          {(eyebrow || doneThisWeek) && (
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink-700">
              {eyebrow}
              {doneThisWeek && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sage-100 px-2 py-0.5 text-xs font-semibold text-sage-700">
                  <CircleCheck size={13} aria-hidden="true" /> Hecha esta semana
                </span>
              )}
            </p>
          )}
          <h3 className="text-lg font-bold leading-snug">
            <a
              href={routeHref({ name: 'routine', id: routine.id })}
              className="rounded-sm after:absolute after:inset-0 after:rounded-card focus-visible:outline-none"
            >
              {routineTitle(routine)}
            </a>
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-700">
            <Timer size={15} aria-hidden="true" />
            {routine.durationLabel} · {routine.items.length} ejercicios
          </p>
        </div>
      </div>

      <dl className="relative mt-4 grid gap-1 pr-[30%] text-sm">
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold text-ink-700">Trabaja:</dt>
          <dd className="text-ink-700">{routine.muscleGroups.join(', ')}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold text-ink-700">Equipo:</dt>
          <dd className="text-ink-700">{routine.equipment.join(', ')}</dd>
        </div>
      </dl>

      <p className={cn('relative mt-4 flex items-center gap-1 text-sm font-semibold', tone.text)} aria-hidden="true">
        Ver rutina <ChevronRight size={16} />
      </p>

      <FavoriteButton routineId={routine.id} className="absolute right-4 top-4 z-10" />
    </article>
  )
}
