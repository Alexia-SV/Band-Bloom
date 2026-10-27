import type { AppData, ISODate, WorkoutSession } from '../types'
import { createId } from './id'
import { EXERCISE_HABIT, planExerciseCompletion, REST_NOTE, type MiSemanaTask } from './miSemana'
import { supabase } from './supabase'
import { cloudDatos, rowToSession, sessionToRow, type SessionRow } from './sync'

export interface CloudSnapshot {
  datos: unknown
  sessions: WorkoutSession[]
  /** Cuándo se hizo el último "Borrar todo" (para que otros dispositivos no revivan lo borrado). */
  resetAt: string | null
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
  const doc = datos.data.datos as { resetAt?: unknown } | null
  return {
    datos: doc,
    sessions: (sesiones.data as SessionRow[]).map(rowToSession),
    resetAt: typeof doc?.resetAt === 'string' ? doc.resetAt : null,
  }
}

/** Sube los ajustes. `resetAt` se guarda siempre junto, para no perder la marca del último "Borrar todo". */
export async function pushDatos(userId: string, data: AppData, resetAt: string | null): Promise<void> {
  const datos = { ...cloudDatos(data), ...(resetAt ? { resetAt } : {}) }
  const { error } = await supabase.from('bb_datos').upsert({ user_id: userId, datos, actualizado: new Date().toISOString() })
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
  // Primero se marca, solo si sigue abierto: si otra marca (u otro dispositivo) ya lo hizo,
  // no se actualiza nada y tampoco se crea un siguiente duplicado.
  const updated = await supabase.from('tareas').update(update).eq('id', task.id).eq('hecho', false).select('id')
  if (updated.error) throw updated.error
  if (!updated.data?.length || !next) return
  const inserted = await supabase.from('tareas').insert(next)
  if (inserted.error) throw inserted.error
}

/**
 * Deshace en Mi Semana un descanso de `day` que puso Band & Bloom: el pendiente vuelve a abrirse
 * y se borra el siguiente que se había creado (si no se ha hecho), como el "Deshacer" de Mi Semana.
 */
export async function unmarkRestInMiSemana(day: ISODate): Promise<void> {
  const { data, error } = await supabase
    .from('tareas')
    .select('id, siguiente')
    .eq('area', EXERCISE_HABIT.area)
    .eq('sub', EXERCISE_HABIT.sub)
    .eq('hecho', true)
    .eq('dia', day)
    .eq('nota', REST_NOTE)
    .limit(1)
  if (error) throw error
  const task = (data as Array<{ id: string; siguiente: string | null }> | null)?.[0]
  if (!task) return
  // La nota original se copió al siguiente al marcar: de ahí se recupera.
  let nota = ''
  if (task.siguiente) {
    const next = await supabase.from('tareas').select('id, hecho, nota').eq('id', task.siguiente).maybeSingle()
    if (next.error) throw next.error
    if (next.data && !next.data.hecho) {
      nota = next.data.nota ?? ''
      const removed = await supabase.from('tareas').delete().eq('id', next.data.id)
      if (removed.error) throw removed.error
    }
  }
  const reopened = await supabase.from('tareas').update({ hecho: false, hecha_en: null, siguiente: null, nota }).eq('id', task.id)
  if (reopened.error) throw reopened.error
}
