import type { LucideIcon } from 'lucide-react'
import { cn, TONE_STYLES } from '../../lib/tones'
import type { Tone } from '../../types'

interface IconBubbleProps {
  icon: LucideIcon
  tone: Tone
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: { box: 'size-9', icon: 18 },
  md: { box: 'size-12', icon: 22 },
  lg: { box: 'size-16', icon: 30 },
}

/** Ícono decorativo dentro de un círculo de color. */
export function IconBubble({ icon: Icon, tone, size = 'md', className }: IconBubbleProps) {
  const { box, icon } = SIZES[size]
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full', box, TONE_STYLES[tone].bubble, className)}
    >
      <Icon size={icon} strokeWidth={2.2} className={TONE_STYLES[tone].icon} />
    </span>
  )
}
