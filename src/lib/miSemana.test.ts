import { describe, expect, it } from 'vitest'
import { miSemanaDay, nextRepeatDay, planExerciseCompletion, REST_NOTE, type MiSemanaTask } from './miSemana'

const DIARIO = [0, 1, 2, 3, 4, 5, 6]

function task(patch: Partial<MiSemanaTask> = {}): MiSemanaTask {
  return {
    id: 't1',
    titulo: 'Hacer ejercicio',
    area: 'casa',
    sub: 'Ejercicio',
    dia: '2026-10-19',
    nota: 'Bloque desde las 11 p. m.',
    obligatorio: false,
    repite: DIARIO,
    ...patch,
  }
}

describe('miSemanaDay', () => {
  it('el día cambia a las 4 a. m., como en Mi Semana', () => {
    expect(miSemanaDay(new Date(2026, 9, 19, 23, 30))).toBe('2026-10-19')
    expect(miSemanaDay(new Date(2026, 9, 20, 0, 30))).toBe('2026-10-19')
    expect(miSemanaDay(new Date(2026, 9, 20, 3, 59))).toBe('2026-10-19')
    expect(miSemanaDay(new Date(2026, 9, 20, 4, 0))).toBe('2026-10-20')
  })
})

describe('nextRepeatDay', () => {
  it('diario: al día siguiente', () => {
    expect(nextRepeatDay('2026-10-19', DIARIO)).toBe('2026-10-20')
  })

  it('salta a la siguiente fecha que toca (lunes = 0)', () => {
    // Jueves 22 → con lun, mar, mié, jue y dom, lo siguiente es el domingo 25
    expect(nextRepeatDay('2026-10-22', [0, 1, 2, 3, 6])).toBe('2026-10-25')
    // Domingo 25 → lunes 26 (cruza la semana)
    expect(nextRepeatDay('2026-10-25', [0, 1, 2, 3, 6])).toBe('2026-10-26')
  })
})

describe('planExerciseCompletion', () => {
  it('lo marca hecho ese día y crea el siguiente', () => {
    const { update, next } = planExerciseCompletion(task(), '2026-10-19', 'done', 'n1')
    expect(update).toEqual({ hecho: true, hecha_en: '2026-10-19', dia: '2026-10-19', siguiente: 'n1' })
    expect(next).toMatchObject({ id: 'n1', dia: '2026-10-20', hecho: false, nota: 'Bloque desde las 11 p. m.', repite: DIARIO })
  })

  it('si venía de días anteriores, queda hecho hoy y el siguiente es mañana', () => {
    const { update, next } = planExerciseCompletion(task({ dia: '2026-10-17' }), '2026-10-19', 'done', 'n1')
    expect(update.dia).toBe('2026-10-19')
    expect(next?.dia).toBe('2026-10-20')
  })

  it('descanso: pone la nota de descanso solo en el de hoy', () => {
    const { update, next } = planExerciseCompletion(task(), '2026-10-19', 'rest', 'n1')
    expect(update).toMatchObject({ hecho: true, nota: REST_NOTE })
    expect(next?.nota).toBe('Bloque desde las 11 p. m.')
  })

  it('si no se repite, no crea otro', () => {
    const { update, next } = planExerciseCompletion(task({ repite: [] }), '2026-10-19', 'done', 'n1')
    expect(next).toBeNull()
    expect(update.siguiente).toBeNull()
  })
})
