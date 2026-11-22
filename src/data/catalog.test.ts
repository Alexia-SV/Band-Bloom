import { describe, expect, it } from 'vitest'
import { EXERCISES, getExercise } from './exercises'
import { ILLUSTRATIONS } from './illustrations'
import { getRoutine, ROUTINES, STRENGTH_ROTATION } from './routines'
import { DAILY_WEEKLY_PLAN } from './weeklyPlan'
import { WEEK_ORDER } from '../lib/dates'
import { WARMUPS } from './warmups'

describe('catálogo de ejercicios', () => {
  it('cada ejercicio de rutinas y calentamientos existe y tiene ilustración', () => {
    const used = [
      ...ROUTINES.flatMap((routine) => routine.items),
      ...Object.values(WARMUPS).flatMap((warmUp) => warmUp?.items ?? []),
    ].map((item) => item.exerciseId)
    for (const id of used) {
      expect(getExercise(id), `falta el ejercicio ${id}`).toBeDefined()
      expect(ILLUSTRATIONS[id], `falta la ilustración de ${id}`).toBeDefined()
    }
  })

  it('cada ejercicio tiene instrucciones completas', () => {
    for (const exercise of EXERCISES) {
      expect(exercise.description.length, exercise.id).toBeGreaterThan(20)
      expect(exercise.steps.length, exercise.id).toBeGreaterThanOrEqual(3)
      expect(exercise.safety.length, exercise.id).toBeGreaterThanOrEqual(1)
      expect(exercise.mistakes.length, exercise.id).toBeGreaterThanOrEqual(1)
      expect(exercise.easier, exercise.id).not.toBe('')
      expect(exercise.progression, exercise.id).not.toBe('')
    }
  })

  it('los IDs son únicos', () => {
    const ids = EXERCISES.map((exercise) => exercise.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('la movilidad diaria no lleva calentamiento; las demás rutinas sí', () => {
    expect(WARMUPS.mobility).toBeUndefined()
    for (const id of [...STRENGTH_ROTATION, 'short'] as const) expect(WARMUPS[id]?.items.length).toBeGreaterThan(0)
  })

  it('una rutina no repite ejercicio (la lista usa el ID como llave)', () => {
    for (const routine of ROUTINES) {
      const ids = routine.items.map((item) => item.exerciseId)
      expect(new Set(ids).size, routine.id).toBe(ids.length)
    }
  })

  it('el plan diario no repite grupo muscular dos días seguidos', () => {
    const focus = WEEK_ORDER.map((day) => {
      const slot = DAILY_WEEKLY_PLAN[day]
      return slot.type === 'strength' ? getRoutine(slot.routineId).focus : slot.type
    })
    focus.forEach((f, i) => expect(f, WEEK_ORDER[i]).not.toBe(focus[(i + 1) % 7]))
    expect(focus.filter((f) => f === 'full' || f === 'legs' || f === 'upper' || f === 'core' || f === 'cardio')).toHaveLength(6)
  })
})
