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
 * Junta la nube con este dispositivo. Los ajustes de la nube mandan y se conservan las sesiones
 * locales que todavía no se subieron (`missing`, para subirlas después). Con `firstLink` (la primera
 * vez que este dispositivo entra a la cuenta) también se suman sus días de descanso y notas.
 */
export function mergeCloud(
  datos: unknown,
  cloudSessions: WorkoutSession[],
  local: AppData,
  firstLink: boolean,
): { merged: unknown; missing: WorkoutSession[] } {
  const ids = new Set(cloudSessions.map((session) => session.id))
  const missing = local.sessions.filter((session) => !ids.has(session.id))
  const base: Record<string, unknown> = typeof datos === 'object' && datos !== null ? { ...datos } : {}
  if (firstLink) {
    const cloudRest = Array.isArray(base.restDays) ? base.restDays : []
    const cloudNotes = Array.isArray(base.notes) ? (base.notes as Array<{ id?: unknown }>) : []
    const noteIds = new Set(cloudNotes.map((note) => note?.id))
    base.restDays = [...new Set([...cloudRest, ...local.restDays])]
    base.notes = [...cloudNotes, ...local.notes.filter((note) => !noteIds.has(note.id))]
  }
  return { merged: { ...base, sessions: [...cloudSessions, ...missing] }, missing }
}
