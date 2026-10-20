import { EMOJI, type EmojiName } from '../../data/emoji'
import { cn } from '../../lib/tones'

interface EmojiProps {
  name: EmojiName
  /** Tamaño en px (ancho y alto). */
  size: number
  className?: string
  /** Texto alternativo. Si no se indica, el emoji es decorativo. */
  label?: string
}

/** Emoji 3D (imagen local). */
export function Emoji({ name, size, className, label }: EmojiProps) {
  return (
    <img
      src={EMOJI[name]}
      width={size}
      height={size}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      decoding="async"
      draggable={false}
      className={cn('inline-block shrink-0 select-none object-contain', className)}
    />
  )
}
