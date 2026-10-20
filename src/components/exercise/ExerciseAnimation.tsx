import { Pause, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ILLUSTRATIONS } from '../../data/illustrations'
import { cn, TONE_STYLES } from '../../lib/tones'
import { usePrefersReducedMotion } from '../../state/usePrefersReducedMotion'
import type { Tone } from '../../types'
import { ExerciseFigure } from './ExerciseFigure'

const FRAME_MS = 1600

interface ExerciseAnimationProps {
  exerciseId: string
  name: string
  tone: Tone
}

/**
 * Imagen de referencia grande: alterna entre la postura inicial y el movimiento.
 * Con "reducir movimiento" activado empieza en pausa; siempre se puede elegir la postura a mano.
 */
export function ExerciseAnimation({ exerciseId, name, tone }: ExerciseAnimationProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [playing, setPlaying] = useState(!reducedMotion)
  const [frame, setFrame] = useState<0 | 1>(0)
  const labels = ILLUSTRATIONS[exerciseId]?.labels ?? ['Inicio', 'Movimiento']

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => setFrame((current) => (current === 0 ? 1 : 0)), FRAME_MS)
    return () => window.clearInterval(timer)
  }, [playing])

  return (
    <figure className={cn('overflow-hidden rounded-card ring-1', TONE_STYLES[tone].card)}>
      <div className="relative">
        <ExerciseFigure
          exerciseId={exerciseId}
          frame={frame}
          crossfade
          label={`Ilustración de ${name}: ${labels[0].toLowerCase()} y ${labels[1].toLowerCase()}`}
          className="mx-auto block aspect-[22/19] w-full max-w-md"
        />
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          aria-pressed={playing}
          aria-label={playing ? 'Pausar animación' : 'Reproducir animación'}
          className="absolute bottom-3 left-3 inline-flex size-11 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-soft transition hover:bg-white"
        >
          {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} className="fill-current" aria-hidden="true" />}
        </button>
      </div>
      <figcaption className="grid grid-cols-2 gap-1 border-t border-ink-900/5 bg-white/60 p-1.5" aria-label="Elegir postura">
        {labels.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-pressed={frame === index}
            onClick={() => {
              setPlaying(false)
              setFrame(index as 0 | 1)
            }}
            className={cn(
              'min-h-10 rounded-full px-2 text-sm font-semibold transition-colors',
              frame === index ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-700',
            )}
          >
            {index + 1}. {label}
          </button>
        ))}
      </figcaption>
    </figure>
  )
}
