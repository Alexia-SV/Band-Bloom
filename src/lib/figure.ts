/**
 * Motor de las ilustraciones de ejercicios.
 *
 * Cada postura se describe con ángulos (no con coordenadas) y la figura se calcula
 * con cinemática directa: así todas las ilustraciones tienen las mismas proporciones.
 *
 * Ángulos de extremidades (grados, absolutos):
 *   0 = hacia abajo · 90 = hacia el frente · 180 = hacia arriba · -90 = hacia atrás.
 * En vista frontal, "frente" significa "hacia afuera" (alejándose del centro del cuerpo).
 * Ángulo del torso: 0 = vertical · 90 = horizontal con la cabeza al frente · -90 = cabeza atrás.
 */

export interface Point {
  x: number
  y: number
}

export interface LimbAngles {
  /** Brazo: hombro → codo */
  upperArm: number
  /** Antebrazo: codo → mano */
  forearm: number
  /** Muslo: cadera → rodilla */
  thigh: number
  /** Espinilla: rodilla → tobillo */
  shin: number
  /** Pie: tobillo → punta (90 = plano hacia el frente) */
  foot: number
}

export interface PoseSpec {
  view: 'side' | 'front'
  torso: number
  /** Curvatura de la espalda en px (+ = arqueada hacia arriba, como en "gato"). */
  spine?: number
  /** Dirección de la cabeza desde el cuello, si no sigue al torso (mismo sistema que extremidades). */
  head?: number
  near: LimbAngles
  far: LimbAngles
}

export interface SideJoints {
  shoulder: Point
  elbow: Point
  hand: Point
  hip: Point
  knee: Point
  ankle: Point
  toe: Point
}

export interface Joints {
  head: Point
  neck: Point
  pelvis: Point
  /** Punto de control de la curva de la espalda. */
  spineControl: Point
  near: SideJoints
  far: SideJoints
}

export const LENGTHS = {
  torso: 52,
  neckToHead: 17,
  headRadius: 11,
  upperArm: 30,
  forearm: 27,
  thigh: 42,
  shin: 40,
  foot: 14,
  /** Separación de hombros y caderas en vista frontal. */
  shoulderOffset: 17,
  hipOffset: 10,
}

const rad = (deg: number) => (deg * Math.PI) / 180

/** Punto a cierta distancia en la dirección de un ángulo de extremidad. */
function step(from: Point, angle: number, length: number, mirror = 1): Point {
  return { x: from.x + mirror * length * Math.sin(rad(angle)), y: from.y + length * Math.cos(rad(angle)) }
}

function side(shoulder: Point, hip: Point, a: LimbAngles, mirror: number, front: boolean): SideJoints {
  const elbow = step(shoulder, a.upperArm, LENGTHS.upperArm, mirror)
  const hand = step(elbow, a.forearm, LENGTHS.forearm, mirror)
  const knee = step(hip, a.thigh, LENGTHS.thigh, mirror)
  const ankle = step(knee, a.shin, LENGTHS.shin, mirror)
  // De frente, el pie se ve como un trazo corto hacia afuera.
  const toe = front ? { x: ankle.x + mirror * 7, y: ankle.y + 2 } : step(ankle, a.foot, LENGTHS.foot, mirror)
  return { shoulder, elbow, hand, hip, knee, ankle, toe }
}

/** Calcula las articulaciones con la pelvis en (0, 0). */
export function computeJoints(pose: PoseSpec): Joints {
  const pelvis = { x: 0, y: 0 }
  const t = rad(pose.torso)
  const front = pose.view === 'front'
  const neck = { x: LENGTHS.torso * Math.sin(t), y: -LENGTHS.torso * Math.cos(t) }

  const headDirection = pose.head ?? 180 - pose.torso // por defecto sigue la línea del torso
  const head = step(neck, headDirection, LENGTHS.neckToHead)

  // Curva de la espalda: punto medio desplazado de forma perpendicular al torso.
  const vx = neck.x - pelvis.x
  const vy = neck.y - pelvis.y
  const length = Math.hypot(vx, vy) || 1
  const curve = pose.spine ?? 0
  const spineControl = { x: vx / 2 + (vy / length) * curve, y: vy / 2 + (-vx / length) * curve }

  if (front) {
    // Hombros un poco abajo del cuello; caderas a los lados de la pelvis.
    const shoulderY = neck.y + 4
    const near = side({ x: neck.x + LENGTHS.shoulderOffset, y: shoulderY }, { x: LENGTHS.hipOffset, y: 0 }, pose.near, 1, true)
    const far = side({ x: neck.x - LENGTHS.shoulderOffset, y: shoulderY }, { x: -LENGTHS.hipOffset, y: 0 }, pose.far, -1, true)
    return { head, neck, pelvis, spineControl, near, far }
  }

  // De lado, el hombro está un poco abajo del cuello sobre la línea del torso.
  const shoulder = { x: neck.x - 5 * Math.sin(t), y: neck.y + 5 * Math.cos(t) }
  return {
    head,
    neck,
    pelvis,
    spineControl,
    near: side(shoulder, pelvis, pose.near, 1, false),
    far: side(shoulder, pelvis, pose.far, 1, false),
  }
}

/** Todos los puntos de la figura con el "grosor" que ocupan (para calcular el piso y el encuadre). */
export function figurePoints(j: Joints): Array<{ p: Point; r: number }> {
  const limbs = (s: SideJoints) => [
    { p: s.shoulder, r: 6 },
    { p: s.elbow, r: 6 },
    { p: s.hand, r: 5 },
    { p: s.hip, r: 6 },
    { p: s.knee, r: 6 },
    { p: s.ankle, r: 5 },
    { p: s.toe, r: 4 },
  ]
  return [
    { p: j.head, r: LENGTHS.headRadius },
    { p: j.neck, r: 9 },
    { p: j.pelvis, r: 9 },
    ...limbs(j.near),
    ...limbs(j.far),
  ]
}

export function translateJoints(j: Joints, dx: number, dy: number): Joints {
  const t = (p: Point) => ({ x: p.x + dx, y: p.y + dy })
  const ts = (s: SideJoints): SideJoints => ({
    shoulder: t(s.shoulder),
    elbow: t(s.elbow),
    hand: t(s.hand),
    hip: t(s.hip),
    knee: t(s.knee),
    ankle: t(s.ankle),
    toe: t(s.toe),
  })
  return {
    head: t(j.head),
    neck: t(j.neck),
    pelvis: t(j.pelvis),
    spineControl: t(j.spineControl),
    near: ts(j.near),
    far: ts(j.far),
  }
}

export type JointPath = 'pelvis' | 'neck' | `${'near' | 'far'}.${keyof SideJoints}`

export function jointAt(j: Joints, path: JointPath): Point {
  if (path === 'pelvis' || path === 'neck') return j[path]
  const [sideName, joint] = path.split('.') as ['near' | 'far', keyof SideJoints]
  return j[sideName][joint]
}

export function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}
