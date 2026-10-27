import { describe, expect, it } from 'vitest'
import type { AppData, WorkoutSession } from '../types'
import { createDefaultAppData, sanitizeAppData } from './storage'
import { cloudDatos, mergeCloud, rowToSession, sessionToRow } from './sync'

function session(id: string, date = '2026-10-19'): WorkoutSession {
  return {
    id,
    routineId: 'a',
    date,
    startedAt: `${date}T23:00:00.000Z`,
    endedAt: `${date}T23:20:00.000Z`,
    status: 'completed',
    completedSets: [{ exerciseId: 'squat', setNumber: 1, completedAt: `${date}T23:05:00.000Z` }],
  }
}

function withData(patch: (data: AppData) => void): AppData {
  const data = createDefaultAppData()
  patch(data)
  return data
}

describe('cloudDatos', () => {
  it('guarda todo menos las sesiones', () => {
    const datos = cloudDatos(withData((d) => (d.sessions = [session('s1')])))
    expect(datos).not.toHaveProperty('sessions')
    expect(datos).toHaveProperty('preferences')
    expect(datos).toHaveProperty('reminders')
  })
})

describe('sessionToRow / rowToSession', () => {
  it('ida y vuelta sin perder nada', () => {
    const original = { ...session('s1'), note: 'Me sentí bien' }
    expect(rowToSession(sessionToRow(original))).toEqual(original)
  })

  it('sin nota no agrega el campo', () => {
    expect(rowToSession(sessionToRow(session('s1')))).not.toHaveProperty('note')
  })
})

describe('mergeCloud', () => {
  const cloud = cloudDatos(
    withData((d) => {
      d.preferences.name = 'Nube'
      d.restDays = ['2026-10-18']
      d.notes = [{ id: 'n-nube', createdAt: '2026-10-18T10:00:00.000Z', text: 'De la nube' }]
    }),
  )
  const local = withData((d) => {
    d.preferences.name = 'Teléfono'
    d.restDays = ['2026-10-19']
    d.notes = [{ id: 'n-local', createdAt: '2026-10-19T10:00:00.000Z', text: 'Del teléfono' }]
    d.sessions = [session('s-nube'), session('s-local', '2026-10-19')]
  })

  it('la nube manda y se suben las sesiones locales que faltan', () => {
    const { merged, missing } = mergeCloud(cloud, [session('s-nube')], local, false)
    const data = sanitizeAppData(merged)
    expect(data?.preferences.name).toBe('Nube')
    expect(data?.restDays).toEqual(['2026-10-18'])
    expect(data?.sessions.map((s) => s.id)).toEqual(['s-nube', 's-local'])
    expect(missing.map((s) => s.id)).toEqual(['s-local'])
  })

  it('la primera vez que el dispositivo entra a la cuenta, suma descansos y notas', () => {
    const data = sanitizeAppData(mergeCloud(cloud, [], local, true).merged)
    expect(data?.preferences.name).toBe('Nube')
    expect(data?.restDays).toEqual(['2026-10-18', '2026-10-19'])
    expect(data?.notes.map((n) => n.id)).toEqual(['n-nube', 'n-local'])
  })
})
