import { describe, expect, it } from 'vitest'
import { EXERCISES, getExercise } from '../data/exercises'
import { ROUTINES } from '../data/routines'
import { WARMUPS } from '../data/warmups'
import {
  formatClock,
  initialTimerState,
  parseRest,
  parseTimedTarget,
  phasesForItem,
  PREP_SECONDS,
  timerReducer,
  totalSeconds,
  type TimerPhase,
  type TimerState,
} from './timer'

describe('parseTimedTarget', () => {
  it('lee duraciones simples', () => {
    expect(parseTimedTarget('1 min')).toEqual([{ label: 'Tiempo', seconds: 60 }])
    expect(parseTimedTarget('30 s')).toEqual([{ label: 'Tiempo', seconds: 30 }])
  })

  it('divide por dirección, por lado y por pie', () => {
    expect(parseTimedTarget('30 s por lado')).toEqual([
      { label: 'Primer lado', seconds: 30 },
      { label: 'Segundo lado', seconds: 30 },
    ])
    const ankles = parseTimedTarget('15 s por dirección, cada pie')
    expect(ankles?.map((p) => p.label)).toEqual([
      'Pie 1 · hacia un lado',
      'Pie 1 · hacia el otro lado',
      'Pie 2 · hacia un lado',
      'Pie 2 · hacia el otro lado',
    ])
    expect(totalSeconds(ankles!)).toBe(60)
  })

  it('suma partes con +', () => {
    expect(parseTimedTarget('20 s atrás + 20 s adelante')).toEqual([
      { label: 'Atrás', seconds: 20 },
      { label: 'Adelante', seconds: 20 },
    ])
  })

  it('devuelve null para repeticiones', () => {
    for (const target of ['8–12', '10 por pierna', '10 adelante + 10 atrás', '6 respiraciones', '8']) {
      expect(parseTimedTarget(target), target).toBeNull()
    }
  })

  it('en la movilidad, "1 min" usa el reparto detallado del ejercicio si suma lo mismo', () => {
    expect(phasesForItem('1 min', '30 s atrás + 30 s adelante')?.map((p) => p.seconds)).toEqual([30, 30])
    expect(phasesForItem('1 min', '1 min')).toEqual([{ label: 'Tiempo', seconds: 60 }])
    // Si no suma lo mismo, se respeta lo que dice la rutina.
    expect(phasesForItem('1 min', '30 s por lado, cada pie')).toEqual([{ label: 'Tiempo', seconds: 60 }])
  })

  it('todos los objetivos con tiempo del catálogo se pueden cronometrar', () => {
    const targets = [
      ...ROUTINES.flatMap((r) => r.items.map((i) => ({ target: i.target, exercise: i.exerciseId }))),
      ...Object.values(WARMUPS).flatMap((w) => w!.items.map((i) => ({ target: i.target, exercise: i.exerciseId }))),
      ...EXERCISES.map((e) => ({ target: e.target, exercise: e.id })),
    ]
    for (const { target, exercise } of targets) {
      if (!/\d\s*(s|min)\b/.test(target)) continue
      const phases = phasesForItem(target, getExercise(exercise)!.target)
      expect(phases, `${exercise}: ${target}`).not.toBeNull()
      expect(totalSeconds(phases!)).toBeGreaterThan(0)
    }
  })
})

describe('parseRest y formatClock', () => {
  it('lee rangos de descanso', () => {
    expect(parseRest('60–90 s')).toEqual({ min: 60, max: 90 })
    expect(parseRest('45-60 s')).toEqual({ min: 45, max: 60 })
    expect(parseRest('60 s')).toEqual({ min: 60, max: 60 })
    expect(parseRest('un rato')).toBeNull()
  })

  it('formatea minutos y segundos', () => {
    expect(formatClock(75)).toBe('1:15')
    expect(formatClock(9.2)).toBe('0:10')
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(-3)).toBe('0:00')
  })
})

describe('timerReducer', () => {
  const phases: TimerPhase[] = [
    { label: 'Primer lado', seconds: 30 },
    { label: 'Segundo lado', seconds: 30 },
  ]
  const run = (state: TimerState, action: Parameters<typeof timerReducer>[2]) => timerReducer(phases, state, action)
  const prepMs = PREP_SECONDS * 1000

  it('prepara 3 s, luego cuenta cada fase con su duración exacta y termina', () => {
    let s = run(initialTimerState(phases), { type: 'start', now: 0 })
    expect(s.status).toBe('prep')
    s = run(s, { type: 'tick', now: prepMs })
    expect(s).toMatchObject({ status: 'running', phaseIndex: 0, remainingMs: 30_000 })
    s = run(s, { type: 'tick', now: prepMs + 30_000 })
    expect(s).toMatchObject({ status: 'running', phaseIndex: 1, remainingMs: 30_000 })
    s = run(s, { type: 'tick', now: prepMs + 60_000 })
    expect(s.status).toBe('done')
  })

  it('sin preparación (descansos): cuenta desde el primer momento', () => {
    let s = run(initialTimerState(phases), { type: 'start', now: 0, skipPrep: true })
    expect(s).toMatchObject({ status: 'running', phaseIndex: 0, remainingMs: 30_000 })
    s = run(s, { type: 'tick', now: 60_000 })
    expect(s.status).toBe('done')
  })

  it('pausar conserva el tiempo restante y reanudar continúa desde ahí', () => {
    let s = run(initialTimerState(phases), { type: 'start', now: 0 })
    s = run(s, { type: 'tick', now: prepMs + 10_000 })
    s = run(s, { type: 'pause', now: prepMs + 10_000 })
    expect(s).toMatchObject({ status: 'paused', remainingMs: 20_000 })
    // Pasa mucho tiempo en pausa: no cambia nada.
    s = run(s, { type: 'tick', now: 999_999 })
    expect(s.remainingMs).toBe(20_000)
    s = run(s, { type: 'resume', now: 1_000_000 })
    s = run(s, { type: 'tick', now: 1_005_000 })
    expect(s).toMatchObject({ status: 'running', phaseIndex: 0, remainingMs: 15_000 })
  })

  it('si la pantalla estuvo bloqueada, avanza las fases que ya pasaron', () => {
    let s = run(initialTimerState(phases), { type: 'start', now: 0 })
    s = run(s, { type: 'tick', now: prepMs + 45_000 })
    expect(s).toMatchObject({ status: 'running', phaseIndex: 1, remainingMs: 15_000 })
  })

  it('saltar pasa a la siguiente fase y termina después de la última', () => {
    let s = run(initialTimerState(phases), { type: 'start', now: 0 })
    s = run(s, { type: 'skip', now: 1000 })
    expect(s).toMatchObject({ status: 'running', phaseIndex: 0 })
    s = run(s, { type: 'skip', now: 2000 })
    expect(s).toMatchObject({ status: 'running', phaseIndex: 1, remainingMs: 30_000 })
    s = run(s, { type: 'skip', now: 3000 })
    expect(s.status).toBe('done')
  })

  it('reiniciar vuelve al inicio', () => {
    let s = run(initialTimerState(phases), { type: 'start', now: 0 })
    s = run(s, { type: 'tick', now: prepMs + 40_000 })
    s = run(s, { type: 'reset' })
    expect(s).toEqual(initialTimerState(phases))
  })
})
