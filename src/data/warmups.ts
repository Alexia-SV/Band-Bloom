import type { RoutineId, RoutineItem } from '../types'

export interface WarmUp {
  durationLabel: string
  /** Por qué este calentamiento, en una frase. */
  focus: string
  items: RoutineItem[]
}

/**
 * Calentamiento con movimientos dinámicos (suaves y controlados) antes de cada rutina.
 * Se eligen según los músculos que trabaja cada una. Los estiramientos largos y quietos
 * se recomiendan mejor al terminar, no antes de hacer fuerza.
 * La movilidad diaria no lleva calentamiento: ella misma es un calentamiento.
 */
export const WARMUPS: Partial<Record<RoutineId, WarmUp>> = {
  a: {
    durationLabel: '4 min',
    focus: 'Prepara cadera, rodillas y tobillos para sentadillas, puentes y abducciones.',
    items: [
      { exerciseId: 'march-in-place', sets: 1, target: '1 min' },
      { exerciseId: 'hip-circles', sets: 1, target: '20 s por dirección' },
      { exerciseId: 'leg-swings', sets: 1, target: '10 por pierna' },
      { exerciseId: 'hip-hinge', sets: 1, target: '10' },
      { exerciseId: 'ankle-circles', sets: 1, target: '10 s por dirección, cada pie' },
      { exerciseId: 'bodyweight-squat', sets: 1, target: '8' },
    ],
  },
  b: {
    durationLabel: '4 min',
    focus: 'Prepara hombros, brazos y espalda para flexiones, curls y aperturas.',
    items: [
      { exerciseId: 'march-in-place', sets: 1, target: '1 min' },
      { exerciseId: 'arm-circles', sets: 1, target: '10 adelante + 10 atrás' },
      { exerciseId: 'shoulder-circles', sets: 1, target: '20 s atrás + 20 s adelante' },
      { exerciseId: 'torso-twists', sets: 1, target: '10 por lado' },
      { exerciseId: 'cat-cow', sets: 1, target: '6 respiraciones' },
      { exerciseId: 'chest-opener', sets: 1, target: '5 repeticiones suaves' },
    ],
  },
  c: {
    durationLabel: '5 min',
    focus: 'Calienta todo el cuerpo: piernas, cadera, hombros y espalda.',
    items: [
      { exerciseId: 'march-in-place', sets: 1, target: '1 min' },
      { exerciseId: 'arm-circles', sets: 1, target: '10 adelante + 10 atrás' },
      { exerciseId: 'hip-circles', sets: 1, target: '20 s por dirección' },
      { exerciseId: 'leg-swings', sets: 1, target: '8 por pierna' },
      { exerciseId: 'torso-twists', sets: 1, target: '8 por lado' },
      { exerciseId: 'bodyweight-squat', sets: 1, target: '8' },
    ],
  },
  short: {
    durationLabel: '2 min',
    focus: 'Un calentamiento breve para que la rutina corta siga siendo corta.',
    items: [
      { exerciseId: 'march-in-place', sets: 1, target: '30 s' },
      { exerciseId: 'arm-circles', sets: 1, target: '8 adelante + 8 atrás' },
      { exerciseId: 'hip-circles', sets: 1, target: '15 s por dirección' },
      { exerciseId: 'bodyweight-squat', sets: 1, target: '6' },
    ],
  },
}

export function getWarmUp(routineId: RoutineId): WarmUp | undefined {
  return WARMUPS[routineId]
}
