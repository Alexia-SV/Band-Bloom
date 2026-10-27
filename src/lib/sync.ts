import type { AppData, WorkoutSession } from '../types'

/** Lo que se guarda en `bb_datos`: todo menos las sesiones, que van en su propia tabla (`bb_sesiones`). */
export type CloudDatos = Omit<AppData, 'sessions'>

export function cloudDatos(data: AppData): CloudDatos {
  const { version, preferences, restDays, notes, reminders } = data
  return { version, preferences, restDays, notes, reminders }
}

/** Fila de `bb_sesiones` (columnas en snake_case, como en la base de datos). */
export interface SessionRow {
  id: string
  routine_id: string
  fecha: string
  started_at: string
  ended_at: string
  status: WorkoutSession['status']
  completed_sets: WorkoutSession['completedSets']
  note: string | null
}

export function sessionToRow(session: WorkoutSession): SessionRow {
  return {
    id: session.id,
    routine_id: session.routineId,
    fecha: session.date,
    started_at: session.startedAt,
    ended_at: session.endedAt,
    status: session.status,
    completed_sets: session.completedSets,
    note: session.note ?? null,
  }
}

/** Fila → sesión. No se valida aquí: `sanitizeAppData` revisa todo después. */
export function rowToSession(row: SessionRow): WorkoutSession {
  return {
    id: row.id,
    routineId: row.routine_id as WorkoutSession['routineId'],
    date: row.fecha,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    status: row.status,
    completedSets: Array.isArray(row.completed_sets) ? row.completed_sets : [],
    ...(row.note ? { note: row.note } : {}),
  }
}

/**
 * Cómo juntar la nube con este dispositivo:
 * - 'cloud': los ajustes de la nube mandan; se suman las sesiones locales que faltan.
 * - 'first-link': primera vez que este dispositivo entra a la cuenta; además se suman sus descansos y notas.
 * - 'local': este dispositivo tiene cambios sin subir; mandan sus ajustes y se suman las sesiones de la nube.
 * - 'cloud-only': solo la nube (después de un "Borrar todo" en otro dispositivo, o si los datos de aquí
 *   son de otra cuenta); nada de este dispositivo se sube.
 */
export type MergeMode = 'cloud' | 'first-link' | 'local' | 'cloud-only'

/**
 * Qué modo usar según la cuenta a la que pertenecen los datos de este dispositivo (`linkedUser`),
 * si hay cambios sin subir y el último "Borrar todo" de la nube frente al que este dispositivo ya vio.
 */
export function chooseMergeMode(input: {
  linkedUser: string | null
  userId: string
  dirty: boolean
  cloudResetAt: string | null
  seenResetAt: string | null
}): MergeMode {
  if (input.linkedUser !== null && input.linkedUser !== input.userId) return 'cloud-only'
  if (input.cloudResetAt && input.cloudResetAt !== input.seenResetAt) return 'cloud-only'
  if (input.linkedUser === null) return 'first-link'
  return input.dirty ? 'local' : 'cloud'
}

/** `missing` son las sesiones locales que la nube no tiene, para subirlas. */
export function mergeCloud(
  datos: unknown,
  cloudSessions: WorkoutSession[],
  local: AppData,
  mode: MergeMode,
): { merged: unknown; missing: WorkoutSession[] } {
  if (mode === 'cloud-only') return { merged: { ...asRecord(datos), sessions: cloudSessions }, missing: [] }

  const ids = new Set(cloudSessions.map((session) => session.id))
  const missing = local.sessions.filter((session) => !ids.has(session.id))
  const sessions = [...cloudSessions, ...missing]
  if (mode === 'local') return { merged: { ...cloudDatos(local), sessions }, missing }

  const base = asRecord(datos)
  if (mode === 'first-link') {
    const cloudRest = Array.isArray(base.restDays) ? base.restDays : []
    const cloudNotes = Array.isArray(base.notes) ? (base.notes as Array<{ id?: unknown }>) : []
    const noteIds = new Set(cloudNotes.map((note) => note?.id))
    base.restDays = [...new Set([...cloudRest, ...local.restDays])]
    base.notes = [...cloudNotes, ...local.notes.filter((note) => !noteIds.has(note.id))]
  }
  return { merged: { ...base, sessions }, missing }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? { ...(value as Record<string, unknown>) } : {}
}
