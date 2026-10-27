import { getExercise } from '../data/exercises'
import { getRoutine, isRoutineId } from '../data/routines'
import { getWarmUp } from '../data/warmups'
import type { CompletedSet, ISODate, RoutineId, WorkoutSession } from '../types'
import { dayOf, toISODate } from './dates'
import type { ExercisePart } from './router'
import { parseRest, phasesForItem, type TimerPhase } from './timer'

/** Un paso del entrenamiento guiado: hacer una serie o descansar. */
export type WorkoutStep =
  | {
      kind: 'exercise'
      part: ExercisePart
      exerciseId: string
      /** Serie actual y total de series de este ejercicio. */
      set: number
      sets: number
      target: string
      /** Fases del temporizador si va por tiempo; null si va por repeticiones. */
      phases: TimerPhase[] | null
      /** Lugar del ejercicio dentro de su parte ("Ejercicio 2 de 4"). */
      position: number
      total: number
    }
  | {
      kind: 'rest'
      /** Rango de descanso en segundos ("60–90 s" → 60 y 90). */
      min: number
      max: number
      next: { exerciseId: string; set: number; sets: number }
    }

const DEFAULT_REST = { min: 60, max: 60 }

/**
 * Recorrido completo de una rutina: el calentamiento seguido (sin descansos) y luego cada serie
 * de cada ejercicio con su descanso después, menos al final. La movilidad no lleva descansos:
 * es suave y continua.
 */
export function buildWorkout(routineId: RoutineId): WorkoutStep[] {
  const routine = getRoutine(routineId)
  const warmUp = getWarmUp(routineId)?.items ?? []
  const steps: WorkoutStep[] = []

  warmUp.forEach((item, index) => {
    steps.push({
      kind: 'exercise',
      part: 'warmup',
      exerciseId: item.exerciseId,
      set: 1,
      sets: 1,
      target: item.target,
      phases: phasesForItem(item.target, getExercise(item.exerciseId)?.target ?? ''),
      position: index + 1,
      total: warmUp.length,
    })
  })

  const withRest = routine.kind !== 'mobility'
  routine.items.forEach((item, index) => {
    const exercise = getExercise(item.exerciseId)
    const rest = (exercise?.rest && parseRest(exercise.rest)) || DEFAULT_REST
    for (let set = 1; set <= item.sets; set++) {
      steps.push({
        kind: 'exercise',
        part: 'main',
        exerciseId: item.exerciseId,
        set,
        sets: item.sets,
        target: item.target,
        phases: phasesForItem(item.target, exercise?.target ?? ''),
        position: index + 1,
        total: routine.items.length,
      })
      const nextItem = set < item.sets ? item : routine.items[index + 1]
      if (withRest && nextItem) {
        steps.push({
          kind: 'rest',
          ...rest,
          next: { exerciseId: nextItem.exerciseId, set: set < item.sets ? set + 1 : 1, sets: nextItem.sets },
        })
      }
    }
  })

  return steps
}

/** El día de la sesión: si terminas a las 12:30 a. m., cuenta para el día anterior. */
export function sessionDate(endedAt: Date): ISODate {
  return toISODate(dayOf(endedAt))
}

export function buildSession(input: {
  id: string
  routineId: RoutineId
  startedAt: string
  endedAt: Date
  completedSets: CompletedSet[]
  status: WorkoutSession['status']
  note?: string
}): WorkoutSession {
  const note = input.note?.trim()
  return {
    id: input.id,
    routineId: input.routineId,
    date: sessionDate(input.endedAt),
    startedAt: input.startedAt,
    endedAt: input.endedAt.toISOString(),
    status: input.status,
    completedSets: input.completedSets,
    ...(note ? { note } : {}),
  }
}

/** Entrenamiento a medias, guardado para retomarlo si sales de la app. */
export interface WorkoutProgress {
  routineId: RoutineId
  step: number
  startedAt: string
  completedSets: CompletedSet[]
}

/** Se retoma solo si es de la misma rutina y empezó hace menos de 3 horas. */
export const RESUME_WINDOW_MS = 3 * 3_600_000

export function resumableProgress(value: unknown, routineId: RoutineId, now: Date, stepCount: number): WorkoutProgress | null {
  if (typeof value !== 'object' || value === null) return null
  const progress = value as Partial<WorkoutProgress>
  if (typeof progress.routineId !== 'string' || !isRoutineId(progress.routineId) || progress.routineId !== routineId) return null
  if (typeof progress.step !== 'number' || !Number.isInteger(progress.step) || progress.step < 0 || progress.step >= stepCount) return null
  const started = typeof progress.startedAt === 'string' ? Date.parse(progress.startedAt) : NaN
  if (Number.isNaN(started) || now.getTime() - started > RESUME_WINDOW_MS) return null
  return {
    routineId,
    step: progress.step,
    startedAt: progress.startedAt as string,
    completedSets: Array.isArray(progress.completedSets) ? progress.completedSets : [],
  }
}
