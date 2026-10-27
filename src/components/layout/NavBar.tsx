import { ChartColumn, ClipboardList, House, Menu, type LucideIcon } from 'lucide-react'
import { routeHref, type Route } from '../../lib/router'
import { cn } from '../../lib/tones'

type TabName = 'home' | 'routines' | 'progress' | 'more'

const TABS: Array<{ name: TabName; label: string; icon: LucideIcon }> = [
  { name: 'home', label: 'Inicio', icon: House },
  { name: 'routines', label: 'Rutinas', icon: ClipboardList },
  { name: 'progress', label: 'Progreso', icon: ChartColumn },
  { name: 'more', label: 'Más', icon: Menu },
]

/** A qué pestaña pertenece cada ruta (el detalle de rutina vive dentro de "Rutinas"). */
function activeTab(route: Route): TabName {
  if (route.name === 'routine' || route.name === 'exercise' || route.name === 'workout') return 'routines'
  if (route.name === 'more-section') return 'more'
  return route.name
}

export function NavBar({ route }: { route: Route }) {
  const current = activeTab(route)
  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        // Móvil: barra inferior fija, respetando el área segura del iPhone.
        'fixed inset-x-0 bottom-0 z-20 border-t border-ink-200/70 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md',
        // Escritorio/tablet: riel lateral.
        'md:inset-y-0 md:right-auto md:w-24 md:border-t-0 md:border-r md:pb-0 md:pt-8',
      )}
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 md:max-w-none md:grid-cols-1 md:gap-2">
        {TABS.map(({ name, label, icon: Icon }) => {
          const isActive = current === name
          return (
            <li key={name}>
              <a
                href={routeHref({ name } as Route)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors',
                  isActive ? 'text-bloom-600' : 'text-ink-500 hover:text-ink-700',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-12 items-center justify-center rounded-full transition-colors',
                    isActive && 'bg-bloom-100',
                  )}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
                </span>
                {label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
