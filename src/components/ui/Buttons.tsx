import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/tones'

const PRIMARY =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-bloom-600 px-6 text-base font-semibold text-white shadow-lift transition hover:bg-bloom-700 active:scale-[0.98]'

const SECONDARY =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-ink-700 transition hover:bg-white/70 active:scale-[0.98]'

interface LinkButtonProps {
  href: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary'
}

/** Navegación con apariencia de botón: es un <a> real, así funciona con teclado y lectores de pantalla. */
export function LinkButton({ href, icon: Icon, children, className, variant = 'primary' }: LinkButtonProps) {
  return (
    <a href={href} className={cn(variant === 'primary' ? PRIMARY : SECONDARY, className)}>
      {Icon && <Icon size={variant === 'primary' ? 20 : 18} aria-hidden="true" fill={variant === 'primary' ? 'currentColor' : 'none'} />}
      {children}
    </a>
  )
}

interface ActionButtonProps {
  onClick: () => void
  icon?: LucideIcon
  children: ReactNode
  className?: string
}

export function SecondaryButton({ onClick, icon: Icon, children, className }: ActionButtonProps) {
  return (
    <button type="button" onClick={onClick} className={cn(SECONDARY, className)}>
      {Icon && <Icon size={18} aria-hidden="true" />}
      {children}
    </button>
  )
}
