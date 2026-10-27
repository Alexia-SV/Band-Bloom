import type { ISODate, WeekdayKey } from '../types'

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** Índice = Date.getDay() (0 = domingo). */
const WEEKDAY_BY_INDEX: WeekdayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

/** Orden de la semana en México: lunes a domingo. */
export const WEEK_ORDER: WeekdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export const WEEKDAY_INITIAL: Record<WeekdayKey, string> = {
  mon: 'L',
  tue: 'M',
  wed: 'X',
  thu: 'J',
  fri: 'V',
  sat: 'S',
  sun: 'D',
}

export const WEEKDAY_NAME: Record<WeekdayKey, string> = {
  mon: 'lunes',
  tue: 'martes',
  wed: 'miércoles',
  thu: 'jueves',
  fri: 'viernes',
  sat: 'sábado',
  sun: 'domingo',
}

/**
 * El día cambia a las 4 a. m., igual que en Mi Semana: lo que haces a las 12:30 a. m.
 * (entrenar, marcar descanso) todavía cuenta para el día anterior.
 */
export const DAY_START_HOUR = 4

/** Fecha y hora "del día" para `now`: entre medianoche y las 4 a. m. todavía es el día anterior. */
export function dayOf(now: Date): Date {
  return new Date(now.getTime() - DAY_START_HOUR * 3_600_000)
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Convierte a 'YYYY-MM-DD' usando la fecha local (no UTC). */
export function toISODate(date: Date): ISODate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function isISODate(value: unknown): value is ISODate {
  if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) return false
  return toISODate(parseISODate(value)) === value
}

/** Crea un Date local a medianoche a partir de 'YYYY-MM-DD'. */
export function parseISODate(value: ISODate): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function weekdayKey(date: Date): WeekdayKey {
  return WEEKDAY_BY_INDEX[date.getDay()]
}

/** Lunes de la semana a la que pertenece la fecha. */
export function startOfWeek(date: Date): Date {
  const daysSinceMonday = (date.getDay() + 6) % 7
  return addDays(date, -daysSinceMonday)
}

export function weekDates(date: Date): Date[] {
  const monday = startOfWeek(date)
  return WEEK_ORDER.map((_, index) => addDays(monday, index))
}

export function isInSameWeek(value: ISODate, reference: Date): boolean {
  const monday = toISODate(startOfWeek(reference))
  const sunday = toISODate(addDays(startOfWeek(reference), 6))
  return value >= monday && value <= sunday
}

/** "Lunes, 19 de octubre" */
export function formatLongDate(date: Date): string {
  const text = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
