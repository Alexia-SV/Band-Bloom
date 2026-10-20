import { isRoutineId } from '../data/routines'
import { DEFAULT_WEEKLY_PLAN, DEFAULT_WEEKLY_STRENGTH_GOAL } from '../data/weeklyPlan'
import type { AppData, PersonalNote, PlanSlot, RoutineId, UserPreferences, WeeklyPlan, WorkoutSession } from '../types'
import { isISODate, WEEK_ORDER } from './dates'

export const STORAGE_KEY = 'band-and-bloom:data'

export type LoadProblem = 'none' | 'corrupted' | 'unavailable'

export interface LoadResult {
  data: AppData
  problem: LoadProblem
}

export function createDefaultAppData(): AppData {
  return {
    version: 1,
    preferences: {
      name: '',
      weeklyStrengthGoal: DEFAULT_WEEKLY_STRENGTH_GOAL,
      plan: { ...DEFAULT_WEEKLY_PLAN },
      preferredSession: 'full',
      favoriteRoutineIds: [],
    },
    sessions: [],
    restDays: [],
    notes: [],
  }
}

/** localStorage puede lanzar error (modo privado, almacenamiento bloqueado). */
function getStorage(): Storage | null {
  try {
    const storage = window.localStorage
    const probe = `${STORAGE_KEY}:probe`
    storage.setItem(probe, '1')
    storage.removeItem(probe)
    return storage
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sanitizeSlot(value: unknown): PlanSlot | null {
  if (!isRecord(value)) return null
  if (value.type === 'rest' || value.type === 'mobility-optional') return { type: value.type }
  if (value.type === 'strength' && (value.routineId === 'a' || value.routineId === 'b' || value.routineId === 'c')) {
    return { type: 'strength', routineId: value.routineId }
  }
  return null
}

function sanitizePreferences(value: unknown): UserPreferences {
  const defaults = createDefaultAppData().preferences
  if (!isRecord(value)) return defaults

  const plan = { ...defaults.plan } as WeeklyPlan
  if (isRecord(value.plan)) {
    for (const day of WEEK_ORDER) {
      plan[day] = sanitizeSlot(value.plan[day]) ?? defaults.plan[day]
    }
  }

  const goal = value.weeklyStrengthGoal
  const favorites = Array.isArray(value.favoriteRoutineIds)
    ? value.favoriteRoutineIds.filter((id): id is RoutineId => typeof id === 'string' && isRoutineId(id))
    : []
  return {
    name: typeof value.name === 'string' ? value.name.slice(0, 40) : '',
    weeklyStrengthGoal:
      typeof goal === 'number' && Number.isInteger(goal) && goal >= 1 && goal <= 7 ? goal : defaults.weeklyStrengthGoal,
    plan,
    preferredSession: value.preferredSession === 'short' ? 'short' : 'full',
    favoriteRoutineIds: [...new Set(favorites)],
  }
}

function sanitizeSession(value: unknown): WorkoutSession | null {
  if (!isRecord(value)) return null
  const { id, routineId, date, startedAt, endedAt, status, completedSets, note } = value
  if (typeof id !== 'string' || typeof routineId !== 'string' || !isRoutineId(routineId)) return null
  if (!isISODate(date) || typeof startedAt !== 'string' || typeof endedAt !== 'string') return null
  if (status !== 'completed' && status !== 'ended-early') return null

  const sets = Array.isArray(completedSets)
    ? completedSets.filter(
        (set): set is WorkoutSession['completedSets'][number] =>
          isRecord(set) &&
          typeof set.exerciseId === 'string' &&
          typeof set.setNumber === 'number' &&
          typeof set.completedAt === 'string',
      )
    : []

  return {
    id,
    routineId,
    date,
    startedAt,
    endedAt,
    status,
    completedSets: sets,
    ...(typeof note === 'string' && note ? { note } : {}),
  }
}

function sanitizeNote(value: unknown): PersonalNote | null {
  if (!isRecord(value)) return null
  const { id, createdAt, text } = value
  if (typeof id !== 'string' || typeof createdAt !== 'string' || typeof text !== 'string' || !text.trim()) return null
  return { id, createdAt, text }
}

/** Valida datos guardados; descarta lo inválido en vez de romper la app. */
export function sanitizeAppData(value: unknown): AppData | null {
  if (!isRecord(value) || value.version !== 1) return null
  const sessions = Array.isArray(value.sessions)
    ? value.sessions.map(sanitizeSession).filter((s): s is WorkoutSession => s !== null)
    : []
  const restDays = Array.isArray(value.restDays) ? [...new Set(value.restDays.filter(isISODate))] : []
  const notes = Array.isArray(value.notes)
    ? value.notes.map(sanitizeNote).filter((n): n is PersonalNote => n !== null)
    : []
  return { version: 1, preferences: sanitizePreferences(value.preferences), sessions, restDays, notes }
}

export function loadAppData(): LoadResult {
  const storage = getStorage()
  if (!storage) return { data: createDefaultAppData(), problem: 'unavailable' }

  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) return { data: createDefaultAppData(), problem: 'none' }

  try {
    const data = sanitizeAppData(JSON.parse(raw))
    if (data) return { data, problem: 'none' }
  } catch {
    // JSON inválido: se maneja abajo.
  }

  // Guardamos una copia de lo que no se pudo leer para no perderlo.
  try {
    storage.setItem(`${STORAGE_KEY}:backup-${Date.now()}`, raw)
  } catch {
    // Si tampoco se puede respaldar, seguimos con datos nuevos.
  }
  return { data: createDefaultAppData(), problem: 'corrupted' }
}

/** Borra todo lo que la app guardó en este navegador (datos y respaldos). */
export function clearAllAppData(): void {
  try {
    const keys: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key?.startsWith(STORAGE_KEY)) keys.push(key)
    }
    keys.forEach((key) => window.localStorage.removeItem(key))
  } catch {
    // Si el almacenamiento no está disponible, no hay nada que borrar.
  }
}

/** Devuelve false si no se pudo guardar (por ejemplo, almacenamiento lleno o bloqueado). */
export function saveAppData(data: AppData): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}
