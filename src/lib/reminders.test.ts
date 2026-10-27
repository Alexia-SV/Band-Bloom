import { describe, expect, it } from 'vitest'
import type { AppData } from '../types'
import { hasBackToBackDays, planFromTrainingDays } from './onboarding'
import { buildReminderIcs, describeDays, formatTime, shouldShowReminder } from './reminders'
import { createDefaultAppData, sanitizeAppData } from './storage'

// Lunes 19 de octubre de 2026
const at = (hours: number, minutes = 0) => new Date(2026, 9, 19, hours, minutes)

function withData(patch: (data: AppData) => void): AppData {
  const data = createDefaultAppData()
  patch(data)
  return data
}

describe('shouldShowReminder', () => {
  it('no aparece antes de la hora y sí después', () => {
    const data = createDefaultAppData()
    expect(shouldShowReminder(data, at(20, 59))).toBe(false)
    expect(shouldShowReminder(data, at(21, 0))).toBe(true)
    expect(shouldShowReminder(data, at(23, 30))).toBe(true)
  })

  it('el día cambia a las 4 a. m.: a las 12:30 a. m. sigue siendo el lunes', () => {
    const madrugada = new Date(2026, 9, 20, 0, 30) // martes 20, 12:30 a. m.
    expect(shouldShowReminder(createDefaultAppData(), madrugada)).toBe(true)
    // Lo que se marcó el lunes cuenta para esa madrugada…
    expect(shouldShowReminder(withData((d) => (d.restDays = ['2026-10-19'])), madrugada)).toBe(false)
    expect(shouldShowReminder(withData((d) => (d.reminders.lastDismissedOn = '2026-10-19')), madrugada)).toBe(false)
    // …y los días elegidos se revisan con el lunes, no con el martes.
    expect(shouldShowReminder(withData((d) => (d.reminders.days = ['tue'])), madrugada)).toBe(false)
    // A las 4 a. m. ya es martes y todavía no llega la hora.
    expect(shouldShowReminder(createDefaultAppData(), new Date(2026, 9, 20, 4, 0))).toBe(false)
  })

  it('respeta desactivar, días elegidos y "Ahora no"', () => {
    expect(shouldShowReminder(withData((d) => (d.reminders.enabled = false)), at(22))).toBe(false)
    expect(shouldShowReminder(withData((d) => (d.reminders.days = ['wed', 'fri'])), at(22))).toBe(false)
    expect(shouldShowReminder(withData((d) => (d.reminders.lastDismissedOn = '2026-10-19')), at(22))).toBe(false)
    expect(shouldShowReminder(withData((d) => (d.reminders.lastDismissedOn = '2026-10-18')), at(22))).toBe(true)
  })

  it('no aparece si hoy ya hubo actividad o se marcó descanso', () => {
    expect(shouldShowReminder(withData((d) => (d.restDays = ['2026-10-19'])), at(22))).toBe(false)
    const session = {
      id: 's',
      routineId: 'mobility' as const,
      date: '2026-10-19',
      startedAt: '',
      endedAt: '',
      completedSets: [],
    }
    expect(shouldShowReminder(withData((d) => (d.sessions = [{ ...session, status: 'completed' }])), at(22))).toBe(false)
    // Una sesión terminada antes de tiempo no cuenta como actividad completada.
    expect(shouldShowReminder(withData((d) => (d.sessions = [{ ...session, status: 'ended-early' }])), at(22))).toBe(true)
  })
})

describe('textos', () => {
  it('formatea la hora y los días', () => {
    expect(formatTime('21:00')).toMatch(/^9:00 p\.\s?m\.$/)
    expect(describeDays(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).toBe('Todos los días')
    expect(describeDays(['fri', 'mon', 'wed'])).toBe('Lun, mié y vie')
    expect(describeDays(['sun'])).toBe('Dom')
  })
})

describe('buildReminderIcs', () => {
  const url = 'https://alexia-sv.github.io/Band-Bloom/'

  it('crea un evento diario con alarma a la hora elegida', () => {
    const ics = buildReminderIcs(createDefaultAppData().reminders, at(10), url)
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics).toContain('DTSTART:20261019T210000\r\n')
    expect(ics).toContain('RRULE:FREQ=DAILY\r\n')
    expect(ics).toContain('BEGIN:VALARM')
    expect(ics).toContain('TRIGGER:PT0M')
    // Las comas del mensaje se escapan
    expect(ics.replace(/\r\n /g, '')).toContain('¿Movilidad\\, rutina corta o descanso?')
  })

  it('con días específicos, empieza en el primer día elegido', () => {
    const settings = { ...createDefaultAppData().reminders, days: ['wed', 'fri'] as const, time: '07:30' }
    const ics = buildReminderIcs({ ...settings, days: [...settings.days] }, at(10), url)
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=WE,FR\r\n')
    expect(ics).toContain('DTSTART:20261021T073000\r\n')
  })

  it('ninguna línea pasa de 75 bytes', () => {
    const settings = { ...createDefaultAppData().reminders, messageId: 'custom' as const, customMessage: '💜'.repeat(60) }
    const ics = buildReminderIcs(settings, at(10), url)
    const encoder = new TextEncoder()
    for (const line of ics.split('\r\n')) expect(encoder.encode(line).length).toBeLessThanOrEqual(75)
  })
})

describe('onboarding', () => {
  it('asigna A, B y C a los días elegidos en orden', () => {
    const plan = planFromTrainingDays(['mon', 'wed', 'fri'])
    expect(plan.mon).toEqual({ type: 'strength', routineId: 'a' })
    expect(plan.wed).toEqual({ type: 'strength', routineId: 'b' })
    expect(plan.fri).toEqual({ type: 'strength', routineId: 'c' })
    expect(plan.tue).toEqual({ type: 'mobility-optional' })
    expect(plan.sun).toEqual({ type: 'rest' })
  })

  it('con dos días usa A y B; con cuatro repite A', () => {
    expect(planFromTrainingDays(['tue', 'thu']).thu).toEqual({ type: 'strength', routineId: 'b' })
    expect(planFromTrainingDays(['mon', 'tue', 'thu', 'sat']).sat).toEqual({ type: 'strength', routineId: 'a' })
  })

  it('detecta días seguidos', () => {
    expect(hasBackToBackDays(['mon', 'wed', 'fri'])).toBe(false)
    expect(hasBackToBackDays(['mon', 'tue'])).toBe(true)
    expect(hasBackToBackDays(['sun', 'mon'])).toBe(true)
  })
})

describe('datos guardados de versiones anteriores', () => {
  it('sin campo de onboarding: se pide solo si no hay historial', () => {
    const base = { version: 1, preferences: { name: '' }, restDays: [], notes: [] }
    expect(sanitizeAppData({ ...base, sessions: [] })?.preferences.onboardingCompleted).toBe(false)
    const session = {
      id: 'x',
      routineId: 'a',
      date: '2026-10-19',
      startedAt: 'a',
      endedAt: 'b',
      status: 'completed',
      completedSets: [],
    }
    expect(sanitizeAppData({ ...base, sessions: [session] })?.preferences.onboardingCompleted).toBe(true)
  })

  it('recordatorios inválidos vuelven a los valores por defecto', () => {
    const result = sanitizeAppData({
      version: 1,
      reminders: { enabled: 'sí', time: '25:99', messageId: 'otro', days: ['mon', 'funday'] },
    })
    expect(result?.reminders).toMatchObject({ enabled: true, time: '21:00', messageId: 'care', days: ['mon'] })
  })
})
