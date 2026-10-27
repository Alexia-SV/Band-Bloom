import type { AppData, ISODate, WorkoutSession } from '../types'
import { createId } from './id'
import { EXERCISE_HABIT, planExerciseCompletion, type MiSemanaTask } from './miSemana'
import { supabase } from './supabase'
import { cloudDatos, rowToSession, sessionToRow, type SessionRow } from './sync'

export interface CloudSnapshot {
  datos: unknown
  sessions: WorkoutSession[]
}

/** Lo que hay en la nube; `null` si esta cuenta todavía no tiene datos de Band & Bloom. */
export async function fetchCloud(): Promise<CloudSnapshot | null> {
  const [datos, sesiones] = await Promise.all([
    supabase.from('bb_datos').select('datos').maybeSingle(),
    supabase.from('bb_sesiones').select('id, routine_id, fecha, started_at, ended_at, status, completed_sets, note'),
  ])
  if (datos.error) throw datos.error
  if (sesiones.error) throw sesiones.error
  if (!datos.data) return null
  return { datos: datos.data.datos, sessions: (sesiones.data as SessionRow[]).map(rowToSession) }
}

export async function pushDatos(userId: string, data: AppData): Promise<void> {
  const { error } = await supabase
    .from('bb_datos')
    .upsert({ user_id: userId, datos: cloudDatos(data), actualizado: new Date().toISOString() })
  if (error) throw error
}

/** Sube sesiones; si alguna ya estaba, la reemplaza (así un reintento no la duplica). */
export async function pushSessions(userId: string, sessions: WorkoutSession[]): Promise<void> {
  if (sessions.length === 0) return
  const { error } = await supabase.from('bb_sesiones').upsert(sessions.map((s) => ({ user_id: userId, ...sessionToRow(s) })))
  if (error) throw error
}

export async function deleteCloudData(userId: string): Promise<void> {
  const sesiones = await supabase.from('bb_sesiones').delete().eq('user_id', userId)
  if (sesiones.error) throw sesiones.error
  const datos = await supabase.from('bb_datos').delete().eq('user_id', userId)
  if (datos.error) throw datos.error
}

/**
 * Palomea en Mi Semana el pendiente de ejercicio de `day` (o el que se arrastró de días anteriores),
 * como hecho o como descanso. Si no hay pendiente de ejercicio abierto, no hace nada.
 */
export async function markExerciseInMiSemana(day: ISODate, kind: 'done' | 'rest'): Promise<void> {
  const { data, error } = await supabase
    .from('tareas')
    .select('id, titulo, area, sub, dia, nota, obligatorio, repite')
    .eq('area', EXERCISE_HABIT.area)
    .eq('sub', EXERCISE_HABIT.sub)
    .eq('hecho', false)
    .lte('dia', day)
    .order('dia')
    .limit(1)
  if (error) throw error
  const task = (data as MiSemanaTask[] | null)?.[0]
  if (!task) return
  const { update, next } = planExerciseCompletion(task, day, kind, createId())
  if (next) {
    const inserted = await supabase.from('tareas').insert(next)
    if (inserted.error) throw inserted.error
  }
  const updated = await supabase.from('tareas').update(update).eq('id', task.id)
  if (updated.error) throw updated.error
}
