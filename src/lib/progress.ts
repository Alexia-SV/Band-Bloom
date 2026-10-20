import { getRoutine } from '../data/routines'
import type { AppData, ISODate, WorkoutSession } from '../types'
import { addDays, startOfWeek, toISODate } from './dates'

/** Tipo de actividad que se muestra en el calendario de progreso. */
export type ActivityKind = 'strength' | 'short' | 'mobility' | 'rest'

export interface DayActivity {
  date: ISODate
  kinds: ActivityKind[]
}

export function completedSessions(data: AppData): WorkoutSession[] {
  return data.sessions.filter((session) => session.status === 'completed')
}

export function sessionKind(session: WorkoutSession): Exclude<ActivityKind, 'rest'> {
  return getRoutine(session.routineId).kind
}

/** Minutos reales de la sesión, o null si las horas guardadas no son válidas. */
export function sessionMinutes(session: WorkoutSession): number | null {
  const ms = Date.parse(session.endedAt) - Date.parse(session.startedAt)
  if (!Number.isFinite(ms) || ms <= 0) return null
  return Math.max(1, Math.round(ms / 60_000))
}

/** Actividades registradas por día (sesiones completadas + días marcados como descanso). */
export function activityByDate(data: AppData): Map<ISODate, ActivityKind[]> {
  const map = new Map<ISODate, ActivityKind[]>()
  const add = (date: ISODate, kind: ActivityKind) => {
    const kinds = map.get(date) ?? []
    if (!kinds.includes(kind)) kinds.push(kind)
    map.set(date, kinds)
  }
  for (const session of completedSessions(data)) add(session.date, sessionKind(session))
  for (const date of data.restDays) add(date, 'rest')
  return map
}

/** El ícono principal de un día: la actividad más "fuerte" registrada. */
export function primaryActivity(kinds: ActivityKind[]): ActivityKind | null {
  for (const kind of ['strength', 'short', 'mobility', 'rest'] as const) {
    if (kinds.includes(kind)) return kind
  }
  return null
}

export interface PeriodStats {
  strength: number
  short: number
  mobility: number
  restDays: number
  minutes: number
}

/** Cuenta lo realmente registrado entre `from` y `to` (inclusive). Sin límites = todo el historial. */
export function periodStats(data: AppData, from?: ISODate, to?: ISODate): PeriodStats {
  const inRange = (date: ISODate) => (!from || date >= from) && (!to || date <= to)
  const stats: PeriodStats = { strength: 0, short: 0, mobility: 0, restDays: 0, minutes: 0 }
  for (const session of completedSessions(data)) {
    if (!inRange(session.date)) continue
    stats[sessionKind(session)] += 1
    stats.minutes += sessionMinutes(session) ?? 0
  }
  stats.restDays = data.restDays.filter(inRange).length
  return stats
}

/** Sesiones de fuerza (incluye la rutina corta) de las últimas `weeks` semanas, de la más antigua a la actual. */
export function weeklyStrengthCounts(data: AppData, now: Date, weeks = 8): Array<{ weekStart: ISODate; count: number }> {
  const currentMonday = startOfWeek(now)
  const result: Array<{ weekStart: ISODate; count: number }> = []
  for (let i = weeks - 1; i >= 0; i--) {
    const monday = addDays(currentMonday, -7 * i)
    const from = toISODate(monday)
    const to = toISODate(addDays(monday, 6))
    const stats = periodStats(data, from, to)
    result.push({ weekStart: from, count: stats.strength + stats.short })
  }
  return result
}

/**
 * Cuadrícula del mes empezando en lunes. Las casillas fuera del mes son null.
 * `month` va de 0 (enero) a 11 (diciembre), como en Date.
 */
export function monthGrid(year: number, month: number): Array<Array<Date | null>> {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = (first.getDay() + 6) % 7
  const cells: Array<Date | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const rows: Array<Array<Date | null>> = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}

/** Sesiones (completadas o terminadas antes) del periodo, de la más reciente a la más antigua. */
export function sessionHistory(data: AppData, from?: ISODate, to?: ISODate): WorkoutSession[] {
  return data.sessions
    .filter((session) => (!from || session.date >= from) && (!to || session.date <= to))
    .sort((a, b) => (a.date === b.date ? b.startedAt.localeCompare(a.startedAt) : b.date.localeCompare(a.date)))
}
