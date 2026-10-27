import { Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { playDoneSound, playPhaseSound, unlockSound } from '../../lib/sound'
import {
  formatClock,
  initialTimerState,
  PREP_SECONDS,
  timerReducer,
  totalSeconds,
  type TimerAction,
  type TimerPhase,
  type TimerState,
} from '../../lib/timer'
import { cn } from '../../lib/tones'
import { useWakeLock } from '../../state/useWakeLock'

const SOUND_KEY = 'band-and-bloom:timer-sound'

function readSoundPreference(): boolean {
  try {
    return window.localStorage.getItem(SOUND_KEY) !== 'off'
  } catch {
    return true
  }
}

interface ExerciseTimerProps {
  title: string
  phases: TimerPhase[]
  /** Mensaje al terminar. */
  doneMessage: string
  /** Opciones de duración (por ejemplo, descanso de 60 o 90 s). */
  options?: { label: string; selected: boolean; onSelect: () => void }[]
  /** Arranca solo al aparecer (por ejemplo, el descanso entre series del entrenamiento guiado). */
  autoStart?: boolean
  /** Se llama cuando el tiempo termina solo. */
  onDone?: () => void
}

const RING_RADIUS = 64
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

/** Temporizador con las fases exactas del ejercicio: preparar 3 s, contar, avisar con sonido y terminar. */
export function ExerciseTimer({ title, phases, doneMessage, options, autoStart, onDone }: ExerciseTimerProps) {
  const reducer = useMemo(() => (state: TimerState, action: TimerAction) => timerReducer(phases, state, action), [phases])
  const [state, dispatch] = useReducer(reducer, phases, initialTimerState)
  const [now, setNow] = useState(() => Date.now())
  const [soundOn, setSoundOn] = useState(readSoundPreference)
  const [announcement, setAnnouncement] = useState('')
  const previous = useRef(state)

  const active = state.status === 'running' || state.status === 'prep'
  useWakeLock(active)

  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  // Reinicia si cambian las fases (por ejemplo, al elegir 60 o 90 s de descanso).
  // Con `autoStart`, vuelve a arrancar solo con la nueva duración.
  useEffect(() => {
    dispatch({ type: 'reset' })
    if (autoStart) dispatch({ type: 'start', now: Date.now(), skipPrep: true })
  }, [phases, autoStart])

  // Mientras corre, revisamos la hora varias veces por segundo y al volver a la app.
  useEffect(() => {
    if (!active) return
    const tick = () => {
      const time = Date.now()
      setNow(time)
      dispatch({ type: 'tick', now: time })
    }
    const interval = window.setInterval(tick, 200)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [active])

  // Sonido y anuncio para lectores de pantalla en cada cambio de fase.
  useEffect(() => {
    const before = previous.current
    previous.current = state
    const phaseStarted =
      state.status === 'running' && (before.status === 'prep' || state.phaseIndex !== before.phaseIndex)
    if (phaseStarted) {
      const phase = phases[state.phaseIndex]
      if (soundOn) playPhaseSound()
      setAnnouncement(`${phase.label}: ${phase.seconds} segundos`)
    } else if (state.status === 'done' && before.status !== 'done') {
      if (soundOn) playDoneSound()
      setAnnouncement(doneMessage)
      onDoneRef.current?.()
    }
  }, [state, phases, soundOn, doneMessage])

  function toggleSound() {
    setSoundOn((value) => {
      const next = !value
      try {
        window.localStorage.setItem(SOUND_KEY, next ? 'on' : 'off')
      } catch {
        // Preferencia solo para esta sesión.
      }
      if (next) unlockSound()
      return next
    })
  }

  function primaryAction() {
    const time = Date.now()
    setNow(time)
    if (state.status === 'idle' || state.status === 'done') {
      if (soundOn) unlockSound()
      dispatch({ type: 'start', now: time })
    } else if (state.status === 'paused') {
      dispatch({ type: 'resume', now: time })
    } else {
      dispatch({ type: 'pause', now: time })
    }
  }

  const phase = phases[state.phaseIndex]
  const remainingMs =
    state.endsAt !== null ? Math.max(0, state.endsAt - now) : state.status === 'idle' ? phase.seconds * 1000 : state.remainingMs
  const isPrep = state.status === 'prep' || (state.status === 'paused' && state.pausedFrom === 'prep')
  const phaseMs = isPrep ? PREP_SECONDS * 1000 : phase.seconds * 1000
  const progress = state.status === 'done' ? 1 : state.status === 'idle' ? 0 : 1 - remainingMs / phaseMs
  const nextPhase = phases[state.phaseIndex + 1]

  const primaryLabel =
    state.status === 'idle' ? 'Iniciar' : state.status === 'done' ? 'Otra vez' : state.status === 'paused' ? 'Reanudar' : 'Pausar'
  const PrimaryIcon = state.status === 'running' || state.status === 'prep' ? Pause : state.status === 'done' ? RotateCcw : Play

  return (
    <section aria-label={title} className="rounded-card bg-bloom-900 p-5 text-white shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">{title}</h2>
          <p className="text-sm text-bloom-200">{formatClock(totalSeconds(phases))} en total</p>
        </div>
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label="Sonido del temporizador"
          className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
        >
          {soundOn ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}
        </button>
      </div>

      {options && options.length > 1 && (
        <div role="group" aria-label="Duración" className="mt-4 grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-white/10 p-1">
          {options.map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={option.selected}
              // En un descanso que arranca solo, cambiar la duración lo reinicia con el nuevo tiempo.
              disabled={active && !autoStart}
              onClick={option.onSelect}
              className={cn(
                'min-h-10 rounded-full text-sm font-semibold transition-colors disabled:opacity-50',
                option.selected ? 'bg-white text-bloom-900' : 'text-white hover:bg-white/10',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative mx-auto mt-5 size-48">
        <svg viewBox="0 0 160 160" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="80" cy="80" r={RING_RADIUS} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="10" />
          <circle
            cx="80"
            cy="80"
            r={RING_RADIUS}
            fill="none"
            stroke={isPrep ? '#c5b9fa' : '#f38aa7'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - Math.min(1, Math.max(0, progress)))}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p role="timer" className="text-5xl font-bold tabular-nums tracking-tight">
            {state.status === 'done' ? '0:00' : isPrep ? Math.ceil(remainingMs / 1000) : formatClock(remainingMs / 1000)}
          </p>
          <p className="mt-1 max-w-36 text-sm leading-tight text-bloom-100">
            {state.status === 'done' ? '¡Listo!' : isPrep ? 'Prepárate' : phase.label}
          </p>
        </div>
      </div>

      <p className="mt-3 min-h-5 text-center text-sm text-bloom-200">
        {state.status === 'done'
          ? doneMessage
          : phases.length > 1
            ? `Parte ${state.phaseIndex + 1} de ${phases.length}${nextPhase ? ` · Sigue: ${nextPhase.label.toLowerCase()}` : ''}`
            : state.status === 'idle'
              ? `Empieza con ${PREP_SECONDS} segundos para acomodarte.`
              : ''}
      </p>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => dispatch({ type: 'reset' })}
          disabled={state.status === 'idle'}
          aria-label="Reiniciar temporizador"
          className="inline-flex size-12 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-30"
        >
          <RotateCcw size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={primaryAction}
          className="inline-flex min-h-14 min-w-36 items-center justify-center gap-2 rounded-full bg-white px-6 text-base font-bold text-bloom-900 transition hover:bg-bloom-50"
        >
          <PrimaryIcon size={20} className={PrimaryIcon === Play ? 'fill-current' : undefined} aria-hidden="true" />
          {primaryLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            const time = Date.now()
            setNow(time)
            dispatch({ type: 'skip', now: time })
          }}
          disabled={state.status === 'idle' || state.status === 'done'}
          aria-label={phases.length > 1 ? 'Saltar a la siguiente parte' : 'Terminar ahora'}
          className="inline-flex size-12 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-30"
        >
          <SkipForward size={20} aria-hidden="true" />
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </section>
  )
}
