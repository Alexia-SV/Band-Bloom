import { describe, expect, it } from 'vitest'
import { parseHash, routeHref } from './router'
import { buildSession, buildWorkout, resumableProgress, RESUME_WINDOW_MS, sessionDate } from './workout'

describe('buildWorkout', () => {
  it('rutina A: 6 de calentamiento, 4 ejercicios × 2 series y descanso entre series', () => {
    const steps = buildWorkout('a')
    expect(steps).toHaveLength(6 + 8 + 7)
    // El calentamiento va seguido, sin descansos.
    expect(steps.slice(0, 6).every((s) => s.kind === 'exercise' && s.part === 'warmup')).toBe(true)
    // Primera serie, descanso y la segunda serie del mismo ejercicio.
    expect(steps[6]).toMatchObject({ kind: 'exercise', part: 'main', exerciseId: 'band-squat', set: 1, sets: 2, position: 1, total: 4 })
    expect(steps[7]).toMatchObject({ kind: 'rest', next: { exerciseId: 'band-squat', set: 2, sets: 2 } })
    expect(steps[8]).toMatchObject({ kind: 'exercise', exerciseId: 'band-squat', set: 2 })
    // Después de la última serie, el descanso anuncia el siguiente ejercicio.
    expect(steps[9]).toMatchObject({ kind: 'rest', next: { exerciseId: 'band-glute-bridge', set: 1 } })
    // Termina con una serie, no con un descanso.
    expect(steps[steps.length - 1]).toMatchObject({ kind: 'exercise', set: 2, position: 4 })
  })

  it('usa el descanso de cada ejercicio ("60–90 s" → 60 a 90)', () => {
    const rests = buildWorkout('a').filter((s) => s.kind === 'rest')
    expect(rests.every((s) => s.kind === 'rest' && s.min >= 45 && s.max <= 90 && s.min <= s.max)).toBe(true)
  })

  it('los ejercicios por tiempo traen sus fases y los de repeticiones no', () => {
    const steps = buildWorkout('a')
    const march = steps.find((s) => s.kind === 'exercise' && s.exerciseId === 'march-in-place')
    const squat = steps.find((s) => s.kind === 'exercise' && s.exerciseId === 'band-squat')
    expect(march?.kind === 'exercise' && march.phases).toEqual([{ label: 'Tiempo', seconds: 60 }])
    expect(squat?.kind === 'exercise' && squat.phases).toBeNull()
  })

  it('la movilidad no lleva calentamiento ni descansos', () => {
    const steps = buildWorkout('mobility')
    expect(steps).toHaveLength(7)
    expect(steps.every((s) => s.kind === 'exercise' && s.part === 'main')).toBe(true)
  })
})

describe('ruta del entrenamiento', () => {
  it('#/rutinas/a/entrenar ida y vuelta', () => {
    expect(parseHash('#/rutinas/a/entrenar')).toEqual({ name: 'workout', routineId: 'a' })
    expect(routeHref({ name: 'workout', routineId: 'mobility' })).toBe('#/rutinas/mobility/entrenar')
    // Una rutina que no existe no abre el entrenamiento.
    expect(parseHash('#/rutinas/zzz/entrenar')).toEqual({ name: 'routines' })
  })
})

describe('buildSession / sessionDate', () => {
  it('terminar a las 12:30 a. m. cuenta para el día anterior', () => {
    expect(sessionDate(new Date(2026, 9, 20, 0, 30))).toBe('2026-10-19')
    expect(sessionDate(new Date(2026, 9, 19, 23, 30))).toBe('2026-10-19')
  })

  it('arma la sesión y solo guarda la nota si tiene texto', () => {
    const base = {
      id: 's1',
      routineId: 'a' as const,
      startedAt: '2026-10-19T23:00:00.000Z',
      endedAt: new Date(2026, 9, 19, 23, 25),
      completedSets: [{ exerciseId: 'band-squat', setNumber: 1, completedAt: '2026-10-19T23:05:00.000Z' }],
      status: 'completed' as const,
    }
    expect(buildSession({ ...base, note: '  ' })).not.toHaveProperty('note')
    expect(buildSession({ ...base, note: ' Me sentí fuerte ' })).toMatchObject({ date: '2026-10-19', note: 'Me sentí fuerte' })
  })
})

describe('resumableProgress', () => {
  const now = new Date(2026, 9, 19, 23, 30)
  const progress = { routineId: 'a', step: 5, startedAt: new Date(2026, 9, 19, 23, 0).toISOString(), completedSets: [] }

  it('retoma la misma rutina si es reciente', () => {
    expect(resumableProgress(progress, 'a', now, 21)).toMatchObject({ step: 5 })
  })

  it('no retoma otra rutina, algo viejo o datos dañados', () => {
    expect(resumableProgress(progress, 'b', now, 21)).toBeNull()
    expect(resumableProgress(progress, 'a', new Date(now.getTime() + RESUME_WINDOW_MS), 21)).toBeNull()
    expect(resumableProgress({ ...progress, step: 99 }, 'a', now, 21)).toBeNull()
    expect(resumableProgress('basura', 'a', now, 21)).toBeNull()
  })
})
