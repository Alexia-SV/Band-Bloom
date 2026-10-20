import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Tone } from '../../types'
import { Card } from './Card'
import { IconBubble } from './IconBubble'

interface EmptyStateProps {
  icon: LucideIcon
  tone?: Tone
  title: string
  children?: ReactNode
}

export function EmptyState({ icon, tone = 'lavender', title, children }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center px-6 py-8 text-center">
      <IconBubble icon={icon} tone={tone} size="lg" />
      <p className="mt-4 font-bold">{title}</p>
      {children && <div className="mt-1 max-w-xs text-sm text-ink-500">{children}</div>}
    </Card>
  )
}
