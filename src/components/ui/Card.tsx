import type { ReactNode } from 'react'
import { cn, TONE_STYLES } from '../../lib/tones'
import type { Tone } from '../../types'

interface CardProps {
  tone?: Tone | 'white'
  className?: string
  children: ReactNode
  as?: 'div' | 'section' | 'article' | 'figure'
  'aria-labelledby'?: string
}

export function Card({ tone = 'white', className, children, as: Tag = 'div', ...rest }: CardProps) {
  const toneClass = tone === 'white' ? 'bg-white/85 ring-ink-200/60' : TONE_STYLES[tone].card
  return (
    <Tag className={cn('rounded-card shadow-soft ring-1', toneClass, className)} {...rest}>
      {children}
    </Tag>
  )
}
