import { Check, ChevronLeft, ChevronRight, House, Infinity as BandIcon, SkipForward, TrendingUp, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ExerciseAnimation } from '../components/exercise/ExerciseAnimation'
import { ExerciseFigure } from '../components/exercise/ExerciseFigure'
import { ExerciseTimer } from '../components/exercise/ExerciseTimer'
import { LinkButton } from '../components/ui/Buttons'
import { Card } from '../components/ui/Card'
import { Emoji } from '../components/ui/Emoji'
import { getExercise } from '../data/exercises'
import { getRoutine, routineTitle } from '../data/routines'
import { createId } from '../lib/id'
import { goBack, routeHref } from '../lib/router'
import { unlockSound } from '../lib/sound'
import { STORAGE_KEY } from '../lib/storage'
import type { TimerPhase } from '../lib/timer'
import { cn, TONE_STYLES } from '../lib/tones'
import { buildSession, buildWorkout, resumableProgress, type WorkoutProgress, type WorkoutStep } from '../lib/workout'
import { useAppData } from '../state/useAppData'
import { useWakeLock } from '../state/useWakeLock'
import type { RoutineId, WorkoutSession } from '../types'

/** Entrenamiento a medias, para retomarlo si sales de la app (en iPhone pasa seguido). */
const PROGRESS_KEY = `${STORAGE_KEY}:entreno`

function loadProgress(routineId: RoutineId, stepCount: number): WorkoutProgress | null {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY)
    return raw ? resumableProgress(JSON.parse(raw), routineId, new Date(), stepCount) : null
  } catch {
    return null
  }
}

function saveProgress(progress: WorkoutProgress | null): void {
  try {
    if (progress) window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
    else window.localStorage.removeItem(PROGRESS_KEY)
  } catch {
    // Sin almacenamiento: el entrenamiento sigue, solo no se puede retomar.
  }
}

const PRIMARY =
  'inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-bloom-600 px-6 text-lg font-bold text-white shadow-lift transition hover:bg-bloom-700 active:scale-[0.98]'
const QUIET =
  'inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-ink-700 transition hover:bg-white/70'

function isReps(target: string): boolean {
  return /^[\d–-]+$/.test(target)
}

function stepTitle(step: Extract<WorkoutStep, { kind: 'exercise' }>): string {
  const base = step.part === 'warmup' ? `Calentamiento · ${step.position} de ${step.total}` : `Ejercicio ${step.position} de ${step.total}`
  return step.sets > 1 ? `${base} · Serie ${step.set} de ${step.sets}` : base
}

function RestStep({ step, onNext }: { step: Extract<WorkoutStep, { kind: 'rest' }>; onNext: () => void }) {
  const [seconds, setSeconds] = useState(step.min)
  const phases = useMemo<TimerPhase[]>(() => [{ label: 'Descanso', seconds }], [seconds])
  const next = getExercise(step.next.exerciseId)

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Descansa</h1>
        <p className="mt-1 text-ink-500">Respira hondo. Al terminar el tiempo pasamos a la siguiente serie.</p>
      </div>
      <ExerciseTimer
        title="Descanso"
        phases={phases}
        autoStart
        onDone={onNext}
        doneMessage="Descanso terminado: vamos con la siguiente."
        options={
          step.max > step.min
            ? [step.min, step.max].map((value) => ({
                label: `${value} s`,
                selected: seconds === value,
                onSelect: () => setSeconds(value),
              }))
            : undefined
        }
      />
      {next && (
        <Card className="flex items-center gap-3 p-3">
          <span className="block size-16 shrink-0 overflow-hidden rounded-xl bg-white">
            <ExerciseFigure exerciseId={next.id} frame={1} ghost className="size-full" />
          </span>
          <span className="min-w-0 text-sm text-ink-700">
            <span className="block text-xs font-semibold uppercase tracking-wide text-ink-500">Sigue</span>
            <strong className="block text-base text-ink-900">{next.name}</strong>
            {step.next.sets > 1 && `Serie ${step.next.set} de ${step.next.sets}`}
          </span>
        </Card>
      )}
      <button type="button" onClick={onNext} className={cn(QUIET, 'mx-auto flex')}>
        <SkipForward size={18} aria-hidden="true" /> Saltar descanso
      </button>
    </div>
  )
}

function ExerciseStep({
  step,
  tone,
  onDone,
}: {
  step: Extract<WorkoutStep, { kind: 'exercise' }>
  tone: Parameters<typeof ExerciseAnimation>[0]['tone']
  onDone: () => void
}) {
  const exercise = getExercise(step.exerciseId)
  const toneStyle = TONE_STYLES[tone]
  if (!exercise) return null

  return (
    <div className="space-y-5">
      <div>
        <p className={cn('inline-flex rounded-full px-3 py-1 text-sm font-semibold', toneStyle.bubble, toneStyle.text)}>
          {stepTitle(step)}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{exercise.name}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-ink-500">
          {!step.phases && (
            <span className="text-lg font-semibold text-ink-900">
              {step.target}
              {isReps(step.target) && ' repeticiones'}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm">
            <BandIcon size={15} aria-hidden="true" /> {exercise.band === 'Sin liga' ? 'Sin liga' : 'Liga rosa'}
          </span>
        </p>
      </div>

      <ExerciseAnimation exerciseId={exercise.id} name={exercise.name} tone={tone} />

      {step.phases && (
        <ExerciseTimer title="Temporizador" phases={step.phases} doneMessage="¡Listo! Pasa al siguiente cuando quieras." />
      )}

      <button type="button" onClick={onDone} className={PRIMARY}>
        <Check size={22} aria-hidden="true" />
        {step.part === 'warmup' ? 'Hecho, siguiente' : 'Serie hecha'}
      </button>

      <details className="rounded-2xl bg-white/85 p-4 ring-1 ring-ink-200/60">
        <summary className="cursor-pointer font-semibold">Cómo se hace</summary>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink-700">
          {exercise.steps.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ol>
        {exercise.safety.length > 0 && (
          <p className="mt-3 border-t border-ink-100 pt-3 text-sm text-ink-500">
            <strong className="text-ink-700">Cuida:</strong> {exercise.safety[0]}
          </p>
        )}
      </details>
    </div>
  )
}

function Summary({ session, onSaveNote }: { session: WorkoutSession; onSaveNote: (note: string) => void }) {
  const { account } = useAppData()
  const routine = getRoutine(session.routineId)
  const [note, setNote] = useState(session.note ?? '')
  const [saved, setSaved] = useState(false)
  const minutes = Math.max(1, Math.round((Date.parse(session.endedAt) - Date.parse(session.startedAt)) / 60_000))
  const completed = session.status === 'completed'

  return (
    <div className="space-y-5 text-center">
      <Emoji name={completed ? 'party-popper' : 'seedling'} size={72} className="mx-auto" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{completed ? '¡Rutina completada!' : 'Buen trabajo por hoy'}</h1>
        <p className="mt-2 text-ink-700">
          {routineTitle(routine)} · {minutes} min
          {session.completedSets.length > 0 && ` · ${session.completedSets.length} series`}
        </p>
        {completed && account.email && (
          <p className="mt-2 text-sm font-semibold text-sage-700">Se marcó «Hacer ejercicio» en Mi Semana 💪</p>
        )}
        {!completed && <p className="mt-2 text-sm text-ink-500">Lo que hiciste cuenta. Parar a tiempo también es cuidarte.</p>}
      </div>

      <Card className="p-4 text-left">
        <label htmlFor="workout-note" className="font-semibold">
          ¿Cómo te sentiste? <span className="font-normal text-ink-500">(opcional)</span>
        </label>
        <textarea
          id="workout-note"
          value={note}
          maxLength={280}
          rows={3}
          placeholder="Ej. La sentadilla salió más fácil, subo la liga la próxima."
          onChange={(event) => {
            setNote(event.target.value)
            setSaved(false)
          }}
          className="mt-2 w-full resize-y rounded-xl bg-bloom-50 p-3 text-base ring-1 ring-bloom-200 placeholder:text-ink-400"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span role="status" className="text-sm text-sage-700">
            {saved && 'Guardado'}
          </span>
          <button
            type="button"
            disabled={!note.trim()}
            onClick={() => {
              onSaveNote(note)
              setSaved(true)
            }}
            className="inline-flex min-h-11 items-center rounded-full bg-bloom-600 px-5 font-semibold text-white transition hover:bg-bloom-700 disabled:bg-ink-200 disabled:text-ink-500"
          >
            Guardar nota
          </button>
        </div>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <LinkButton href={routeHref({ name: 'home' })} icon={House}>
          Ir a Inicio
        </LinkButton>
        <LinkButton href={routeHref({ name: 'progress' })} icon={TrendingUp} variant="secondary">
          Ver mi progreso
        </LinkButton>
      </div>
    </div>
  )
}

/**
 * Entrenamiento guiado: calentamiento y cada serie con su descanso, uno a la vez.
 * Se guarda el avance por si sales de la app; al terminar se guarda la sesión
 * (y con cuenta, se palomea "Hacer ejercicio" en Mi Semana).
 */
export function WorkoutScreen({ routineId }: { routineId: RoutineId }) {
  const { addSession } = useAppData()
  const routine = getRoutine(routineId)
  const steps = useMemo(() => buildWorkout(routineId), [routineId])
  const [progress, setProgress] = useState<WorkoutProgress>(
    () => loadProgress(routineId, steps.length) ?? { routineId, step: 0, startedAt: new Date().toISOString(), completedSets: [] },
  )
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [confirmingEnd, setConfirmingEnd] = useState(false)

  useWakeLock(!session)

  useEffect(() => {
    saveProgress(session ? null : progress)
  }, [progress, session])

  function finish(status: WorkoutSession['status'], completedSets = progress.completedSets) {
    const done = buildSession({ id: createId(), routineId, startedAt: progress.startedAt, endedAt: new Date(), completedSets, status })
    addSession(done)
    setSession(done)
    window.scrollTo({ top: 0 })
  }

  function next() {
    // Este toque permite que suene el aviso del descanso que arranca solo.
    unlockSound()
    const current = steps[progress.step]
    const completedSets =
      current.kind === 'exercise' && current.part === 'main'
        ? [...progress.completedSets, { exerciseId: current.exerciseId, setNumber: current.set, completedAt: new Date().toISOString() }]
        : progress.completedSets
    if (progress.step + 1 >= steps.length) {
      finish('completed', completedSets)
      return
    }
    setProgress({ ...progress, step: progress.step + 1, completedSets })
    window.scrollTo({ top: 0 })
  }

  function back() {
    if (progress.step === 0) return
    const previous = steps[progress.step - 1]
    // Al regresar a una serie, deja de contar como hecha.
    const completedSets =
      previous.kind === 'exercise' && previous.part === 'main'
        ? progress.completedSets.filter((s) => !(s.exerciseId === previous.exerciseId && s.setNumber === previous.set))
        : progress.completedSets
    setProgress({ ...progress, step: progress.step - 1, completedSets })
  }

  function endNow() {
    if (progress.completedSets.length === 0) {
      saveProgress(null)
      goBack({ name: 'routine', id: routineId })
      return
    }
    finish('ended-early')
  }

  const step = steps[progress.step]
  const percent = session ? 100 : Math.round((progress.step / steps.length) * 100)

  return (
    <div className="min-h-dvh">
      <main className="mx-auto w-full max-w-md px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] md:max-w-xl md:pt-8">
        <header className="mb-5">
          <div className="flex items-center gap-3">
            {!session && (
              <button
                type="button"
                onClick={() => setConfirmingEnd(true)}
                aria-label="Terminar entrenamiento"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/85 shadow-soft ring-1 ring-ink-200/60 transition hover:bg-white"
              >
                <X size={20} aria-hidden="true" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{routineTitle(routine)}</p>
              <div
                className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/70 ring-1 ring-ink-200/60"
                role="progressbar"
                aria-label="Avance del entrenamiento"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span className="block h-full rounded-full bg-bloom-500 transition-all" style={{ width: `${percent}%` }} />
              </div>
            </div>
          </div>

          {confirmingEnd && !session && (
            <div role="group" aria-labelledby="end-title" className="mt-4 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-ink-200/60">
              <p id="end-title" className="font-semibold">
                ¿Terminar ahora?
              </p>
              <p className="mt-1 text-sm text-ink-500">
                {progress.completedSets.length > 0
                  ? `Se guarda lo que llevas (${progress.completedSets.length} series) como entrenamiento terminado antes.`
                  : 'Todavía no hay series hechas, así que no se guarda nada.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setConfirmingEnd(false)} className="min-h-11 rounded-full px-4 font-semibold text-ink-700 ring-1 ring-ink-200 hover:bg-ink-100">
                  Seguir entrenando
                </button>
                <button type="button" onClick={endNow} className="min-h-11 rounded-full bg-rose-700 px-4 font-semibold text-white hover:bg-rose-500">
                  Terminar
                </button>
              </div>
            </div>
          )}
        </header>

        {session ? (
          <Summary session={session} onSaveNote={(note) => addSession({ ...session, note: note.trim() })} />
        ) : (
          <div key={progress.step}>
            {step.kind === 'rest' ? (
              <RestStep step={step} onNext={next} />
            ) : (
              <ExerciseStep step={step} tone={step.part === 'warmup' ? 'sage' : routine.tone} onDone={next} />
            )}
            <div className="mt-6 flex items-center justify-between text-sm text-ink-500">
              <button type="button" onClick={back} disabled={progress.step === 0} className={cn(QUIET, 'disabled:opacity-30')}>
                <ChevronLeft size={18} aria-hidden="true" /> Anterior
              </button>
              <span className="tabular-nums">
                Paso {progress.step + 1} de {steps.length}
              </span>
              <button type="button" onClick={() => setConfirmingEnd(true)} className={QUIET}>
                Terminar <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
