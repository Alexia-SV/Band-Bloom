import { ILLUSTRATIONS, type Illustration, type IllustrationProp } from '../../data/illustrations'
import {
  computeJoints,
  figurePoints,
  jointAt,
  lerp,
  translateJoints,
  type Joints,
  type Point,
  type SideJoints,
} from '../../lib/figure'

// Paleta de las ilustraciones (los mismos valores que los tokens de diseño).
const COLORS = {
  near: '#7563d9', // bloom-600
  /** Brazo cercano en vista lateral: un tono más oscuro para distinguirlo del torso. */
  nearArm: '#5240b0',
  far: '#b8aaf3', // entre bloom-300 y bloom-400
  head: '#7563d9',
  band: '#f38aa7', // liga rosa
  prop: '#d9d4e8',
  propDark: '#b9b2cf',
  mat: '#c8dfc9', // sage-200
  arrow: '#e96b90', // rose-500
  floor: '#d9d4e8',
}

const VIEW_W = 220
const VIEW_H = 190
const FLOOR_Y = 176

interface Layout {
  frames: Joints[]
  /** Transformación común a las dos posturas para que no "salten" al alternar. */
  transform: string
  scale: number
  bounds: { minX: number; maxX: number; minY: number }
}

function propExtents(prop: IllustrationProp, j: Joints): Point[] {
  if (prop.type === 'wall') {
    const at = jointAt(j, prop.at)
    return [{ x: at.x + 16, y: at.y }]
  }
  if (prop.type === 'chair') {
    const at = jointAt(j, prop.at)
    return [{ x: at.x + 36, y: 0 }]
  }
  if (prop.type === 'circle') {
    const at = jointAt(j, prop.at)
    return [
      { x: at.x - prop.r - 4, y: at.y - prop.r - 4 },
      { x: at.x + prop.r + 4, y: at.y + prop.r + 4 },
    ]
  }
  return []
}

/** Calcula las dos posturas, las apoya en el piso y encuadra ambas con la misma escala. */
function layoutIllustration(illustration: Illustration): Layout {
  const frames = illustration.frames.map((pose) => {
    let joints = computeJoints(pose)
    const anchor = jointAt(joints, illustration.anchor)
    joints = translateJoints(joints, -anchor.x, 0)
    // Apoyar en el piso: el punto más bajo (con su grosor) toca y = 0.
    const lowest = Math.max(...figurePoints(joints).map(({ p, r }) => p.y + r))
    return translateJoints(joints, 0, -lowest)
  })

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  for (const joints of frames) {
    const points = [
      ...figurePoints(joints).flatMap(({ p, r }) => [
        { x: p.x - r, y: p.y - r },
        { x: p.x + r, y: p.y + r },
      ]),
      ...illustration.props.flatMap((prop) => propExtents(prop, joints)),
    ]
    for (const p of points) {
      minX = Math.min(minX, p.x)
      maxX = Math.max(maxX, p.x)
      minY = Math.min(minY, p.y)
    }
  }
  const width = maxX - minX
  const height = -minY
  const scale = Math.min(1.15, (VIEW_W - 24) / width, (FLOOR_Y - 10) / height)
  const centerX = (minX + maxX) / 2
  const transform = `translate(${VIEW_W / 2 - centerX * scale} ${FLOOR_Y}) scale(${scale})`
  return { frames, transform, scale, bounds: { minX, maxX, minY } }
}

function Limbs({ s, color }: { s: SideJoints; color: string }) {
  const line = (a: Point, b: Point, width: number) => (
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={width} strokeLinecap="round" />
  )
  return (
    <>
      {line(s.hip, s.knee, 12)}
      {line(s.knee, s.ankle, 10)}
      {line(s.ankle, s.toe, 7)}
    </>
  )
}

function Arm({ s, color }: { s: SideJoints; color: string }) {
  return (
    <polyline
      points={`${s.shoulder.x},${s.shoulder.y} ${s.elbow.x},${s.elbow.y} ${s.hand.x},${s.hand.y}`}
      fill="none"
      stroke={color}
      strokeWidth={9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

function Body({ j, front }: { j: Joints; front: boolean }) {
  const farColor = front ? COLORS.near : COLORS.far
  return (
    <>
      <Arm s={j.far} color={farColor} />
      <Limbs s={j.far} color={farColor} />
      <path
        d={`M ${j.pelvis.x} ${j.pelvis.y} Q ${j.spineControl.x} ${j.spineControl.y} ${j.neck.x} ${j.neck.y}`}
        fill="none"
        stroke={COLORS.near}
        strokeWidth={front ? 22 : 18}
        strokeLinecap="round"
      />
      <circle cx={j.head.x} cy={j.head.y} r={11} fill={COLORS.head} />
      <Limbs s={j.near} color={COLORS.near} />
    </>
  )
}

function BackgroundProps({ props, j, bounds }: { props: IllustrationProp[]; j: Joints; bounds: Layout['bounds'] }) {
  return (
    <>
      {props.map((prop, index) => {
        if (prop.type === 'wall') {
          const at = jointAt(j, prop.at)
          return <rect key={index} x={at.x + 5} y={bounds.minY - 40} width={11} height={-bounds.minY + 40} rx={2} fill={COLORS.prop} />
        }
        if (prop.type === 'chair') {
          const at = jointAt(j, prop.at)
          const x = at.x + 4
          const seatY = Math.min(-44, at.y + 30)
          return (
            <g key={index} stroke={COLORS.propDark} strokeWidth={5} strokeLinecap="round" fill="none">
              <line x1={x} y1={at.y - 2} x2={x} y2={0} />
              <line x1={x} y1={seatY} x2={x + 30} y2={seatY} />
              <line x1={x + 30} y1={seatY} x2={x + 30} y2={0} />
            </g>
          )
        }
        if (prop.type === 'mat') {
          return <rect key={index} x={bounds.minX - 6} y={-3} width={bounds.maxX - bounds.minX + 12} height={6} rx={3} fill={COLORS.mat} />
        }
        return null
      })}
    </>
  )
}

function ForegroundProps({ props, j, front }: { props: IllustrationProp[]; j: Joints; front: boolean }) {
  return (
    <>
      {props.map((prop, index) => {
        if (prop.type === 'band-knees') {
          const near = lerp(j.near.hip, j.near.knee, 0.82)
          const far = lerp(j.far.hip, j.far.knee, 0.82)
          if (front) {
            return (
              <line key={index} x1={near.x + 5} y1={near.y} x2={far.x - 5} y2={far.y} stroke={COLORS.band} strokeWidth={5} strokeLinecap="round" />
            )
          }
          const angle = (Math.atan2(j.near.knee.y - j.near.hip.y, j.near.knee.x - j.near.hip.x) * 180) / Math.PI
          return (
            <ellipse
              key={index}
              cx={near.x}
              cy={near.y}
              rx={4}
              ry={9}
              transform={`rotate(${angle} ${near.x} ${near.y})`}
              fill="none"
              stroke={COLORS.band}
              strokeWidth={4}
            />
          )
        }
        if (prop.type === 'band-feet-hands') {
          const foot = (s: SideJoints) => lerp(s.ankle, s.toe, 0.4)
          return (
            <g key={index} stroke={COLORS.band} strokeWidth={3.5} strokeLinecap="round">
              <line x1={foot(j.near).x} y1={foot(j.near).y} x2={j.near.hand.x} y2={j.near.hand.y} />
              {front && <line x1={foot(j.far).x} y1={foot(j.far).y} x2={j.far.hand.x} y2={j.far.hand.y} />}
            </g>
          )
        }
        if (prop.type === 'band-hands') {
          return (
            <line
              key={index}
              x1={j.near.hand.x}
              y1={j.near.hand.y}
              x2={j.far.hand.x}
              y2={j.far.hand.y}
              stroke={COLORS.band}
              strokeWidth={5}
              strokeLinecap="round"
            />
          )
        }
        if (prop.type === 'circle') {
          const c = jointAt(j, prop.at)
          const r = prop.r
          // Arco de 300° con punta de flecha.
          const start = { x: c.x + r * Math.cos(-0.5), y: c.y + r * Math.sin(-0.5) }
          const end = { x: c.x + r * Math.cos(-1.4), y: c.y + r * Math.sin(-1.4) }
          return (
            <g key={index} fill="none" stroke={COLORS.arrow} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d={`M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`} strokeDasharray="5 4" />
              <path d={`M ${end.x - 5} ${end.y - 3} L ${end.x} ${end.y} L ${end.x - 2} ${end.y + 6}`} />
            </g>
          )
        }
        return null
      })}
    </>
  )
}

interface ExerciseFigureProps {
  exerciseId: string
  /** Postura a mostrar (0 = inicio, 1 = movimiento). Si es 'both', se superponen con transición (ver `active`). */
  frame: 0 | 1
  className?: string
  /** Texto alternativo; si no se indica, la imagen es decorativa. */
  label?: string
  /** Muestra la otra postura con transición suave (para la animación). */
  crossfade?: boolean
}

/** Dibujo de la postura de un ejercicio. Si no hay ilustración, muestra un respaldo neutro. */
export function ExerciseFigure({ exerciseId, frame, className, label, crossfade = false }: ExerciseFigureProps) {
  const illustration = ILLUSTRATIONS[exerciseId]
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const }

  if (!illustration) {
    return (
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className={className} {...a11y}>
        <line x1={20} y1={FLOOR_Y} x2={VIEW_W - 20} y2={FLOOR_Y} stroke={COLORS.floor} strokeWidth={2} />
        <circle cx={110} cy={70} r={14} fill={COLORS.far} />
        <line x1={110} y1={86} x2={110} y2={140} stroke={COLORS.far} strokeWidth={16} strokeLinecap="round" />
      </svg>
    )
  }

  const layout = layoutIllustration(illustration)
  const front = illustration.frames[0].view === 'front'

  const renderFrame = (index: 0 | 1) => {
    const j = layout.frames[index]
    return (
      <g
        key={index}
        style={crossfade ? { opacity: frame === index ? 1 : 0, transition: 'opacity 450ms ease' } : undefined}
      >
        <BackgroundProps props={illustration.props} j={j} bounds={layout.bounds} />
        <Body j={j} front={front} />
        <ForegroundProps props={illustration.props} j={j} front={front} />
        {/* El brazo cercano va al final para quedar delante de la liga y del torso. */}
        <Arm s={j.near} color={front ? COLORS.near : COLORS.nearArm} />
      </g>
    )
  }

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className={className} {...a11y}>
      <line x1={14} y1={FLOOR_Y} x2={VIEW_W - 14} y2={FLOOR_Y} stroke={COLORS.floor} strokeWidth={2} strokeLinecap="round" />
      <g transform={layout.transform}>{crossfade ? [renderFrame(0), renderFrame(1)] : renderFrame(frame)}</g>
    </svg>
  )
}
