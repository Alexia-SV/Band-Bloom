import { ArrowLeft, Info, Timer } from 'lucide-react'
import { ROUTINE_ICONS } from '../components/routineIcons'
import { Card } from '../components/ui/Card'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { IconBubble } from '../components/ui/IconBubble'
import { getExercise } from '../data/exercises'
import { getRoutine, routineTitle } from '../data/routines'
import { goBack } from '../lib/router'
import { TONE_STYLES } from '../lib/tones'
import type { RoutineId } from '../types'

/** Vista previa de la rutina. En las Etapas 3 y 4 se convierte en el detalle completo con modo entrenamiento. */
export function RoutinePreviewScreen({ routineId }: { routineId: RoutineId }) {
  const routine = getRoutine(routineId)
  const tone = TONE_STYLES[routine.tone]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => goBack({ name: 'routines' })}
          aria-label="Regresar"
          className="inline-flex size-11 items-center justify-center rounded-full bg-white/85 shadow-soft ring-1 ring-ink-200/60 transition hover:bg-white"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <FavoriteButton routineId={routine.id} />
      </div>

      <header className="flex items-start gap-4">
        <IconBubble icon={ROUTINE_ICONS[routine.kind]} tone={routine.tone} size="lg" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{routineTitle(routine)}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-ink-500">
            <Timer size={16} aria-hidden="true" />
            {routine.durationLabel} · {routine.items.length} ejercicios
          </p>
        </div>
      </header>

      <dl className="grid gap-3 sm:grid-cols-2">
        <Card className="p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-500">Trabaja</dt>
          <dd className="mt-1 text-sm font-medium">{routine.muscleGroups.join(' · ')}</dd>
        </Card>
        <Card className="p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-500">Necesitas</dt>
          <dd className="mt-1 text-sm font-medium">{routine.equipment.join(' · ')}</dd>
        </Card>
      </dl>

      <section aria-labelledby="exercise-list-title">
        <h2 id="exercise-list-title" className="mb-3 text-lg font-bold">
          Ejercicios
        </h2>
        <ol className="space-y-3">
          {routine.items.map((item, index) => (
            <li key={item.exerciseId}>
              <Card className="flex items-center gap-4 p-4">
                <span
                  aria-hidden="true"
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${tone.bubble} ${tone.text}`}
                >
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold">{getExercise(item.exerciseId)?.name ?? item.exerciseId}</p>
                  <p className="text-sm text-ink-500">
                    {item.sets} × {item.target}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <Card tone="lavender" className="flex gap-3 p-4">
        <Info size={20} className="mt-0.5 shrink-0 text-bloom-700" aria-hidden="true" />
        <p className="text-sm text-ink-700">
          Pronto podrás ver cada ejercicio paso a paso e iniciar la rutina guiada con series, descansos y temporizador.
        </p>
      </Card>
    </div>
  )
}
