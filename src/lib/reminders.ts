import { reminderText } from '../data/reminders'
import type { AppData, ReminderSettings, TimeOfDay, WeekdayKey } from '../types'
import { addDays, toISODate, WEEK_ORDER, weekdayKey } from './dates'

/** "21:00" → minutos desde la medianoche. */
function toMinutes(time: TimeOfDay): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** "21:00" → "9:00 p. m." (formato de México). */
export function formatTime(time: TimeOfDay): string {
  const [hours, minutes] = time.split(':').map(Number)
  return new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true })
    .format(new Date(2000, 0, 1, hours, minutes))
    .replace(/\u00a0|\u202f/g, ' ')
}

/** "Todos los días", "Lun, mié y vie"… */
export function describeDays(days: WeekdayKey[]): string {
  if (days.length === 7) return 'Todos los días'
  if (days.length === 0) return 'Ningún día'
  const short: Record<WeekdayKey, string> = {
    mon: 'lun',
    tue: 'mar',
    wed: 'mié',
    thu: 'jue',
    fri: 'vie',
    sat: 'sáb',
    sun: 'dom',
  }
  const names = WEEK_ORDER.filter((day) => days.includes(day)).map((day) => short[day])
  const text = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * ¿Mostrar hoy el aviso dentro de la app?
 * Solo si está activado, hoy es uno de los días elegidos, ya pasó la hora,
 * no se cerró hoy y todavía no hay actividad registrada (ni descanso marcado).
 */
export function shouldShowReminder(data: AppData, now: Date): boolean {
  const { reminders } = data
  const today = toISODate(now)
  if (!reminders.enabled) return false
  if (!reminders.days.includes(weekdayKey(now))) return false
  if (now.getHours() * 60 + now.getMinutes() < toMinutes(reminders.time)) return false
  if (reminders.lastDismissedOn === today) return false
  if (data.restDays.includes(today)) return false
  return !data.sessions.some((session) => session.date === today && session.status === 'completed')
}

const ICS_DAY: Record<WeekdayKey, string> = { mon: 'MO', tue: 'TU', wed: 'WE', thu: 'TH', fri: 'FR', sat: 'SA', sun: 'SU' }

/** Escapa texto según RFC 5545 (barra invertida, punto y coma, coma y saltos de línea). */
function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Corta líneas de más de 75 bytes (UTF-8) como pide RFC 5545, sin partir caracteres. */
function foldIcsLine(line: string): string {
  const encoder = new TextEncoder()
  const parts: string[] = []
  let current = ''
  let bytes = 0
  for (const char of line) {
    const size = encoder.encode(char).length
    const limit = parts.length === 0 ? 75 : 74 // las líneas de continuación empiezan con un espacio
    if (bytes + size > limit) {
      parts.push(current)
      current = ''
      bytes = 0
    }
    current += char
    bytes += size
  }
  parts.push(current)
  return parts.join('\r\n ')
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function icsLocalDateTime(date: Date, time: TimeOfDay): string {
  const [hours, minutes] = time.split(':')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${hours}${minutes}00`
}

function icsUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/**
 * Archivo .ics con un evento recurrente y una alarma a la hora del recordatorio.
 * Así el aviso lo da la app Calendario del teléfono, aunque Band & Bloom esté cerrada.
 * La hora es "flotante" (sin zona horaria): se respeta la hora local del dispositivo.
 */
export function buildReminderIcs(settings: ReminderSettings, now: Date, appUrl: string): string {
  const days = settings.days.length > 0 ? settings.days : WEEK_ORDER
  // El primer evento debe caer en uno de los días elegidos, si no el calendario agrega uno de más.
  let start = now
  for (let offset = 0; offset < 7; offset++) {
    const candidate = addDays(now, offset)
    if (days.includes(weekdayKey(candidate))) {
      start = candidate
      break
    }
  }
  const rule =
    days.length === 7
      ? 'FREQ=DAILY'
      : `FREQ=WEEKLY;BYDAY=${WEEK_ORDER.filter((day) => days.includes(day)).map((day) => ICS_DAY[day]).join(',')}`
  const message = escapeIcsText(reminderText(settings))

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Band & Bloom//Recordatorios//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:band-and-bloom-${icsUtcStamp(now)}@band-and-bloom`,
    `DTSTAMP:${icsUtcStamp(now)}`,
    `DTSTART:${icsLocalDateTime(start, settings.time)}`,
    'DURATION:PT10M',
    `RRULE:${rule}`,
    `SUMMARY:${escapeIcsText('Band & Bloom 💜')}`,
    `DESCRIPTION:${message}\\n${escapeIcsText(appUrl)}`,
    `URL:${appUrl}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${message}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(foldIcsLine).join('\r\n') + '\r\n'
}
