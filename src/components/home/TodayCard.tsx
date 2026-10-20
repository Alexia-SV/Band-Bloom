import { CalendarDays, Dumbbell, Flower2, Moon, PartyPopper, Play, Sparkles, Timer, Undo2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { getExercise } from '../../data/exercises'
import { getWarmUp } from '../../data/warmups'
import { ExerciseFigure } from '../exercise/ExerciseFigure'
import { getRoutine, routineTitle } from '../../data/routines'
import { capitalize, parseISODate, WEEKDAY_NAME, weekdayKey } from '../../lib/dates'
import type { DashboardSummary } from '../../lib/recommendation'
import { routeHref } from '../../lib/router'
import type { Tone } from '../../types'
import { LinkButton, SecondaryButton } from '../ui/Buttons'
import { Card } from '../ui/Card'
import { IconBubble } from '../ui/IconBubble'

interface TodayCardProps {
  summary: DashboardSummary
  now: Date
  onMarkRest: () => void
  onUndoRest: () => void
}

const MOBILITY_HREF = routeHref({ name: 'routine', id: 'mobility' })

function NextSessionLine({ next }: { next: DashboardSummary['nextSession'] }) {
  if (!next) return null
  const day = WEEKDAY_NAME[weekdayKey(parseISODate(next.date))]
  return (
    <p className="mt-4 flex items-center gap-2 border-t border-ink-900/5 pt-3 text-sm text-ink-700">
      <CalendarDays size={16} aria-hidden="true" className="shrink-0 text-ink-500" />
      <span>
        Próxima sesión: <strong className="font-semibold">{capitalize(day)}</strong> · {routineTitle(getRoutine(next.routineId))}
      </span>
    </p>
  )
}

function Shell({
  tone,
  icon,
  eyebrow,
  title,
  children,
}: {
  tone: Tone
  icon: typeof Dumbbell
  eyebrow: string
  title: string
  children: ReactNode
}) {
  return (
    <Card as="section" tone={tone} className="p-5" aria-labelledby="today-title">
      <div className="flex items-start gap-4">
        <IconBubble icon={icon} tone={tone} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-700">{eyebrow}</p>
          <h2 id="today-title" className="mt-0.5 text-xl font-bold leading-snug tracking-tight">
            {title}
          </h2>
        </div>
      </div>
      {children}
    </Card>
  )
}

export function TodayCard({ summary, now, onMarkRest, onUndoRest }: TodayCardProps) {
  const eyebrow = `Hoy · ${capitalize(WEEKDAY_NAME[weekdayKey(now)])}`
  const rec = summary.today

  switch (rec.kind) {
    case 'strength': {
      const planned = getRoutine(rec.routineId)
      // Con preferencia de 10 min se propone la rutina corta, sin perder de vista la del día.
      const routine = rec.preferShort ? getRoutine('short') : planned
      const first = routine.items[0]
      const warmUp = getWarmUp(routine.id)
      return (
        <Shell tone={routine.tone} icon={rec.preferShort ? Timer : Dumbbell} eyebrow={eyebrow} title={routineTitle(routine)}>
          <p className="mt-3 text-sm text-ink-700">{routine.muscleGroups.join(' · ')}</p>
          {rec.preferShort && (
            <p className="mt-2 text-sm text-ink-700">
              Elegiste sesiones cortas. Si hoy te sobra energía, también puedes hacer la{' '}
              <a href={routeHref({ name: 'routine', id: planned.id })} className="font-semibold text-bloom-700 underline underline-offset-2">
                rutina {planned.letter} completa
              </a>
              .
            </p>
          )}
          {!rec.planned && !rec.preferShort && (
            <p className="mt-2 text-sm text-ink-700">
              Ya hiciste la rutina de hoy esta semana, así que te sugerimos la que te falta.
            </p>
          )}
          <ul className="mt-3 flex flex-wrap gap-2 text-sm font-medium text-ink-700">
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1">
              <Timer size={15} aria-hidden="true" /> {routine.durationLabel}
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1">
              {routine.items.length} ejercicios
            </li>
          </ul>
          <a
            href={routeHref({ name: 'exercise', routineId: routine.id, part: 'main', index: 0 })}
            className="mt-4 flex items-center gap-3 rounded-2xl bg-white/80 p-2 pr-3 transition hover:bg-white"
          >
            <span className="block size-14 shrink-0 overflow-hidden rounded-xl bg-white">
              <ExerciseFigure exerciseId={first.exerciseId} frame={1} className="size-full" />
            </span>
            <span className="min-w-0 text-sm text-ink-700">
              {warmUp && <span className="block">Calentamiento de {warmUp.durationLabel} y después:</span>}
              <strong className="block font-semibold text-ink-900">{getExercise(first.exerciseId)?.name}</strong>
              <span className="block">
                {first.sets} × {first.target}
              </span>
            </span>
          </a>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <LinkButton href={routeHref({ name: 'routine', id: routine.id })} icon={Play} className="w-full sm:w-auto">
              Comenzar
            </LinkButton>
            <SecondaryButton onClick={onMarkRest} icon={Moon}>
              Hoy prefiero descansar
            </SecondaryButton>
          </div>
        </Shell>
      )
    }

    case 'done-today':
      return (
        <Shell tone="sage" icon={Sparkles} eyebrow={eyebrow} title="¡Listo por hoy!">
          <p className="mt-3 text-sm text-ink-700">
            Completaste <strong className="font-semibold">{routineTitle(getRoutine(rec.routineId))}</strong>. Si te
            apetece, una movilidad suave ayuda a soltar el cuerpo.
          </p>
          {!summary.mobilityDoneToday && (
            <LinkButton href={MOBILITY_HREF} variant="secondary" icon={Flower2} className="mt-3 -ml-4">
              Movilidad de 7 min (opcional)
            </LinkButton>
          )}
          <NextSessionLine next={summary.nextSession} />
        </Shell>
      )

    case 'rest-marked':
      return (
        <Shell tone="lavender" icon={Moon} eyebrow={eyebrow} title="Hoy es día de descanso">
          <p className="mt-3 text-sm text-ink-700">
            Descansar también es entrenar: así es como el músculo se recupera y se fortalece.
          </p>
          <SecondaryButton onClick={onUndoRest} icon={Undo2} className="mt-3 -ml-4">
            Cambié de opinión
          </SecondaryButton>
          <NextSessionLine next={summary.nextSession} />
        </Shell>
      )

    case 'weekly-goal-met':
      return (
        <Shell tone="sage" icon={PartyPopper} eyebrow={eyebrow} title="¡Semana de fuerza completa!">
          <p className="mt-3 text-sm text-ink-700">
            Ya hiciste tus {summary.weeklyGoal} sesiones. Hoy puedes descansar o hacer movilidad suave.
          </p>
          <LinkButton href={MOBILITY_HREF} icon={Play} className="mt-4 w-full sm:w-auto">
            Movilidad de 7 min
          </LinkButton>
          <NextSessionLine next={summary.nextSession} />
        </Shell>
      )

    case 'light-day':
      return (
        <Shell tone="sage" icon={Flower2} eyebrow={eyebrow} title="Día ligero">
          <p className="mt-3 text-sm text-ink-700">
            {summary.mobilityDoneToday
              ? 'Ya hiciste tu movilidad de hoy. ¡Bien hecho!'
              : 'Movilidad suave de 7 minutos si te nace. Descansar también está perfecto.'}
          </p>
          {!summary.mobilityDoneToday && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <LinkButton href={MOBILITY_HREF} icon={Play} className="w-full sm:w-auto">
                Comenzar movilidad
              </LinkButton>
              <SecondaryButton onClick={onMarkRest} icon={Moon}>
                Hoy prefiero descansar
              </SecondaryButton>
            </div>
          )}
          <NextSessionLine next={summary.nextSession} />
        </Shell>
      )

    case 'rest-day':
      return (
        <Shell tone="lavender" icon={Moon} eyebrow={eyebrow} title="Hoy toca descanso">
          <p className="mt-3 text-sm text-ink-700">Recarga energía. Tu cuerpo también se fortalece mientras descansa.</p>
          {!summary.mobilityDoneToday && (
            <LinkButton href={MOBILITY_HREF} variant="secondary" icon={Flower2} className="mt-3 -ml-4">
              Movilidad suave (opcional)
            </LinkButton>
          )}
          <NextSessionLine next={summary.nextSession} />
        </Shell>
      )
  }
}
