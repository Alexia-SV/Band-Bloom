import { describe, expect, it } from 'vitest'
import type { AppData, RoutineId, WorkoutSession } from '../types'
import { buildDashboard } from './recommendation'
import { createDefaultAppData, sanitizeAppData } from './storage'
import { mergeCloud } from './sync'
import { DAILY_WEEKLY_PLAN, DEFAULT_WEEKLY_PLAN } from '../data/weeklyPlan'

// Semana de referencia: lunes 19 a domingo 25 de octubre de 2026.
const MONDAY = new Date(2026, 9, 19)
const TUESDAY = new Date(2026, 9, 20)
const WEDNESDAY = new Date(2026, 9, 21)
const SUNDAY = new Date(2026, 9, 25)

function session(routineId: RoutineId, date: string, status: WorkoutSession['status'] = 'completed'): WorkoutSession {
  return {
    id: `${routineId}-${date}`,
    routineId,
    date,
    startedAt: `${date}T10:00:00.000Z`,
    endedAt: `${date}T10:20:00.000Z`,
    status,
    completedSets: [],
  }
}

function withData(patch: Partial<AppData>): AppData {
  return { ...createDefaultAppData(), ...patch }
}

describe('buildDashboard', () => {
  it('sin historial, el lunes recomienda la rutina A', () => {
    const summary = buildDashboard(createDefaultAppData(), MONDAY)
    expect(summary.today).toEqual({ kind: 'strength', routineId: 'a', planned: true, preferShort: false })
    expect(summary.strengthDoneThisWeek).toBe(0)
    expect(summary.weeklyGoal).toBe(3)
  })

  it('con preferencia de sesiones cortas lo indica sin cambiar la rotación', () => {
    const data = createDefaultAppData()
    data.preferences.preferredSession = 'short'
    expect(buildDashboard(data, MONDAY).today).toEqual({ kind: 'strength', routineId: 'a', planned: true, preferShort: true })
  })

  it('una sesión terminada antes de tiempo no cuenta como completada', () => {
    const data = withData({ sessions: [session('a', '2026-10-19', 'ended-early')] })
    const summary = buildDashboard(data, MONDAY)
    expect(summary.today.kind).toBe('strength')
    expect(summary.strengthDoneThisWeek).toBe(0)
  })

  it('después de completar la rutina del día muestra "listo por hoy"', () => {
    const data = withData({ sessions: [session('a', '2026-10-19')] })
    const summary = buildDashboard(data, MONDAY)
    expect(summary.today).toEqual({ kind: 'done-today', routineId: 'a' })
    expect(summary.strengthDoneThisWeek).toBe(1)
  })

  it('saltarse el lunes no crea pendientes: el miércoles sugiere B', () => {
    const summary = buildDashboard(createDefaultAppData(), WEDNESDAY)
    expect(summary.today).toEqual({ kind: 'strength', routineId: 'b', planned: true, preferShort: false })
  })

  it('si B ya se hizo el martes, el miércoles sugiere la que falta', () => {
    const data = withData({ sessions: [session('b', '2026-10-20')] })
    const summary = buildDashboard(data, WEDNESDAY)
    expect(summary.today).toEqual({ kind: 'strength', routineId: 'a', planned: false, preferShort: false })
  })

  it('marcar descanso cambia la recomendación del día', () => {
    const data = withData({ restDays: ['2026-10-19'] })
    expect(buildDashboard(data, MONDAY).today).toEqual({ kind: 'rest-marked' })
  })

  it('días sin fuerza: martes ligero y domingo descanso', () => {
    expect(buildDashboard(createDefaultAppData(), TUESDAY).today).toEqual({ kind: 'light-day' })
    expect(buildDashboard(createDefaultAppData(), SUNDAY).today).toEqual({ kind: 'rest-day' })
  })

  it('la rutina corta cuenta para la meta semanal', () => {
    const data = withData({
      sessions: [session('short', '2026-10-19'), session('b', '2026-10-20'), session('c', '2026-10-20')],
    })
    expect(buildDashboard(data, WEDNESDAY).today).toEqual({ kind: 'weekly-goal-met' })
  })

  it('las sesiones de la semana pasada no cuentan', () => {
    const data = withData({ sessions: [session('a', '2026-10-12'), session('b', '2026-10-14')] })
    expect(buildDashboard(data, MONDAY).strengthDoneThisWeek).toBe(0)
  })

  it('la próxima sesión es el siguiente día de fuerza del plan', () => {
    expect(buildDashboard(createDefaultAppData(), MONDAY).nextSession).toEqual({ date: '2026-10-21', routineId: 'b' })
    expect(buildDashboard(createDefaultAppData(), SUNDAY).nextSession).toEqual({ date: '2026-10-26', routineId: 'a' })
  })

  it('la tira semanal va de lunes a domingo y marca hoy', () => {
    const { week } = buildDashboard(createDefaultAppData(), WEDNESDAY)
    expect(week.map((day) => day.date)).toEqual([
      '2026-10-19',
      '2026-10-20',
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
    ])
    expect(week.filter((day) => day.isToday).map((day) => day.date)).toEqual(['2026-10-21'])
  })
})

describe('sanitizeAppData', () => {
  it('rechaza datos que no son de la versión esperada', () => {
    expect(sanitizeAppData(null)).toBeNull()
    expect(sanitizeAppData({ version: 99 })).toBeNull()
  })

  it('descarta sesiones y fechas inválidas sin perder las válidas', () => {
    const result = sanitizeAppData({
      version: 1,
      preferences: { name: 'Alexia', weeklyStrengthGoal: 'mucho' },
      sessions: [session('a', '2026-10-19'), { id: 'x', routineId: 'zzz' }, session('b', '2026-02-31')],
      restDays: ['2026-10-20', 'ayer', '2026-10-20'],
    })
    expect(result?.sessions.map((s) => s.id)).toEqual(['a-2026-10-19'])
    expect(result?.restDays).toEqual(['2026-10-20'])
    expect(result?.preferences.name).toBe('Alexia')
    expect(result?.preferences.weeklyStrengthGoal).toBe(3)
    expect(result?.preferences.plan.mon).toEqual({ type: 'strength', routineId: 'a' })
  })

  describe('paso al plan diario', () => {
    const oldPlan = () => {
      const preferences: Record<string, unknown> = { ...createDefaultAppData().preferences }
      delete preferences.planVersion
      return { ...createDefaultAppData(), preferences }
    }

    it('un plan de antes (solo A, B y C) pasa al diario: el martes ya toca tren superior', () => {
      const data = sanitizeAppData(oldPlan())!
      expect(data.preferences.plan).toEqual(DAILY_WEEKLY_PLAN)
      expect(data.preferences.weeklyStrengthGoal).toBe(6)
      const tuesday = buildDashboard({ ...data, sessions: [session('a', '2026-10-19')] }, TUESDAY)
      expect(tuesday.today).toMatchObject({ kind: 'strength', routineId: 'b', planned: true })
    })

    it('pasa una sola vez: si después eliges el de 3 días, se respeta', () => {
      const migrated = sanitizeAppData(oldPlan())!
      const back = { ...migrated, preferences: { ...migrated.preferences, plan: { ...DEFAULT_WEEKLY_PLAN }, weeklyStrengthGoal: 3 } }
      const again = sanitizeAppData(JSON.parse(JSON.stringify(back)))!
      expect(again.preferences.plan).toEqual(DEFAULT_WEEKLY_PLAN)
      expect(again.preferences.weeklyStrengthGoal).toBe(3)
    })

    it('no toca un plan que ya usa las rutinas nuevas', () => {
      const custom = oldPlan()
      custom.preferences.plan = { ...DEFAULT_WEEKLY_PLAN, tue: { type: 'strength', routineId: 'd' } }
      const data = sanitizeAppData(custom)!
      expect(data.preferences.plan.tue).toEqual({ type: 'strength', routineId: 'd' })
      expect(data.preferences.plan.thu).toEqual({ type: 'mobility-optional' })
    })

    it('lo que llega de la nube con el plan viejo también pasa al diario, sin marcarse como cambio local', () => {
      const local = sanitizeAppData(oldPlan())!
      const { merged } = mergeCloud(oldPlan(), [], local, 'cloud')
      expect(sanitizeAppData(merged)?.preferences.plan).toEqual(DAILY_WEEKLY_PLAN)
    })
  })
})
