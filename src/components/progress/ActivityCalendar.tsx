import { WEEK_ORDER, WEEKDAY_INITIAL, WEEKDAY_NAME, toISODate, weekdayKey } from '../../lib/dates'
import { primaryActivity, type ActivityKind } from '../../lib/progress'
import { cn } from '../../lib/tones'
import type { ISODate } from '../../types'
import { ActivityMarker } from './ActivityMarker'
import { describeActivities } from './activityMeta'

interface ActivityCalendarProps {
  /** Filas de 7 días (lunes a domingo); null = casilla vacía fuera del mes. */
  rows: Array<Array<Date | null>>
  activity: Map<ISODate, ActivityKind[]>
  today: ISODate
  label: string
}

/** Calendario de solo lectura: cada día muestra su actividad principal con ícono. */
export function ActivityCalendar({ rows, activity, today, label }: ActivityCalendarProps) {
  return (
    <table className="w-full table-fixed border-separate border-spacing-y-1 text-center" aria-label={label}>
      <thead>
        <tr>
          {WEEK_ORDER.map((day) => (
            <th key={day} scope="col" className="pb-1 text-xs font-semibold text-ink-500">
              <abbr title={WEEKDAY_NAME[day]} className="no-underline">
                {WEEKDAY_INITIAL[day]}
              </abbr>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((date, cellIndex) => {
              if (!date) return <td key={cellIndex} />
              const iso = toISODate(date)
              const kinds = activity.get(iso) ?? []
              const isToday = iso === today
              const isFuture = iso > today
              return (
                <td key={iso}>
                  <span
                    className="flex flex-col items-center gap-1"
                    aria-label={`${WEEKDAY_NAME[weekdayKey(date)]} ${date.getDate()}${isToday ? ', hoy' : ''}: ${
                      isFuture ? 'aún no llega' : describeActivities(kinds)
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex size-7 items-center justify-center rounded-full text-sm font-semibold',
                        isToday ? 'bg-bloom-800 text-white' : isFuture ? 'text-ink-400' : 'text-ink-700',
                      )}
                    >
                      {date.getDate()}
                    </span>
                    {isFuture ? (
                      <span aria-hidden="true" className="block size-8" />
                    ) : (
                      <ActivityMarker kind={primaryActivity(kinds)} />
                    )}
                  </span>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
