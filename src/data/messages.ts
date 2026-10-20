/** Frases sin presión para el inicio. Se elige una distinta cada día. */
export const MOTIVATIONAL_MESSAGES = [
  'Primero me muevo, después decido si tengo energía para entrenar. No tengo que hacerlo perfecto.',
  'Una serie bien hecha cuenta más que una rutina a medias con prisa.',
  'Descansar también es parte del entrenamiento.',
  'Hoy basta con aparecer. Lo demás lo vamos viendo.',
  'La fuerza se construye en pasos pequeños y repetidos.',
  'Si hoy solo alcanza para movilidad, eso también suma.',
  'Escucha a tu cuerpo: el objetivo es sentirte bien, no aguantar.',
]

export function messageForDate(date: Date): string {
  const dayNumber = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  )
  return MOTIVATIONAL_MESSAGES[dayNumber % MOTIVATIONAL_MESSAGES.length]
}
