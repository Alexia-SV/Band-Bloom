import type { WeeklyPlan } from '../types'

/** Plan inicial: tres días de fuerza con descanso entre cada uno. */
export const DEFAULT_WEEKLY_PLAN: WeeklyPlan = {
  mon: { type: 'strength', routineId: 'a' },
  tue: { type: 'mobility-optional' },
  wed: { type: 'strength', routineId: 'b' },
  thu: { type: 'mobility-optional' },
  fri: { type: 'strength', routineId: 'c' },
  sat: { type: 'mobility-optional' },
  sun: { type: 'rest' },
}

export const DEFAULT_WEEKLY_STRENGTH_GOAL = 3

/**
 * Plan para entrenar diario sin repetir el mismo grupo dos días seguidos:
 * piernas → tren superior → cardio → cuerpo completo → core → glúteos → movilidad.
 */
export const DAILY_WEEKLY_PLAN: WeeklyPlan = {
  mon: { type: 'strength', routineId: 'a' },
  tue: { type: 'strength', routineId: 'b' },
  wed: { type: 'strength', routineId: 'd' },
  thu: { type: 'strength', routineId: 'c' },
  fri: { type: 'strength', routineId: 'f' },
  sat: { type: 'strength', routineId: 'e' },
  sun: { type: 'mobility-optional' },
}

export const DAILY_WEEKLY_GOAL = 6
