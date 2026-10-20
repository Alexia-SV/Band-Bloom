import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { goBack, type Route } from '../../lib/router'

interface ScreenHeaderProps {
  title: string
  subtitle?: string
  /** Si se indica, muestra el botón de regresar (va aquí si no hay pantalla previa). */
  backTo?: Route
  /** Botón o enlace opcional a la derecha (por ejemplo, favoritos o ajustes). */
  action?: ReactNode
}

export function ScreenHeader({ title, subtitle, backTo, action }: ScreenHeaderProps) {
  const titleBlock = (
    <div className="min-w-0">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-ink-500">{subtitle}</p>}
    </div>
  )

  // Sin botón de regresar, la acción va a la derecha del título (como el engrane de "Más" en el mockup).
  if (!backTo) {
    return (
      <header className="flex items-start justify-between gap-3">
        {titleBlock}
        {action}
      </header>
    )
  }

  return (
    <header className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => goBack(backTo)}
          aria-label="Regresar"
          className="inline-flex size-11 items-center justify-center rounded-full bg-white/85 shadow-soft ring-1 ring-ink-200/60 transition hover:bg-white"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        {action}
      </div>
      {titleBlock}
    </header>
  )
}
