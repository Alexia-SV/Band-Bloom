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
