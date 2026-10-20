import { Heart } from 'lucide-react'
import { getRoutine, routineTitle } from '../../data/routines'
import { cn } from '../../lib/tones'
import { useAppData } from '../../state/useAppData'
import type { RoutineId } from '../../types'

export function FavoriteButton({ routineId, className }: { routineId: RoutineId; className?: string }) {
  const { data, toggleFavorite } = useAppData()
  const isFavorite = data.preferences.favoriteRoutineIds.includes(routineId)
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(routineId)}
      aria-pressed={isFavorite}
      aria-label={`Favorita: ${routineTitle(getRoutine(routineId))}`}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-full bg-white/85 shadow-soft ring-1 ring-ink-200/60 transition hover:bg-white',
        className,
      )}
    >
      <Heart
        size={20}
        aria-hidden="true"
        className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-ink-400'}
      />
    </button>
  )
}
