import type { ISODate } from '../types'
import { addDays, dayOf, parseISODate, toISODate } from './dates'

/** Pendiente de Mi Semana (tabla `tareas`), solo con los campos que usamos aquí. */
export interface MiSemanaTask {
  id: string
  titulo: string
  area: string | null
  sub: string | null
  dia: ISODate | null
  nota: string
  obligatorio: boolean
  repite: number[] | null
}

/** En Mi Semana, el hábito de ejercicio es el pendiente de Casa · Ejercicio. */
export const EXERCISE_HABIT = { area: 'casa', sub: 'Ejercicio' } as const

/** La misma nota que pone "Hoy descanso" en Mi Semana: cuenta como descanso y no rompe la racha. */
export const REST_NOTE = 'Hoy fue descanso 🌙'

/** Mi Semana (y Band & Bloom) cambian de día a las 4 a. m.: entrenar a las 12:30 a. m. cuenta para el día anterior. */
export function miSemanaDay(now: Date): ISODate {
  return toISODate(dayOf(now))
}

/** Lunes = 0 … domingo = 6, como guarda Mi Semana los días que se repite. */
function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7
}

/** Siguiente día después de `from` que cae en uno de los días de `repite`. */
export function nextRepeatDay(from: ISODate, repite: number[]): ISODate {
  let next = addDays(parseISODate(from), 1)
  for (let i = 0; i < 7 && !repite.includes(weekdayIndex(next)); i++) next = addDays(next, 1)
  return toISODate(next)
}

/**
 * Lo que hace Mi Semana al palomear el ejercicio: queda hecho en `day` (aunque viniera de días
 * anteriores) y, si se repite, se crea el siguiente pendiente en el próximo día que le toca.
 */
export function planExerciseCompletion(task: MiSemanaTask, day: ISODate, kind: 'done' | 'rest', nextId: string) {
  const dia = !task.dia || task.dia < day ? day : task.dia
  const repite = task.repite ?? []
  const next = repite.length
    ? {
        id: nextId,
        titulo: task.titulo,
        area: task.area,
        sub: task.sub,
        obligatorio: task.obligatorio,
        nota: task.nota,
        repite,
        dia: nextRepeatDay(dia, repite),
        hecho: false,
        hecha_en: null,
        siguiente: null,
      }
    : null
  const update = {
    hecho: true,
    hecha_en: day,
    dia,
    siguiente: next ? next.id : null,
    ...(kind === 'rest' ? { nota: REST_NOTE } : {}),
  }
  return { update, next }
}
