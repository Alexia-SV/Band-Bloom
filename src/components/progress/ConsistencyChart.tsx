import { useState } from 'react'
import { parseISODate } from '../../lib/dates'
import { cn } from '../../lib/tones'
import type { ISODate } from '../../types'
import { Card } from '../ui/Card'

interface ConsistencyChartProps {
  weeks: Array<{ weekStart: ISODate; count: number }>
  goal: number
}

const CHART_HEIGHT = 112 // px del área de barras

function shortDate(iso: ISODate): string {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(parseISODate(iso)).replace('.', '')
}

function sessionsLabel(count: number): string {
  return count === 1 ? '1 sesión' : `${count} sesiones`
}

/**
 * Columnas de sesiones de fuerza por semana. Una sola serie: el título la nombra (sin leyenda).
 * Línea de meta como referencia, tooltip al pasar el cursor o enfocar, y tabla equivalente para lectores de pantalla.
 */
export function ConsistencyChart({ weeks, goal }: ConsistencyChartProps) {
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(goal, ...weeks.map((week) => week.count), 1)
  const goalY = (goal / max) * CHART_HEIGHT

  return (
    <Card as="section" className="p-5" aria-labelledby="consistency-title">
      <h2 id="consistency-title" className="font-bold">
        Mi constancia
      </h2>
      <p className="text-sm text-ink-500">Sesiones de fuerza por semana · últimas {weeks.length} semanas</p>

      <div className="relative mt-5" aria-hidden="true">
        {/* Línea base y línea de meta: grises, finas y sólidas para no competir con los datos. */}
        <div className="relative" style={{ height: CHART_HEIGHT }}>
          <div className="absolute inset-x-0 bottom-0 h-px bg-ink-200" />
          <div className="absolute inset-x-0 h-px bg-ink-200" style={{ bottom: goalY }} />
          <span className="absolute right-0 -translate-y-full pb-0.5 text-[11px] font-medium text-ink-500" style={{ bottom: goalY }}>
            Meta {goal}
          </span>

          <div className="absolute inset-0 grid grid-flow-col auto-cols-fr items-end gap-0.5">
            {weeks.map((week, index) => {
              const height = week.count > 0 ? Math.max(6, (week.count / max) * CHART_HEIGHT) : 0
              const isCurrent = index === weeks.length - 1
              return (
                <div
                  key={week.weekStart}
                  className="relative flex h-full items-end justify-center"
                  onPointerEnter={() => setActive(index)}
                  onPointerLeave={() => setActive((current) => (current === index ? null : current))}
                >
                  <div
                    className={cn(
                      'w-full max-w-6 rounded-t-[4px] transition-colors',
                      isCurrent ? 'bg-bloom-600' : 'bg-bloom-400',
                      active === index && 'bg-bloom-700',
                    )}
                    style={{ height }}
                  />
                  {active === index && (
                    <div className="pointer-events-none absolute bottom-full z-10 mb-1 whitespace-nowrap rounded-xl bg-ink-900 px-2.5 py-1.5 text-xs text-white shadow-soft">
                      <span className="block text-white/70">Semana del {shortDate(week.weekStart)}</span>
                      <span className="font-semibold">{sessionsLabel(week.count)}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-2 grid grid-flow-col auto-cols-fr gap-0.5 text-center text-[11px] text-ink-500">
          {weeks.map((week, index) => (
            <span key={week.weekStart} className={cn(index === weeks.length - 1 && 'font-semibold text-ink-700')}>
              {index === weeks.length - 1 ? 'Esta' : shortDate(week.weekStart).split(' ')[0]}
            </span>
          ))}
        </div>
      </div>

      {/* Equivalente accesible de la gráfica. */}
      <table className="sr-only">
        <caption>Sesiones de fuerza por semana</caption>
        <thead>
          <tr>
            <th scope="col">Semana que inicia</th>
            <th scope="col">Sesiones</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week.weekStart}>
              <td>{shortDate(week.weekStart)}</td>
              <td>{week.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
