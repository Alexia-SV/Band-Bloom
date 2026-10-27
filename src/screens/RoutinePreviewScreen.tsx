import { ArrowLeft, Info, Play, Timer } from 'lucide-react'
import { ExerciseListItem } from '../components/exercise/ExerciseListItem'
import { ROUTINE_EMOJI } from '../components/routineIcons'
import { LinkButton } from '../components/ui/Buttons'
import { Emoji } from '../components/ui/Emoji'
import { Card } from '../components/ui/Card'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { IconBubble } from '../components/ui/IconBubble'
import { ROUTINE_COVERS } from '../data/covers'
import { getRoutine, routineTitle } from '../data/routines'
import { getWarmUp } from '../data/warmups'
import { goBack, routeHref } from '../lib/router'
import type { RoutineId } from '../types'

/** Detalle de la rutina: calentamiento + ejercicios, cada uno con imagen y enlace a su explicación. */
export function RoutinePreviewScreen({ routineId }: { routineId: RoutineId }) {
  const routine = getRoutine(routineId)
  const warmUp = getWarmUp(routineId)
  const cover = ROUTINE_COVERS[routineId]

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

      <figure className="overflow-hidden rounded-card shadow-soft">
        <img
          src={cover.src}
          alt={cover.alt}
          decoding="async"
          className="h-44 w-full object-cover sm:h-56"
          style={{ objectPosition: cover.position }}
        />
      </figure>

      <header className="flex items-start gap-4">
        <IconBubble emoji={ROUTINE_EMOJI[routine.kind]} tone={routine.tone} size="lg" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{routineTitle(routine)}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-ink-500">
            <Timer size={16} aria-hidden="true" />
            {routine.durationLabel} · {routine.items.length} ejercicios
            {warmUp && <span>+ {warmUp.durationLabel} de calentamiento</span>}
          </p>
        </div>
      </header>

      <LinkButton href={routeHref({ name: 'workout', routineId })} icon={Play} className="w-full sm:w-auto">
        Empezar rutina
      </LinkButton>

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

      {warmUp && (
        <section aria-labelledby="warmup-title" className="space-y-3">
          <div>
            <h2 id="warmup-title" className="flex items-center gap-2 text-lg font-bold">
              <Emoji name="fire" size={24} />
              Calentamiento · {warmUp.durationLabel}
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              {warmUp.focus} Movimientos suaves y controlados: no se trata de cansarte.
            </p>
          </div>
          <ol className="space-y-2.5">
            {warmUp.items.map((item, index) => (
              <li key={item.exerciseId}>
                <ExerciseListItem
                  href={routeHref({ name: 'exercise', routineId, part: 'warmup', index })}
                  exerciseId={item.exerciseId}
                  number={index + 1}
                  detail={item.target}
                  tone="sage"
                />
              </li>
            ))}
          </ol>
        </section>
      )}

      <section aria-labelledby="exercise-list-title" className="space-y-3">
        <h2 id="exercise-list-title" className="text-lg font-bold">
          Ejercicios
        </h2>
        <ol className="space-y-2.5">
          {routine.items.map((item, index) => (
            <li key={item.exerciseId}>
              <ExerciseListItem
                href={routeHref({ name: 'exercise', routineId, part: 'main', index })}
                exerciseId={item.exerciseId}
                number={index + 1}
                detail={item.sets > 1 ? `${item.sets} × ${item.target}` : item.target}
                tone={routine.tone}
              />
            </li>
          ))}
        </ol>
      </section>

      {warmUp && (
        <Card tone="sage" className="flex gap-3 p-4">
          <Info size={20} className="mt-0.5 shrink-0 text-sage-700" aria-hidden="true" />
          <p className="text-sm text-ink-700">
            Al terminar, si te apetece, la <a href={routeHref({ name: 'routine', id: 'mobility' })} className="font-semibold text-sage-700 underline underline-offset-2">movilidad diaria</a>{' '}
            incluye estiramientos más largos. Los estiramientos sostenidos van mejor después de entrenar que antes.
          </p>
        </Card>
      )}

      <Card tone="lavender" className="flex gap-3 p-4">
        <Info size={20} className="mt-0.5 shrink-0 text-bloom-700" aria-hidden="true" />
        <p className="text-sm text-ink-700">
          Toca cualquier ejercicio para ver cómo se hace. Con <strong>Empezar rutina</strong> te guiamos serie por
          serie, con descansos y temporizador.
        </p>
      </Card>
    </div>
  )
}
