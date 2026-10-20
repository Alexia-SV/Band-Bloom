import { describe, expect, it } from 'vitest'
import { EXERCISES, getExercise } from './exercises'
import { ILLUSTRATIONS } from './illustrations'
import { ROUTINES } from './routines'
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
    for (const id of ['a', 'b', 'c', 'short'] as const) expect(WARMUPS[id]?.items.length).toBeGreaterThan(0)
  })
})
