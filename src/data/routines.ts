import type { Routine, RoutineId, StrengthRoutineId } from '../types'

const PINK_BAND = 'Liga rosa (Light)'
const PURPLE_BAND = 'Liga morada (X-Heavy)'
const SLOW = 'Baja en 3 s'

/**
 * Rutinas. Desde nov 2026 son más intensas (3 series, bajadas lentas y liga morada en piernas)
 * y hay seis para entrenar casi diario sin repetir el mismo grupo dos días seguidos:
 * A piernas · B tren superior · C cuerpo completo · D cardio sin saltos · E glúteos · F core.
 */
export const ROUTINES: Routine[] = [
  {
    id: 'a',
    kind: 'strength',
    letter: 'A',
    name: 'Piernas',
    durationLabel: '25–30 min',
    muscleGroups: ['Cuádriceps', 'Glúteos', 'Pantorrillas'],
    equipment: [PINK_BAND, PURPLE_BAND, 'Pared o silla para apoyo'],
    focus: 'legs',
    tone: 'peach',
    items: [
      { exerciseId: 'band-squat', sets: 3, target: '12–15', band: 'purple', cue: 'Pausa 2 s abajo' },
      { exerciseId: 'reverse-lunge', sets: 3, target: '8–10 por lado', cue: SLOW },
      { exerciseId: 'sumo-squat', sets: 3, target: '12–15', band: 'purple' },
      { exerciseId: 'lateral-band-walk', sets: 3, target: '10 pasos por lado' },
      { exerciseId: 'calf-raise', sets: 3, target: '15–20', cue: 'Pausa 1 s arriba' },
    ],
  },
  {
    id: 'b',
    kind: 'strength',
    letter: 'B',
    name: 'Tren superior',
    durationLabel: '25–30 min',
    muscleGroups: ['Pecho', 'Espalda', 'Hombros', 'Brazos'],
    equipment: [PINK_BAND, 'Silla firme', 'Tapete'],
    focus: 'upper',
    tone: 'lavender',
    items: [
      { exerciseId: 'incline-push-up', sets: 3, target: '8–12', cue: SLOW },
      { exerciseId: 'band-row', sets: 3, target: '12–15', cue: 'Pausa 1 s atrás' },
      { exerciseId: 'band-overhead-press', sets: 3, target: '10–12' },
      { exerciseId: 'band-pull-apart', sets: 3, target: '12–15' },
      { exerciseId: 'band-biceps-curl', sets: 3, target: '10–12', cue: SLOW },
      { exerciseId: 'chair-dip', sets: 3, target: '8–10' },
    ],
  },
  {
    id: 'c',
    kind: 'strength',
    letter: 'C',
    name: 'Cuerpo completo',
    durationLabel: '25–30 min',
    muscleGroups: ['Piernas', 'Glúteos', 'Pecho', 'Espalda', 'Hombros'],
    equipment: [PINK_BAND, 'Tapete'],
    focus: 'full',
    tone: 'sky',
    items: [
      { exerciseId: 'band-squat', sets: 3, target: '12–15' },
      { exerciseId: 'knee-push-up', sets: 3, target: '6–10' },
      { exerciseId: 'reverse-lunge', sets: 3, target: '8 por lado' },
      { exerciseId: 'band-row', sets: 3, target: '12–15' },
      { exerciseId: 'single-leg-bridge', sets: 3, target: '8–10 por lado' },
      { exerciseId: 'band-overhead-press', sets: 3, target: '10–12' },
    ],
  },
  {
    id: 'd',
    kind: 'strength',
    letter: 'D',
    name: 'Cardio sin saltos',
    durationLabel: '20 min',
    muscleGroups: ['Corazón', 'Piernas', 'Cuerpo completo'],
    equipment: ['Sin equipo', 'Tenis'],
    focus: 'cardio',
    tone: 'rose',
    items: [
      { exerciseId: 'step-jack', sets: 3, target: '40 s' },
      { exerciseId: 'high-knees', sets: 3, target: '30 s' },
      { exerciseId: 'skater', sets: 3, target: '30 s' },
      { exerciseId: 'bodyweight-squat', sets: 3, target: '15', cue: 'Rápido y con control' },
      { exerciseId: 'march-in-place', sets: 2, target: '1 min', cue: 'Brazos arriba y rápido' },
    ],
  },
  {
    id: 'e',
    kind: 'strength',
    letter: 'E',
    name: 'Glúteos',
    durationLabel: '25 min',
    muscleGroups: ['Glúteos', 'Cadera', 'Isquiotibiales'],
    equipment: [PINK_BAND, PURPLE_BAND, 'Tapete', 'Silla para apoyo'],
    focus: 'legs',
    tone: 'peach',
    items: [
      { exerciseId: 'band-glute-bridge', sets: 3, target: '15', band: 'purple', cue: 'Pausa 2 s arriba' },
      { exerciseId: 'single-leg-bridge', sets: 3, target: '10 por lado' },
      { exerciseId: 'donkey-kick', sets: 3, target: '12 por lado' },
      { exerciseId: 'standing-hip-abduction', sets: 3, target: '12–15 por lado', cue: SLOW },
      { exerciseId: 'sumo-squat', sets: 3, target: '15', band: 'purple' },
    ],
  },
  {
    id: 'f',
    kind: 'strength',
    letter: 'F',
    name: 'Core y cardio corto',
    durationLabel: '20 min',
    muscleGroups: ['Abdomen', 'Espalda baja', 'Corazón'],
    equipment: ['Tapete'],
    focus: 'core',
    tone: 'lavender',
    items: [
      { exerciseId: 'dead-bug', sets: 3, target: '8 por lado', cue: 'Lento, espalda pegada' },
      { exerciseId: 'plank', sets: 3, target: '30 s' },
      { exerciseId: 'bird-dog', sets: 3, target: '8 por lado', cue: 'Mantén 3 s' },
      { exerciseId: 'mountain-climber', sets: 3, target: '30 s' },
      { exerciseId: 'step-jack', sets: 2, target: '45 s' },
    ],
  },
  {
    id: 'short',
    kind: 'short',
    name: 'Rutina corta',
    durationLabel: '10 min',
    muscleGroups: ['Cuerpo completo'],
    equipment: [PINK_BAND, 'Pared', 'Tapete'],
    focus: 'full',
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
    focus: 'mobility',
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

/** Orden en que se sugieren las rutinas si la del día ya se hizo (el mismo del plan diario). */
export const STRENGTH_ROTATION: StrengthRoutineId[] = ['a', 'b', 'd', 'c', 'f', 'e']

export function isStrengthRoutineId(value: string): value is StrengthRoutineId {
  return (STRENGTH_ROTATION as string[]).includes(value)
}

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
