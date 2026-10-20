import { ChevronRight } from 'lucide-react'
import type { EmojiName } from '../../data/emoji'
import type { Tone } from '../../types'
import { IconBubble } from './IconBubble'

interface ListRowProps {
  href: string
  emoji: EmojiName
  tone: Tone
  title: string
  subtitle?: string
}

/** Fila de menú como las de la pantalla "Más" del mockup. */
export function ListRow({ href, emoji, tone, title, subtitle }: ListRowProps) {
  return (
    <a
      href={href}
      className="flex min-h-18 items-center gap-4 rounded-card bg-white/85 px-4 py-3 shadow-soft ring-1 ring-ink-200/60 transition hover:bg-white"
    >
      <IconBubble emoji={emoji} tone={tone} />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}</span>
        {subtitle && <span className="block truncate text-sm text-ink-500">{subtitle}</span>}
      </span>
      <ChevronRight size={20} className="shrink-0 text-ink-400" aria-hidden="true" />
    </a>
  )
}
