import { ChevronLeft, ChevronRight, HeartPulse, Infinity as BandIcon, ShieldCheck, Timer, TriangleAlert } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { ExerciseAnimation } from '../components/exercise/ExerciseAnimation'
import { ExerciseTimer } from '../components/exercise/ExerciseTimer'
import { Card } from '../components/ui/Card'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { SegmentedTabs } from '../components/ui/SegmentedTabs'
import { getExercise } from '../data/exercises'
import { getRoutine, routineTitle } from '../data/routines'
import { getWarmUp } from '../data/warmups'
import { partLength, routeHref, type ExercisePart, type Route } from '../lib/router'
import { parseRest, phasesForItem, type TimerPhase } from '../lib/timer'
import { cn, TONE_STYLES } from '../lib/tones'
import type { RoutineId, RoutineItem } from '../types'

type Tab = 'steps' | 'safety' | 'variations'

const TABS: Array<{ value: Tab; label: string }> = [
  { value: 'steps', label: 'Pasos' },
  { value: 'safety', label: 'Seguridad' },
  { value: 'variations', label: 'Variaciones' },
]

interface ExerciseDetailScreenProps {
  routineId: RoutineId
  part: ExercisePart
  index: number
}

/** Recorrido completo de la rutina: primero el calentamiento y luego los ejercicios. */
function sequence(routineId: RoutineId): Array<{ part: ExercisePart; index: number }> {
  const warmUp = Array.from({ length: partLength(routineId, 'warmup') }, (_, index) => ({ part: 'warmup' as const, index }))
  const main = Array.from({ length: partLength(routineId, 'main') }, (_, index) => ({ part: 'main' as const, index }))
  return [...warmUp, ...main]
}

function setsLabel(item: RoutineItem, part: ExercisePart): string {
  return part === 'warmup' || item.sets === 1 ? item.target : `${item.sets} × ${item.target}`
}

/**
 * Temporizador con el tiempo exacto del ejercicio (si va por tiempo)
 * o con el descanso entre series (si va por repeticiones).
 */
function TimerSection({ itemTarget, exerciseTarget, rest }: { itemTarget: string; exerciseTarget: string; rest?: string }) {
  const timedPhases = useMemo(() => phasesForItem(itemTarget, exerciseTarget), [itemTarget, exerciseTarget])
  const restRange = rest ? parseRest(rest) : null
  const [restSeconds, setRestSeconds] = useState(restRange?.min ?? 60)
  const restPhases = useMemo<TimerPhase[]>(() => [{ label: 'Descanso', seconds: restSeconds }], [restSeconds])

  if (timedPhases) {
    return <ExerciseTimer title="Temporizador" phases={timedPhases} doneMessage="¡Listo! Pasa al siguiente cuando quieras." />
  }
  if (restRange) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-ink-500">Haz las repeticiones a tu ritmo. Al terminar cada serie, inicia el descanso.</p>
        <ExerciseTimer
          title="Descanso entre series"
          phases={restPhases}
          doneMessage="Descanso terminado: a la siguiente serie."
          options={
            restRange.max > restRange.min
              ? [restRange.min, restRange.max].map((seconds) => ({
                  label: `${seconds} s`,
                  selected: restSeconds === seconds,
                  onSelect: () => setRestSeconds(seconds),
                }))
              : undefined
          }
        />
      </div>
    )
  }
  return (
    <p className="rounded-2xl bg-white/70 p-4 text-sm text-ink-700 ring-1 ring-ink-200/60">
      Este ejercicio va por repeticiones ({itemTarget}): hazlas a tu ritmo, sin prisa.
    </p>
  )
}

export function ExerciseDetailScreen({ routineId, part, index }: ExerciseDetailScreenProps) {
  const [tab, setTab] = useState<Tab>('steps')
  const panelId = useId()
  const routine = getRoutine(routineId)
  const items = part === 'warmup' ? (getWarmUp(routineId)?.items ?? []) : routine.items
  const item = items[index]
  const exercise = getExercise(item.exerciseId)
  const tone = part === 'warmup' ? 'sage' : routine.tone
  const toneStyle = TONE_STYLES[tone]

  const steps = sequence(routineId)
  const position = steps.findIndex((s) => s.part === part && s.index === index)
  const prev = steps[position - 1]
  const next = steps[position + 1]
  const toRoute = (s: { part: ExercisePart; index: number }): Route => ({ name: 'exercise', routineId, ...s })
  const nameAt = (s: { part: ExercisePart; index: number }) => {
    const list = s.part === 'warmup' ? (getWarmUp(routineId)?.items ?? []) : routine.items
    return getExercise(list[s.index]?.exerciseId ?? '')?.name ?? ''
  }

  if (!exercise) {
    return (
      <div className="space-y-5">
        <ScreenHeader title="Ejercicio no encontrado" backTo={{ name: 'routine', id: routineId }} />
      </div>
    )
  }

  const partLabel =
    part === 'warmup'
      ? `Calentamiento · ${index + 1} de ${items.length}`
      : `Ejercicio ${index + 1} de ${items.length}`

  return (
    <div className="space-y-5">
      <ScreenHeader title={exercise.name} subtitle={`${routineTitle(routine)} · ${partLabel}`} backTo={{ name: 'routine', id: routineId }} />

      <ul className="flex flex-wrap gap-2 text-sm font-semibold">
        <li className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1', toneStyle.bubble, toneStyle.text)}>
          {setsLabel(item, part)}
          {part === 'main' && /^[\d–-]+$/.test(item.target) && ' repeticiones'}
        </li>
        {part === 'main' && exercise.rest && (
          <li className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-ink-700 ring-1 ring-ink-200/60">
            <Timer size={15} aria-hidden="true" /> Descanso {exercise.rest}
          </li>
        )}
        <li className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-ink-700 ring-1 ring-ink-200/60">
          <BandIcon size={15} aria-hidden="true" /> {exercise.band === 'Sin liga' ? 'Sin liga' : 'Liga rosa'}
        </li>
      </ul>

      <ExerciseAnimation exerciseId={exercise.id} name={exercise.name} tone={tone} />

      <TimerSection
        itemTarget={item.target}
        exerciseTarget={exercise.target}
        rest={part === 'main' ? exercise.rest : undefined}
      />

      <p className="text-[15px] leading-relaxed text-ink-700">{exercise.description}</p>

      <SegmentedTabs label="Información del ejercicio" options={TABS} value={tab} onChange={setTab} panelId={panelId} />

      <div id={panelId} role="tabpanel" aria-label={TABS.find((t) => t.value === tab)?.label}>
        {tab === 'steps' && (
          <Card className="p-5">
            <ol className="space-y-3">
              {exercise.steps.map((stepText, i) => (
                <li key={stepText} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold', toneStyle.bubble, toneStyle.text)}
                  >
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-ink-900">{stepText}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-ink-100 pt-3 text-sm text-ink-500">
              <strong className="text-ink-700">Trabaja:</strong> {exercise.muscles.join(', ')}
            </p>
          </Card>
        )}

        {tab === 'safety' && (
          <div className="space-y-4">
            <Card className="p-5">
              <h2 className="flex items-center gap-2 font-bold">
                <ShieldCheck size={20} className="text-sage-700" aria-hidden="true" /> Cuida tu técnica
              </h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-700">
                {exercise.safety.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </Card>
            <Card className="p-5">
              <h2 className="flex items-center gap-2 font-bold">
                <TriangleAlert size={20} className="text-peach-700" aria-hidden="true" /> Errores comunes
              </h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-700">
                {exercise.mistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </Card>
            <Card tone="rose" className="flex gap-3 p-4">
              <HeartPulse size={20} className="mt-0.5 shrink-0 text-rose-700" aria-hidden="true" />
              <p className="text-sm text-ink-700">
                Detente si sientes dolor agudo, mareo, falta de aire inusual o un cansancio extraño. Parar a tiempo es
                cuidarte.
              </p>
            </Card>
          </div>
        )}

        {tab === 'variations' && (
          <Card className="p-5">
            <dl className="space-y-4">
              <div>
                <dt className="font-bold">Más fácil</dt>
                <dd className="mt-1 text-ink-700">{exercise.easier}</dd>
              </div>
              <div className="border-t border-ink-100 pt-4">
                <dt className="font-bold">Para avanzar (más adelante)</dt>
                <dd className="mt-1 text-ink-700">{exercise.progression}</dd>
              </div>
              <div className="border-t border-ink-100 pt-4">
                <dt className="font-bold">Liga</dt>
                <dd className="mt-1 text-ink-700">{exercise.band}</dd>
              </div>
              {exercise.equipment.length > 0 && (
                <div className="border-t border-ink-100 pt-4">
                  <dt className="font-bold">Necesitas</dt>
                  <dd className="mt-1 text-ink-700">{exercise.equipment.join(', ')}</dd>
                </div>
              )}
            </dl>
          </Card>
        )}
      </div>

      {/* Navegación entre ejercicios, como en el mockup: anterior · objetivo · siguiente */}
      <nav aria-label="Ejercicios de la rutina" className="flex items-center gap-3">
        {prev ? (
          <a
            href={routeHref(toRoute(prev))}
            aria-label={`Anterior: ${nameAt(prev)}`}
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white/85 shadow-soft ring-1 ring-ink-200/60 transition hover:bg-white"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </a>
        ) : (
          <span className="size-12 shrink-0" />
        )}
        <p className={cn('flex-1 rounded-full px-4 py-3 text-center text-sm font-semibold', toneStyle.bubble, toneStyle.text)}>
          {part === 'warmup' ? 'Calentamiento' : 'Ejercicio'} {index + 1} de {items.length}
        </p>
        {next ? (
          <a
            href={routeHref(toRoute(next))}
            aria-label={`Siguiente: ${nameAt(next)}`}
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-bloom-600 text-white shadow-lift transition hover:bg-bloom-700"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </a>
        ) : (
          <a
            href={routeHref({ name: 'routine', id: routineId })}
            className="inline-flex min-h-12 shrink-0 items-center rounded-full bg-bloom-600 px-4 text-sm font-semibold text-white shadow-lift transition hover:bg-bloom-700"
          >
            Ver rutina
          </a>
        )}
      </nav>
      {part === 'warmup' && next?.part === 'main' && (
        <p className="text-center text-sm text-ink-500">Siguiente: ¡empiezan los ejercicios de fuerza!</p>
      )}
    </div>
  )
}
