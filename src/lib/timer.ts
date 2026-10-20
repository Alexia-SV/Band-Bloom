/**
 * Temporizador de ejercicios: convierte el objetivo escrito ("30 s por lado",
 * "15 s por dirección, cada pie", "20 s atrás + 20 s adelante") en fases con su
 * duración exacta, y controla el conteo con una máquina de estados pura.
 *
 * El conteo se basa en la hora de término (no en restar 1 cada segundo),
 * así no se desfasa si el teléfono pausa la pestaña un momento.
 */

export interface TimerPhase {
  label: string
  seconds: number
}

const SEGMENT = /^(\d+)\s*(s|seg|segundos?|min|minutos?)\b\s*(.*)$/i

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Fases de un objetivo con tiempo, o null si es de repeticiones ("8–12", "10 por pierna"). */
export function parseTimedTarget(target: string): TimerPhase[] | null {
  // ", cada pie" / ", cada pierna": repite todo el bloque para cada lado.
  const eachSide = /,\s*cada (pie|pierna)\s*$/i.exec(target)
  const base = eachSide ? target.slice(0, eachSide.index) : target

  const phases: TimerPhase[] = []
  for (const rawPart of base.split('+')) {
    const match = SEGMENT.exec(rawPart.trim())
    if (!match) return null
    const amount = Number(match[1])
    const seconds = /^min/i.test(match[2]) ? amount * 60 : amount
    const rest = match[3].trim()

    if (/^por direcci[oó]n$/i.test(rest)) {
      phases.push({ label: 'Hacia un lado', seconds }, { label: 'Hacia el otro lado', seconds })
    } else if (/^por lado$/i.test(rest)) {
      phases.push({ label: 'Primer lado', seconds }, { label: 'Segundo lado', seconds })
    } else {
      phases.push({ label: rest ? capitalize(rest) : 'Tiempo', seconds })
    }
  }

  if (!eachSide) return phases
  const sideName = eachSide[1].toLowerCase() === 'pie' ? 'Pie' : 'Pierna'
  return [1, 2].flatMap((n) =>
    phases.map((phase) => ({
      label: phase.label === 'Tiempo' ? `${sideName} ${n}` : `${sideName} ${n} · ${phase.label.toLowerCase()}`,
      seconds: phase.seconds,
    })),
  )
}

export function totalSeconds(phases: TimerPhase[]): number {
  return phases.reduce((sum, phase) => sum + phase.seconds, 0)
}

/**
 * Fases para un ejercicio dentro de una rutina. Si la rutina solo dice "1 min"
 * pero el ejercicio detalla cómo repartir ese minuto (por ejemplo, 30 s atrás + 30 s adelante),
 * se usan las fases detalladas, siempre que sumen exactamente lo mismo.
 */
export function phasesForItem(itemTarget: string, exerciseTarget: string): TimerPhase[] | null {
  const fromItem = parseTimedTarget(itemTarget)
  if (!fromItem) return null
  if (fromItem.length === 1) {
    const detailed = parseTimedTarget(exerciseTarget)
    if (detailed && detailed.length > 1 && totalSeconds(detailed) === totalSeconds(fromItem)) return detailed
  }
  return fromItem
}

/** "60–90 s" → { min: 60, max: 90 }; "60 s" → { min: 60, max: 60 }. */
export function parseRest(rest: string): { min: number; max: number } | null {
  const match = /^(\d+)\s*(?:[–-]\s*(\d+))?\s*s$/.exec(rest.trim())
  if (!match) return null
  const min = Number(match[1])
  return { min, max: match[2] ? Number(match[2]) : min }
}

/** 75 → "1:15" */
export function formatClock(totalSecondsValue: number): string {
  const safe = Math.max(0, Math.ceil(totalSecondsValue))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// ——— Máquina de estados ———

export const PREP_SECONDS = 3

export type TimerStatus = 'idle' | 'prep' | 'running' | 'paused' | 'done'

export interface TimerState {
  status: TimerStatus
  phaseIndex: number
  /** Hora (ms) en que termina la fase actual o la preparación. */
  endsAt: number | null
  /** Milisegundos que quedaban al pausar. */
  remainingMs: number
  /** Estado al que se vuelve al reanudar. */
  pausedFrom: 'prep' | 'running' | null
}

export type TimerAction =
  | { type: 'start'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'reset' }
  | { type: 'skip'; now: number }
  | { type: 'tick'; now: number }

export function initialTimerState(phases: TimerPhase[]): TimerState {
  return { status: 'idle', phaseIndex: 0, endsAt: null, remainingMs: (phases[0]?.seconds ?? 0) * 1000, pausedFrom: null }
}

export function timerReducer(phases: TimerPhase[], state: TimerState, action: TimerAction): TimerState {
  const durationMs = (index: number) => (phases[index]?.seconds ?? 0) * 1000

  switch (action.type) {
    case 'start':
      if (state.status !== 'idle' && state.status !== 'done') return state
      return { status: 'prep', phaseIndex: 0, endsAt: action.now + PREP_SECONDS * 1000, remainingMs: durationMs(0), pausedFrom: null }

    case 'pause':
      if ((state.status !== 'running' && state.status !== 'prep') || state.endsAt === null) return state
      return { ...state, status: 'paused', remainingMs: Math.max(0, state.endsAt - action.now), endsAt: null, pausedFrom: state.status }

    case 'resume':
      if (state.status !== 'paused' || !state.pausedFrom) return state
      return { ...state, status: state.pausedFrom, endsAt: action.now + state.remainingMs, pausedFrom: null }

    case 'reset':
      return initialTimerState(phases)

    case 'skip': {
      if (state.status === 'idle' || state.status === 'done') return state
      const next = state.status === 'prep' || state.pausedFrom === 'prep' ? 0 : state.phaseIndex + 1
      if (next >= phases.length) return { ...state, status: 'done', endsAt: null, remainingMs: 0, pausedFrom: null }
      if (state.status === 'paused') return { ...state, phaseIndex: next, remainingMs: durationMs(next), pausedFrom: 'running' }
      return { ...state, status: 'running', phaseIndex: next, endsAt: action.now + durationMs(next), remainingMs: durationMs(next) }
    }

    case 'tick': {
      if ((state.status !== 'running' && state.status !== 'prep') || state.endsAt === null) return state
      let { status, phaseIndex, endsAt } = state
      // Si pasó más de una fase (por ejemplo, con la pantalla bloqueada), avanzamos las que hagan falta.
      while (endsAt !== null && action.now >= endsAt) {
        if (status === 'prep') {
          status = 'running'
          endsAt += durationMs(0)
        } else if (phaseIndex + 1 < phases.length) {
          phaseIndex += 1
          endsAt += durationMs(phaseIndex)
        } else {
          return { status: 'done', phaseIndex, endsAt: null, remainingMs: 0, pausedFrom: null }
        }
      }
      return { ...state, status, phaseIndex, endsAt, remainingMs: endsAt === null ? 0 : endsAt - action.now }
    }
  }
}
