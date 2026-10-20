import type { Exercise } from '../types'

/**
 * Catálogo de ejercicios. Por ahora solo nombre e ID;
 * en la Etapa 3 cada ejercicio recibe instrucciones paso a paso,
 * consejos de seguridad, errores comunes, variaciones e ilustración.
 */
export const EXERCISES: Exercise[] = [
  // Fuerza
  { id: 'band-squat', name: 'Sentadillas con banda', nameEn: 'Banded squat' },
  { id: 'band-glute-bridge', name: 'Puente de glúteos con banda', nameEn: 'Banded glute bridge' },
  { id: 'calf-raise', name: 'Elevaciones de talones', nameEn: 'Calf raise' },
  { id: 'standing-hip-abduction', name: 'Abducción de cadera de pie', nameEn: 'Standing hip abduction' },
  { id: 'wall-push-up', name: 'Flexiones contra la pared', nameEn: 'Wall push-up' },
  { id: 'band-biceps-curl', name: 'Curl de bíceps con banda', nameEn: 'Banded biceps curl' },
  { id: 'band-pull-apart', name: 'Aperturas de brazos con banda', nameEn: 'Band pull-apart' },
  { id: 'bird-dog', name: 'Bird dog', nameEn: 'Bird dog' },
  // Movilidad
  { id: 'march-in-place', name: 'Marcha en el sitio', nameEn: 'March in place' },
  { id: 'shoulder-circles', name: 'Círculos de hombros', nameEn: 'Shoulder circles' },
  { id: 'ankle-circles', name: 'Círculos de tobillos', nameEn: 'Ankle circles' },
  { id: 'hip-circles', name: 'Círculos de cadera', nameEn: 'Hip circles' },
  { id: 'cat-cow', name: 'Gato-vaca', nameEn: 'Cat-cow' },
  { id: 'hamstring-stretch', name: 'Estiramiento suave de isquiotibiales', nameEn: 'Gentle hamstring stretch' },
  { id: 'chest-opener', name: 'Apertura de pecho', nameEn: 'Chest opener' },
]

const byId = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]))

export function getExercise(id: string): Exercise | undefined {
  return byId.get(id)
}
