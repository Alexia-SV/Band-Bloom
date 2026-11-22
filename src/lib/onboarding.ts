import { STRENGTH_ROTATION } from '../data/routines'
import type { StrengthRoutineId, WeekdayKey, WeeklyPlan } from '../types'
import { WEEK_ORDER } from './dates'

export const MAX_TRAINING_DAYS = 6
const BASIC_ROTATION: StrengthRoutineId[] = ['a', 'b', 'c']

/**
 * Convierte los días elegidos en un plan semanal:
 * los días de fuerza reciben A → B → C en orden (y vuelve a empezar si hay más de tres);
 * los demás días quedan como movilidad opcional, y el domingo como descanso.
 */
export function planFromTrainingDays(days: WeekdayKey[]): WeeklyPlan {
  const plan = {} as WeeklyPlan
  // Hasta 3 días: A → B → C. Con más días se suman cardio, core y glúteos para no repetir grupo.
  const rotation = days.length > 3 ? STRENGTH_ROTATION : BASIC_ROTATION
  let next = 0
  for (const day of WEEK_ORDER) {
    if (days.includes(day)) {
      plan[day] = { type: 'strength', routineId: rotation[next % rotation.length] }
      next++
    } else {
      plan[day] = day === 'sun' ? { type: 'rest' } : { type: 'mobility-optional' }
    }
  }
  return plan
}

/** ¿Hay dos días de fuerza seguidos? (incluye domingo → lunes) */
export function hasBackToBackDays(days: WeekdayKey[]): boolean {
  return WEEK_ORDER.some((day, index) => days.includes(day) && days.includes(WEEK_ORDER[(index + 1) % 7]))
}
