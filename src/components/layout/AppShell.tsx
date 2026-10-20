import { TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Route } from '../../lib/router'
import { useAppData } from '../../state/useAppData'
import { NavBar } from './NavBar'

function StorageNotice() {
  const { loadProblem, saveFailed } = useAppData()
  let message: string | null = null
  if (loadProblem === 'corrupted') {
    message = 'No pudimos leer tus datos guardados, así que empezamos de nuevo. Guardamos una copia de respaldo en este dispositivo.'
  } else if (loadProblem === 'unavailable' || saveFailed) {
    message = 'Este navegador no está permitiendo guardar datos (¿modo privado?). Puedes usar la app, pero tu progreso no se conservará al cerrarla.'
  }
  if (!message) return null

  return (
    <div role="alert" className="mb-4 flex gap-3 rounded-2xl bg-peach-100 p-4 text-sm text-ink-900 ring-1 ring-peach-200">
      <TriangleAlert size={20} className="mt-0.5 shrink-0 text-peach-700" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}

export function AppShell({ route, children }: { route: Route; children: ReactNode }) {
  return (
    <div className="min-h-dvh md:pl-24">
      {/* Botón y no enlace: un href="#…" chocaría con el router basado en hash. */}
      <button
        type="button"
        onClick={() => document.getElementById('contenido')?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-30 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow-soft"
      >
        Saltar al contenido
      </button>
      <main
        id="contenido"
        tabIndex={-1}
        className="mx-auto w-full max-w-md px-4 outline-none pb-[calc(6rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))] md:max-w-2xl md:px-8 md:pb-12 md:pt-10"
      >
        <StorageNotice />
        {children}
      </main>
      <NavBar route={route} />
    </div>
  )
}
