import type { Routine, RoutineId } from '../types'

const PINK_BAND = 'Liga rosa (Light)'

export const ROUTINES: Routine[] = [
  {
    id: 'a',
    kind: 'strength',
    letter: 'A',
    name: 'Piernas y glúteos',
    durationLabel: '15–20 min',
    muscleGroups: ['Glúteos', 'Piernas', 'Pantorrillas'],
    equipment: [PINK_BAND, 'Pared o silla para apoyo'],
    tone: 'peach',
    items: [
      { exerciseId: 'band-squat', sets: 2, target: '8–12' },
      { exerciseId: 'band-glute-bridge', sets: 2, target: '12–15' },
      { exerciseId: 'calf-raise', sets: 2, target: '12–20' },
      { exerciseId: 'standing-hip-abduction', sets: 2, target: '10–12 por lado' },
    ],
  },
  {
    id: 'b',
    kind: 'strength',
    letter: 'B',
    name: 'Tren superior',
    durationLabel: '15–20 min',
    muscleGroups: ['Pecho', 'Brazos', 'Hombros', 'Espalda y abdomen'],
    equipment: [PINK_BAND, 'Pared', 'Tapete'],
    tone: 'lavender',
    items: [
      { exerciseId: 'wall-push-up', sets: 2, target: '8–12' },
      { exerciseId: 'band-biceps-curl', sets: 2, target: '8–12' },
      { exerciseId: 'band-pull-apart', sets: 2, target: '8–12' },
      { exerciseId: 'bird-dog', sets: 2, target: '6–8 por lado' },
    ],
  },
  {
    id: 'c',
    kind: 'strength',
    letter: 'C',
    name: 'Cuerpo completo',
    durationLabel: '20–25 min',
    muscleGroups: ['Piernas', 'Glúteos', 'Pecho', 'Brazos', 'Abdomen'],
    equipment: [PINK_BAND, 'Pared', 'Tapete'],
    tone: 'sky',
    items: [
      { exerciseId: 'band-squat', sets: 2, target: '8–12' },
      { exerciseId: 'band-glute-bridge', sets: 2, target: '12–15' },
      { exerciseId: 'wall-push-up', sets: 2, target: '8–12' },
      { exerciseId: 'band-biceps-curl', sets: 2, target: '8–12' },
      { exerciseId: 'bird-dog', sets: 2, target: '6–8 por lado' },
    ],
  },
  {
    id: 'short',
    kind: 'short',
    name: 'Rutina corta',
    durationLabel: '10 min',
    muscleGroups: ['Cuerpo completo'],
    equipment: [PINK_BAND, 'Pared', 'Tapete'],
    tone: 'rose',
    items: [
      { exerciseId: 'band-squat', sets: 1, target: '10' },
      { exerciseId: 'band-glute-bridge', sets: 1, target: '12' },
      { exerciseId: 'wall-push-up', sets: 1, target: '8' },
      { exerciseId: 'band-biceps-curl', sets: 1, target: '10' },
      { exerciseId: 'bird-dog', sets: 1, target: '6 por lado' },
    ],
  },
  {
    id: 'mobility',
    kind: 'mobility',
    name: 'Movilidad diaria',
    durationLabel: '7 min',
    muscleGroups: ['Articulaciones', 'Espalda', 'Caderas'],
    equipment: ['Sin equipo', 'Apoyo estable'],
    tone: 'sage',
    items: [
      { exerciseId: 'march-in-place', sets: 1, target: '1 min' },
      { exerciseId: 'shoulder-circles', sets: 1, target: '1 min' },
      { exerciseId: 'ankle-circles', sets: 1, target: '1 min' },
      { exerciseId: 'hip-circles', sets: 1, target: '1 min' },
      { exerciseId: 'cat-cow', sets: 1, target: '1 min' },
      { exerciseId: 'hamstring-stretch', sets: 1, target: '1 min' },
      { exerciseId: 'chest-opener', sets: 1, target: '1 min' },
    ],
  },
]

const byId = new Map(ROUTINES.map((routine) => [routine.id, routine]))

export function getRoutine(id: RoutineId): Routine {
  const routine = byId.get(id)
  if (!routine) throw new Error(`Rutina desconocida: ${id}`)
  return routine
}

export function isRoutineId(value: string): value is RoutineId {
  return byId.has(value as RoutineId)
}

/** "A · Piernas y glúteos" o "Movilidad diaria". */
export function routineTitle(routine: Routine): string {
  return routine.letter ? `${routine.letter} · ${routine.name}` : routine.name
}
