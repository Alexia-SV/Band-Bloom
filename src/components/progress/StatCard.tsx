import type { EmojiName } from '../../data/emoji'
import type { Tone } from '../../types'
import { Card } from '../ui/Card'
import { IconBubble } from '../ui/IconBubble'

interface StatCardProps {
  emoji: EmojiName
  tone: Tone
  value: string
  label: string
}

/** Ícono y número arriba, etiqueta abajo a todo lo ancho para que no se parta en tarjetas angostas. */
export function StatCard({ emoji, tone, value, label }: StatCardProps) {
  return (
    <Card className="p-4">
      <p className="flex items-center gap-3">
        <IconBubble emoji={emoji} tone={tone} size="sm" />
        <span className="text-2xl font-bold leading-tight tracking-tight">{value}</span>
      </p>
      <p className="mt-2 text-sm leading-snug text-ink-500">{label}</p>
    </Card>
  )
}
