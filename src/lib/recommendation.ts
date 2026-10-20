import { getRoutine } from '../data/routines'
import type {
  AppData,
  ISODate,
  PlanSlot,
  RoutineId,
  StrengthRoutineId,
  WeekdayKey,
  WorkoutSession,
} from '../types'
import { addDays, isInSameWeek, toISODate, weekDates, weekdayKey } from './dates'

const STRENGTH_ROTATION: StrengthRoutineId[] = ['a', 'b', 'c']

export type TodayRecommendation =
  /**
   * `planned` es false cuando la rutina del día ya se hizo esta semana y se sugiere otra.
   * `preferShort` es true si la persona prefiere sesiones de 10 minutos.
   */
  | { kind: 'strength'; routineId: StrengthRoutineId; planned: boolean; preferShort: boolean }
  | { kind: 'done-today'; routineId: RoutineId }
  | { kind: 'rest-marked' }
  | { kind: 'weekly-goal-met' }
  | { kind: 'light-day' }
  | { kind: 'rest-day' }

export interface DayStatus {
  date: ISODate
  weekday: WeekdayKey
  slot: PlanSlot
  isToday: boolean
  strengthDone: boolean
  mobilityDone: boolean
  restMarked: boolean
}

export interface DashboardSummary {
  today: TodayRecommendation
  strengthDoneThisWeek: number
  weeklyGoal: number
  mobilityDoneToday: boolean
  nextSession: { date: ISODate; routineId: StrengthRoutineId } | null
  week: DayStatus[]
}

/** La rutina corta también es entrenamiento de fuerza y cuenta para la meta semanal. */
function isStrengthSession(session: WorkoutSession): boolean {
  const kind = getRoutine(session.routineId).kind
  return kind === 'strength' || kind === 'short'
}

function isMobilitySession(session: WorkoutSession): boolean {
  return getRoutine(session.routineId).kind === 'mobility'
}

/**
 * Decide qué mostrar en Inicio. Es una función pura: misma entrada, misma salida,
 * para poder probarla sin navegador.
 *
 * Reglas:
 * - Solo cuentan sesiones con status 'completed' (abrir una rutina no cuenta).
 * - Saltarse un día no genera pendientes: cada día se sugiere lo que toca ese día.
 * - Si la rutina del día ya se hizo antes en la semana, se sugiere la siguiente de A→B→C que falte.
 */
export function buildDashboard(data: AppData, now: Date): DashboardSummary {
  const today = toISODate(now)
  const { plan, weeklyStrengthGoal } = data.preferences
  const completed = data.sessions.filter((session) => session.status === 'completed')
  const thisWeek = completed.filter((session) => isInSameWeek(session.date, now))
  const restDays = new Set(data.restDays)

  const strengthThisWeek = thisWeek.filter(isStrengthSession)
  const routinesDoneThisWeek = new Set(strengthThisWeek.map((session) => session.routineId))
  const strengthToday = completed.filter((s) => s.date === today && isStrengthSession(s))
  const mobilityDoneToday = completed.some((s) => s.date === today && isMobilitySession(s))

  const todaySlot = plan[weekdayKey(now)]
  let recommendation: TodayRecommendation

  if (strengthToday.length > 0) {
    recommendation = { kind: 'done-today', routineId: strengthToday[strengthToday.length - 1].routineId }
  } else if (restDays.has(today)) {
    recommendation = { kind: 'rest-marked' }
  } else if (todaySlot.type === 'strength') {
    if (strengthThisWeek.length >= weeklyStrengthGoal) {
      recommendation = { kind: 'weekly-goal-met' }
    } else {
      const candidates = [
        todaySlot.routineId,
        ...STRENGTH_ROTATION.filter((id) => id !== todaySlot.routineId),
      ]
      const routineId = candidates.find((id) => !routinesDoneThisWeek.has(id)) ?? todaySlot.routineId
      recommendation = {
        kind: 'strength',
        routineId,
        planned: routineId === todaySlot.routineId,
        preferShort: data.preferences.preferredSession === 'short',
      }
    }
  } else if (todaySlot.type === 'mobility-optional') {
    recommendation = { kind: 'light-day' }
  } else {
    recommendation = { kind: 'rest-day' }
  }

  let nextSession: DashboardSummary['nextSession'] = null
  for (let offset = 1; offset <= 7; offset++) {
    const day = addDays(now, offset)
    const slot = plan[weekdayKey(day)]
    if (slot.type === 'strength') {
      nextSession = { date: toISODate(day), routineId: slot.routineId }
      break
    }
  }

  const week = weekDates(now).map((day): DayStatus => {
    const date = toISODate(day)
    const sessionsThatDay = completed.filter((session) => session.date === date)
    return {
      date,
      weekday: weekdayKey(day),
      slot: plan[weekdayKey(day)],
      isToday: date === today,
      strengthDone: sessionsThatDay.some(isStrengthSession),
      mobilityDone: sessionsThatDay.some(isMobilitySession),
      restMarked: restDays.has(date),
    }
  })

  return {
    today: recommendation,
    strengthDoneThisWeek: strengthThisWeek.length,
    weeklyGoal: weeklyStrengthGoal,
    mobilityDoneToday,
    nextSession,
    week,
  }
}
