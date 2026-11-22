import type { JointPath, LimbAngles, PoseSpec } from '../lib/figure'

/**
 * Ilustraciones originales de cada ejercicio: dos posturas (inicio y movimiento)
 * y los accesorios que hacen falta (liga, pared, silla, tapete, flechas de giro).
 * Ver src/lib/figure.ts para el sistema de ángulos.
 */

export type IllustrationProp =
  /** Liga cerrada arriba de las rodillas. */
  | { type: 'band-knees' }
  /** Liga pisada con los pies y sujeta con las manos. */
  | { type: 'band-feet-hands' }
  /** Liga sujeta entre las dos manos. */
  | { type: 'band-hands' }
  | { type: 'wall'; at: JointPath }
  /** Silla con el borde bajo la articulación; `behind` la pone detrás de la persona (fondos en silla). */
  | { type: 'chair'; at: JointPath; behind?: boolean }
  | { type: 'mat' }
  /** Flecha circular para indicar movimientos en círculo. */
  | { type: 'circle'; at: JointPath; r: number }

export interface Illustration {
  /** Articulación que se mantiene fija entre las dos posturas (por ejemplo, los pies o las manos en la pared). */
  anchor: JointPath
  frames: [PoseSpec, PoseSpec]
  labels: [string, string]
  props: IllustrationProp[]
}

/** Extremidades de pie, relajadas. */
const STAND: LimbAngles = { upperArm: 4, forearm: 8, thigh: 0, shin: 0, foot: 90 }
const limb = (overrides: Partial<LimbAngles> = {}): LimbAngles => ({ ...STAND, ...overrides })

const side = (torso: number, near: Partial<LimbAngles>, far: Partial<LimbAngles>, extra: Partial<PoseSpec> = {}): PoseSpec => ({
  view: 'side',
  torso,
  near: limb(near),
  far: limb(far),
  ...extra,
})

const front = (near: Partial<LimbAngles>, far: Partial<LimbAngles>, extra: Partial<PoseSpec> = {}): PoseSpec => ({
  view: 'front',
  torso: 0,
  near: limb({ upperArm: 8, forearm: 6, thigh: 4, shin: 2, ...near }),
  far: limb({ upperArm: 8, forearm: 6, thigh: 4, shin: 2, ...far }),
  ...extra,
})

/** En cuatro puntos: manos bajo los hombros y rodillas bajo la cadera. */
const QUAD_ARM = { upperArm: 0, forearm: 0 }
const QUAD_LEG = { thigh: 0, shin: -90, foot: -90 }
const QUAD_TORSO = 73

export const ILLUSTRATIONS: Record<string, Illustration> = {
  // ——— Fuerza ———
  'band-squat': {
    anchor: 'near.ankle',
    labels: ['De pie', 'Cadera atrás'],
    frames: [
      side(0, { upperArm: 4 }, { upperArm: -4 }),
      side(32, { upperArm: 82, forearm: 86, thigh: 76, shin: -22 }, { upperArm: 78, forearm: 84, thigh: 76, shin: -22 }),
    ],
    props: [{ type: 'band-knees' }],
  },
  'band-glute-bridge': {
    anchor: 'near.ankle',
    labels: ['Boca arriba', 'Cadera arriba'],
    frames: [
      side(-90, { upperArm: 90, forearm: 90, thigh: 140, shin: -22, foot: 90 }, { upperArm: 90, forearm: 90, thigh: 140, shin: -22 }, { head: -90 }),
      side(-110, { upperArm: 100, forearm: 92, thigh: 100, shin: -40, foot: 90 }, { upperArm: 100, forearm: 92, thigh: 100, shin: -40 }, { head: -90 }),
    ],
    props: [{ type: 'mat' }, { type: 'band-knees' }],
  },
  'calf-raise': {
    anchor: 'near.hand',
    labels: ['Pies apoyados', 'Sobre las puntas'],
    frames: [
      side(4, { upperArm: 72, forearm: 84 }, { upperArm: 68, forearm: 82 }),
      side(4, { upperArm: 66, forearm: 80, foot: 38 }, { upperArm: 62, forearm: 78, foot: 38 }),
    ],
    props: [{ type: 'wall', at: 'near.hand' }],
  },
  'standing-hip-abduction': {
    anchor: 'near.hand',
    labels: ['Con apoyo', 'Pierna al lado'],
    frames: [
      front({ upperArm: 38, forearm: 14 }, {}),
      front({ upperArm: 38, forearm: 14 }, { thigh: 26, shin: 24, upperArm: 10 }),
    ],
    props: [{ type: 'chair', at: 'near.hand' }, { type: 'band-knees' }],
  },
  'wall-push-up': {
    anchor: 'near.hand',
    labels: ['Brazos estirados', 'Pecho a la pared'],
    frames: [
      side(20, { upperArm: 84, forearm: 84, thigh: -20, shin: -20 }, { upperArm: 80, forearm: 82, thigh: -20, shin: -20 }),
      side(32, { upperArm: 20, forearm: 122, thigh: -32, shin: -32, foot: 100 }, { upperArm: 16, forearm: 120, thigh: -32, shin: -32, foot: 100 }),
    ],
    props: [{ type: 'wall', at: 'near.hand' }],
  },
  'band-biceps-curl': {
    anchor: 'near.ankle',
    labels: ['Brazos abajo', 'Codos doblados'],
    frames: [
      side(0, { upperArm: 8, forearm: 12 }, { upperArm: 4, forearm: 8 }),
      side(0, { upperArm: 14, forearm: 150 }, { upperArm: 10, forearm: 146 }),
    ],
    props: [{ type: 'band-feet-hands' }],
  },
  'band-pull-apart': {
    anchor: 'pelvis',
    labels: ['Liga frente al pecho', 'Brazos abiertos'],
    frames: [front({ upperArm: 32, forearm: -120 }, { upperArm: 32, forearm: -120 }), front({ upperArm: 88, forearm: 90 }, { upperArm: 88, forearm: 90 })],
    props: [{ type: 'band-hands' }],
  },
  'bird-dog': {
    anchor: 'far.hand',
    labels: ['En cuatro puntos', 'Brazo y pierna contraria'],
    frames: [
      side(QUAD_TORSO, { ...QUAD_ARM, ...QUAD_LEG }, { ...QUAD_ARM, ...QUAD_LEG }),
      side(QUAD_TORSO, { upperArm: 100, forearm: 100, ...QUAD_LEG }, { ...QUAD_ARM, thigh: -95, shin: -95, foot: -60 }),
    ],
    props: [{ type: 'mat' }],
  },


  // ——— Más intensos (nov 2026) ———
  'reverse-lunge': {
    anchor: 'near.ankle',
    labels: ['De pie', 'Rodilla de atrás abajo'],
    frames: [
      side(0, { upperArm: -24, forearm: 60 }, { upperArm: -28, forearm: 56 }),
      side(6, { upperArm: -24, forearm: 60, thigh: 85, shin: -4 }, { upperArm: -28, forearm: 56, thigh: -15, shin: -100, foot: 40 }),
    ],
    props: [],
  },
  'sumo-squat': {
    anchor: 'near.ankle',
    labels: ['Pies abiertos', 'Cadera abajo, rodillas afuera'],
    frames: [
      front({ upperArm: 32, forearm: -120, thigh: 30, shin: 30 }, { upperArm: 32, forearm: -120, thigh: 30, shin: 30 }),
      front({ upperArm: 32, forearm: -120, thigh: 62, shin: 6 }, { upperArm: 32, forearm: -120, thigh: 62, shin: 6 }),
    ],
    props: [{ type: 'band-knees' }],
  },
  'single-leg-bridge': {
    anchor: 'far.ankle',
    labels: ['Una pierna estirada', 'Cadera arriba'],
    frames: [
      side(-90, { upperArm: 90, forearm: 90, thigh: 140, shin: 140, foot: 150 }, { upperArm: 90, forearm: 90, thigh: 140, shin: -22 }, { head: -90 }),
      side(-110, { upperArm: 100, forearm: 92, thigh: 110, shin: 110, foot: 120 }, { upperArm: 100, forearm: 92, thigh: 100, shin: -40 }, { head: -90 }),
    ],
    props: [{ type: 'mat' }],
  },
  'donkey-kick': {
    anchor: 'far.hand',
    labels: ['En cuatro puntos', 'Planta hacia el techo'],
    frames: [
      side(QUAD_TORSO, { ...QUAD_ARM, ...QUAD_LEG }, { ...QUAD_ARM, ...QUAD_LEG }),
      side(QUAD_TORSO, { ...QUAD_ARM, thigh: -100, shin: 175, foot: 90 }, { ...QUAD_ARM, ...QUAD_LEG }),
    ],
    props: [{ type: 'mat' }, { type: 'band-knees' }],
  },
  'lateral-band-walk': {
    anchor: 'far.ankle',
    labels: ['Media sentadilla', 'Paso al lado'],
    frames: [
      front({ upperArm: 38, forearm: -48, thigh: 14, shin: 4 }, { upperArm: 38, forearm: -48, thigh: 14, shin: 4 }),
      front({ upperArm: 38, forearm: -48, thigh: 34, shin: 26 }, { upperArm: 38, forearm: -48, thigh: 14, shin: 4 }),
    ],
    props: [{ type: 'band-knees' }],
  },
  'incline-push-up': {
    anchor: 'near.hand',
    labels: ['Manos en la silla', 'Pecho al asiento'],
    frames: [
      side(50, { upperArm: 18, forearm: 18, thigh: -50, shin: -50, foot: 40 }, { upperArm: 14, forearm: 16, thigh: -50, shin: -50, foot: 40 }),
      side(60, { upperArm: -40, forearm: 60, thigh: -60, shin: -60, foot: 30 }, { upperArm: -44, forearm: 56, thigh: -60, shin: -60, foot: 30 }),
    ],
    props: [{ type: 'chair', at: 'near.hand' }],
  },
  'knee-push-up': {
    anchor: 'near.hand',
    labels: ['Brazos estirados', 'Pecho abajo'],
    frames: [
      side(52, { upperArm: 0, forearm: 0, thigh: -52, shin: -92, foot: -90 }, { upperArm: 4, forearm: 2, thigh: -52, shin: -92, foot: -90 }),
      side(72, { upperArm: -60, forearm: 62, thigh: -72, shin: -92, foot: -90 }, { upperArm: -64, forearm: 58, thigh: -72, shin: -92, foot: -90 }),
    ],
    props: [{ type: 'mat' }],
  },
  'chair-dip': {
    anchor: 'near.hand',
    labels: ['Brazos estirados', 'Codos atrás, cadera abajo'],
    frames: [
      side(0, { upperArm: -10, forearm: -10, thigh: 85, shin: 5 }, { upperArm: -10, forearm: -10, thigh: 85, shin: 5 }),
      side(0, { upperArm: -53, forearm: 31, thigh: 106, shin: 7 }, { upperArm: -53, forearm: 31, thigh: 106, shin: 7 }),
    ],
    props: [{ type: 'chair', at: 'near.hand', behind: true }],
  },
  'band-row': {
    anchor: 'near.ankle',
    labels: ['Brazos al frente', 'Codos atrás'],
    frames: [
      side(0, { upperArm: 75, forearm: 80, thigh: 90, shin: 90, foot: 170 }, { upperArm: 71, forearm: 78, thigh: 90, shin: 90, foot: 170 }),
      side(0, { upperArm: -25, forearm: 75, thigh: 90, shin: 90, foot: 170 }, { upperArm: -29, forearm: 71, thigh: 90, shin: 90, foot: 170 }),
    ],
    props: [{ type: 'mat' }, { type: 'band-feet-hands' }],
  },
  'band-overhead-press': {
    anchor: 'pelvis',
    labels: ['Manos en los hombros', 'Brazos arriba'],
    frames: [
      front({ upperArm: 70, forearm: 170 }, { upperArm: 70, forearm: 170 }),
      front({ upperArm: 165, forearm: 172 }, { upperArm: 165, forearm: 172 }),
    ],
    props: [{ type: 'band-feet-hands' }],
  },
  plank: {
    anchor: 'near.elbow',
    labels: ['Con rodillas (más fácil)', 'Cuerpo en línea recta'],
    frames: [
      side(70, { upperArm: 0, forearm: 90, thigh: -70, shin: -92, foot: -90 }, { upperArm: 0, forearm: 90, thigh: -70, shin: -92, foot: -90 }),
      side(77, { upperArm: 0, forearm: 90, thigh: -77, shin: -77, foot: 10 }, { upperArm: 0, forearm: 90, thigh: -77, shin: -77, foot: 10 }),
    ],
    props: [{ type: 'mat' }],
  },
  'dead-bug': {
    anchor: 'pelvis',
    labels: ['Brazos arriba, piernas en mesa', 'Brazo y pierna contraria'],
    frames: [
      side(-90, { upperArm: 180, forearm: 180, thigh: 180, shin: 90, foot: 180 }, { upperArm: 176, forearm: 176, thigh: 180, shin: 90, foot: 180 }, { head: -90 }),
      side(-90, { upperArm: -80, forearm: -80, thigh: 180, shin: 90, foot: 180 }, { upperArm: 176, forearm: 176, thigh: 100, shin: 100, foot: 170 }, { head: -90 }),
    ],
    props: [{ type: 'mat' }],
  },
  'mountain-climber': {
    anchor: 'near.hand',
    labels: ['Plancha con las manos', 'Rodilla al pecho'],
    frames: [
      side(64, { upperArm: 0, forearm: 0, thigh: -64, shin: -64, foot: 20 }, { upperArm: 3, forearm: 2, thigh: -64, shin: -64, foot: 20 }),
      side(64, { upperArm: 0, forearm: 0, thigh: 75, shin: -30, foot: 60 }, { upperArm: 3, forearm: 2, thigh: -64, shin: -64, foot: 20 }),
    ],
    props: [{ type: 'mat' }],
  },
  'step-jack': {
    anchor: 'far.ankle',
    labels: ['Brazos abajo', 'Paso al lado, brazos arriba'],
    frames: [front({}, {}), front({ upperArm: 155, forearm: 165, thigh: 24, shin: 22 }, { upperArm: 155, forearm: 165 })],
    props: [],
  },
  'high-knees': {
    anchor: 'far.ankle',
    labels: ['Rodilla a la cadera', 'Cambia rápido'],
    frames: [
      side(0, { upperArm: -40, forearm: 20, thigh: 95, shin: 0, foot: 80 }, { upperArm: 40, forearm: 110 }),
      side(0, { upperArm: 40, forearm: 110 }, { upperArm: -40, forearm: 20, thigh: 95, shin: 0, foot: 80 }),
    ],
    props: [],
  },
  skater: {
    anchor: 'pelvis',
    labels: ['Pierna cruzada atrás', 'Cambia de lado'],
    frames: [
      front({ upperArm: -30, forearm: -40, thigh: 10, shin: -4 }, { upperArm: 50, forearm: 50, thigh: -18, shin: -14 }, { torso: 8 }),
      front({ upperArm: 50, forearm: 50, thigh: -18, shin: -14 }, { upperArm: -30, forearm: -40, thigh: 10, shin: -4 }, { torso: -8 }),
    ],
    props: [],
  },

  // ——— Movilidad ———
  'march-in-place': {
    anchor: 'far.ankle',
    labels: ['Una rodilla arriba', 'Cambia de pierna'],
    frames: [
      side(2, { upperArm: 30, forearm: 70, thigh: 72, shin: 0, foot: 80 }, { upperArm: -30, forearm: 10 }),
      side(2, { upperArm: -30, forearm: 10 }, { upperArm: 30, forearm: 70, thigh: 72, shin: 0, foot: 80 }),
    ],
    props: [],
  },
  'shoulder-circles': {
    anchor: 'near.ankle',
    labels: ['Codos al frente', 'Codos arriba'],
    frames: [
      side(0, { upperArm: 88, forearm: -100 }, { upperArm: 84, forearm: -104 }),
      side(0, { upperArm: 168, forearm: 6 }, { upperArm: 164, forearm: 2 }),
    ],
    props: [{ type: 'circle', at: 'near.shoulder', r: 30 }],
  },
  'ankle-circles': {
    anchor: 'far.ankle',
    labels: ['Pie arriba', 'Gira el tobillo'],
    frames: [
      side(2, { upperArm: 70, forearm: 80, thigh: 28, shin: 14, foot: 120 }, { upperArm: 66, forearm: 78 }),
      side(2, { upperArm: 70, forearm: 80, thigh: 28, shin: 14, foot: 60 }, { upperArm: 66, forearm: 78 }),
    ],
    props: [
      { type: 'chair', at: 'far.hand' },
      { type: 'circle', at: 'near.ankle', r: 12 },
    ],
  },
  'hip-circles': {
    anchor: 'pelvis',
    labels: ['Manos en la cadera', 'Círculos suaves'],
    frames: [
      front({ upperArm: 38, forearm: -48, thigh: 8 }, { upperArm: 38, forearm: -48, thigh: 8 }),
      front({ upperArm: 38, forearm: -48, thigh: 2 }, { upperArm: 38, forearm: -48, thigh: 14 }, { torso: 8 }),
    ],
    props: [{ type: 'circle', at: 'pelvis', r: 26 }],
  },
  'cat-cow': {
    anchor: 'far.hand',
    labels: ['Espalda redonda (gato)', 'Pecho al frente (vaca)'],
    frames: [
      side(QUAD_TORSO, { ...QUAD_ARM, ...QUAD_LEG }, { ...QUAD_ARM, ...QUAD_LEG }, { spine: 11, head: 25 }),
      side(QUAD_TORSO, { ...QUAD_ARM, ...QUAD_LEG }, { ...QUAD_ARM, ...QUAD_LEG }, { spine: -8, head: 125 }),
    ],
    props: [{ type: 'mat' }],
  },
  'hamstring-stretch': {
    anchor: 'far.ankle',
    labels: ['Talón al frente', 'Inclínate desde la cadera'],
    frames: [
      side(4, { thigh: 26, shin: 26, foot: 150 }, { thigh: 14, shin: -24, upperArm: 0 }),
      side(46, { thigh: 26, shin: 26, foot: 150, upperArm: 30, forearm: 30 }, { thigh: 14, shin: -24, upperArm: 34, forearm: 34 }),
    ],
    props: [],
  },
  'chest-opener': {
    anchor: 'near.ankle',
    labels: ['Brazos relajados', 'Abre el pecho'],
    frames: [side(0, { upperArm: 8 }, { upperArm: -4 }), side(-6, { upperArm: -42, forearm: -50 }, { upperArm: -46, forearm: -54 }, { head: 160 })],
    props: [],
  },

  // ——— Calentamiento ———
  'leg-swings': {
    anchor: 'far.ankle',
    labels: ['Pierna al frente', 'Pierna atrás'],
    frames: [
      side(0, { upperArm: 70, forearm: 82, thigh: 48, shin: 30, foot: 110 }, { upperArm: 66, forearm: 80 }),
      side(6, { upperArm: 70, forearm: 82, thigh: -30, shin: -40, foot: 40 }, { upperArm: 66, forearm: 80 }),
    ],
    props: [{ type: 'chair', at: 'far.hand' }],
  },
  'hip-hinge': {
    anchor: 'near.ankle',
    labels: ['De pie', 'Cadera atrás, espalda recta'],
    frames: [
      side(0, { upperArm: -18, forearm: 40 }, { upperArm: -22, forearm: 36 }),
      side(55, { upperArm: 30, forearm: 100, thigh: 14, shin: -8 }, { upperArm: 26, forearm: 96, thigh: 14, shin: -8 }),
    ],
    props: [],
  },
  'arm-circles': {
    anchor: 'pelvis',
    labels: ['Brazos a los lados', 'Círculos pequeños'],
    frames: [front({ upperArm: 90, forearm: 90 }, { upperArm: 90, forearm: 90 }), front({ upperArm: 105, forearm: 105 }, { upperArm: 105, forearm: 105 })],
    props: [
      { type: 'circle', at: 'near.hand', r: 10 },
      { type: 'circle', at: 'far.hand', r: 10 },
    ],
  },
  'torso-twists': {
    anchor: 'pelvis',
    labels: ['Gira a un lado', 'Gira al otro lado'],
    frames: [
      front({ upperArm: 90, forearm: 90 }, { upperArm: 40, forearm: -110 }),
      front({ upperArm: 40, forearm: -110 }, { upperArm: 90, forearm: 90 }),
    ],
    props: [],
  },
  'bodyweight-squat': {
    anchor: 'near.ankle',
    labels: ['De pie', 'Media sentadilla'],
    frames: [
      side(0, { upperArm: 4 }, { upperArm: -4 }),
      side(22, { upperArm: 80, forearm: 84, thigh: 52, shin: -14 }, { upperArm: 76, forearm: 82, thigh: 52, shin: -14 }),
    ],
    props: [],
  },
}
