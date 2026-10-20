import { ChevronRight } from 'lucide-react'
import { getExercise } from '../../data/exercises'
import { cn, TONE_STYLES } from '../../lib/tones'
import type { Tone } from '../../types'
import { ExerciseFigure } from './ExerciseFigure'

interface ExerciseListItemProps {
  href: string
  exerciseId: string
  number: number
  detail: string
  tone: Tone
}

/** Fila de la lista de una rutina: miniatura del ejercicio, nombre, series y flecha (como en el mockup). */
export function ExerciseListItem({ href, exerciseId, number, detail, tone }: ExerciseListItemProps) {
  const name = getExercise(exerciseId)?.name ?? exerciseId
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-card bg-white/85 p-2.5 pr-4 shadow-soft ring-1 ring-ink-200/60 transition hover:bg-white"
    >
      <span
        aria-hidden="true"
        className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', TONE_STYLES[tone].bubble, TONE_STYLES[tone].text)}
      >
        {number}
      </span>
      <span className={cn('block size-18 shrink-0 overflow-hidden rounded-2xl', TONE_STYLES[tone].card)}>
        <ExerciseFigure exerciseId={exerciseId} frame={1} className="size-full" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-snug">{name}</span>
        <span className="block text-sm text-ink-500">{detail}</span>
      </span>
      <ChevronRight size={20} className="shrink-0 text-ink-400" aria-hidden="true" />
    </a>
  )
}
