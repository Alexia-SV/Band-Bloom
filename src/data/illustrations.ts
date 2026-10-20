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
  | { type: 'chair'; at: JointPath }
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
