import type { EmojiName } from '../data/emoji'
import type { RoutineKind } from '../types'

/** Emoji 3D que identifica cada tipo de rutina. */
export const ROUTINE_EMOJI: Record<RoutineKind, EmojiName> = {
  strength: 'flexed-biceps',
  short: 'stopwatch',
  mobility: 'person-in-lotus-position',
}
