export interface ResistanceBand {
  id: 'pink' | 'purple'
  name: string
  resistance: string
  /** Color real de la liga, para dibujarla. */
  color: string
  summary: string
  useFor: string[]
}

export const BANDS: ResistanceBand[] = [
  {
    id: 'pink',
    name: 'Liga rosa',
    resistance: 'Light',
    color: '#f38aa7',
    summary: 'Tu liga principal para aprender. Permite movimientos controlados mientras dominas la técnica.',
    useFor: ['Todas las rutinas de las primeras semanas', 'Ejercicios de brazos y hombros', 'Sentadillas, puentes y abducciones'],
  },
  {
    id: 'purple',
    name: 'Liga morada',
    resistance: 'X-Heavy',
    color: '#6a4fc4',
    summary:
      'Muy resistente. No es "mejor", solo más dura. Resérvala para piernas y glúteos cuando la rosa ya se sienta fácil con buena técnica.',
    useFor: ['Puentes de glúteos y sentadillas, más adelante', 'No la uses todavía para brazos ni hombros'],
  },
]

export const BAND_SAFETY_TIPS = [
  'Elige la resistencia que te permita moverte con control y buena postura en todas las repeticiones.',
  'Revisa la liga antes de usarla: si tiene cortes, grietas o zonas delgadas, no la uses.',
  'No la estires más de lo que te permite un movimiento cómodo y controlado.',
  'Mantén la liga lejos de la cara, sobre todo cuando está tensa.',
  'No la ates a muebles ni objetos que se puedan mover o caer.',
  'Si se resbala o sientes que pierdes el equilibrio, detente y acomódala antes de seguir.',
]
