import { describe, expect, it } from 'vitest'
import type { AppData, RoutineId, WorkoutSession } from '../types'
import {
  activityByDate,
  monthGrid,
  periodStats,
  primaryActivity,
  sessionHistory,
  sessionMinutes,
  weeklyStrengthCounts,
} from './progress'
import { createDefaultAppData } from './storage'

function session(
  routineId: RoutineId,
  date: string,
  minutes = 20,
  status: WorkoutSession['status'] = 'completed',
  startTime = '18:00',
): WorkoutSession {
  const start = new Date(`${date}T${startTime}:00`)
  return {
    id: `${routineId}-${date}-${status}`,
    routineId,
    date,
    startedAt: start.toISOString(),
    endedAt: new Date(start.getTime() + minutes * 60_000).toISOString(),
    status,
    completedSets: [],
  }
}

function withData(patch: Partial<AppData>): AppData {
  return { ...createDefaultAppData(), ...patch }
}

describe('progress', () => {
  const data = withData({
    sessions: [
      session('a', '2026-10-19', 18),
      session('mobility', '2026-10-19', 7, 'completed', '19:30'),
      session('short', '2026-10-14', 11),
      session('b', '2026-10-21', 5, 'ended-early'),
      session('c', '2026-09-30', 24),
    ],
    restDays: ['2026-10-20', '2026-10-25'],
  })

  it('calcula los minutos reales y rechaza horas inválidas', () => {
    expect(sessionMinutes(session('a', '2026-10-19', 18))).toBe(18)
    expect(sessionMinutes({ ...session('a', '2026-10-19'), endedAt: 'nope' })).toBeNull()
  })

  it('las estadísticas solo cuentan sesiones completadas del periodo', () => {
    expect(periodStats(data, '2026-10-01', '2026-10-31')).toEqual({
      strength: 1,
      short: 1,
      mobility: 1,
      restDays: 2,
      minutes: 36,
    })
    expect(periodStats(data).strength).toBe(2)
  })

  it('agrupa actividades por día y elige la principal', () => {
    const byDate = activityByDate(data)
    expect(byDate.get('2026-10-19')).toEqual(['strength', 'mobility'])
    expect(byDate.get('2026-10-21')).toBeUndefined() // terminada antes: no cuenta
    expect(primaryActivity(byDate.get('2026-10-19') ?? [])).toBe('strength')
    expect(primaryActivity(['rest'])).toBe('rest')
    expect(primaryActivity([])).toBeNull()
  })

  it('cuenta sesiones de fuerza por semana, de la más antigua a la actual', () => {
    const weeks = weeklyStrengthCounts(data, new Date(2026, 9, 21), 4)
    expect(weeks).toEqual([
      { weekStart: '2026-09-28', count: 1 },
      { weekStart: '2026-10-05', count: 0 },
      { weekStart: '2026-10-12', count: 1 },
      { weekStart: '2026-10-19', count: 1 },
    ])
  })

  it('arma el mes empezando en lunes', () => {
    const grid = monthGrid(2026, 9) // octubre 2026 empieza en jueves
    expect(grid[0].slice(0, 3)).toEqual([null, null, null])
    expect(grid[0][3]?.getDate()).toBe(1)
    expect(grid.flat().filter(Boolean)).toHaveLength(31)
    expect(grid.every((row) => row.length === 7)).toBe(true)
  })

  it('el historial va del más reciente al más antiguo e incluye las terminadas antes', () => {
    expect(sessionHistory(data, '2026-10-19', '2026-10-25').map((s) => s.routineId)).toEqual(['b', 'mobility', 'a'])
  })
})
