import type { LucideIcon } from 'lucide-react'
import type { EmojiName } from '../../data/emoji'
import { cn, TONE_STYLES } from '../../lib/tones'
import type { Tone } from '../../types'
import { Emoji } from './Emoji'

type IconBubbleProps = {
  tone: Tone
  size?: 'sm' | 'md' | 'lg'
  className?: string
} & ({ emoji: EmojiName; icon?: never } | { icon: LucideIcon; emoji?: never })

const SIZES = {
  sm: { box: 'size-9', icon: 18, emoji: 24 },
  md: { box: 'size-12', icon: 22, emoji: 30 },
  lg: { box: 'size-16', icon: 30, emoji: 40 },
}

/** Ícono decorativo (emoji 3D o ícono de línea) dentro de un círculo de color. */
export function IconBubble({ icon: Icon, emoji, tone, size = 'md', className }: IconBubbleProps) {
  const dims = SIZES[size]
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full', dims.box, TONE_STYLES[tone].bubble, className)}
    >
      {emoji ? (
        <Emoji name={emoji} size={dims.emoji} />
      ) : (
        Icon && <Icon size={dims.icon} strokeWidth={2.2} className={TONE_STYLES[tone].icon} />
      )}
    </span>
  )
}
