import { BellRing, Flower2, Moon, Timer, X } from 'lucide-react'
import { reminderText } from '../../data/reminders'
import { toISODate } from '../../lib/dates'
import { shouldShowReminder } from '../../lib/reminders'
import { routeHref } from '../../lib/router'
import { useAppData } from '../../state/useAppData'
import { useNow } from '../../state/useNow'

/**
 * Recordatorio dentro de la app: aparece si abres la app (o la tienes abierta)
 * después de tu hora y hoy todavía no hay actividad. No es una notificación del sistema.
 */
export function ReminderBanner() {
  const { data, markRestDay, dismissReminder } = useAppData()
  const now = useNow()
  if (!shouldShowReminder(data, now)) return null
  const today = toISODate(now)

  const action =
    'inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white px-3 text-sm font-semibold text-ink-900 ring-1 ring-bloom-200 transition hover:bg-bloom-50'

  return (
    <section aria-label="Recordatorio" aria-live="polite" className="rounded-card bg-bloom-100 p-4 ring-1 ring-bloom-200">
      <div className="flex items-start gap-3">
        <BellRing size={22} className="mt-0.5 shrink-0 text-bloom-700" aria-hidden="true" />
        <p className="flex-1 font-semibold text-ink-900">{reminderText(data.reminders)}</p>
        <button
          type="button"
          onClick={() => dismissReminder(today)}
          aria-label="Ahora no (ocultar el recordatorio de hoy)"
          className="-mr-1 -mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-500 transition hover:bg-white/70"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 pl-8">
        <a href={routeHref({ name: 'routine', id: 'mobility' })} className={action}>
          <Flower2 size={16} className="text-sage-700" aria-hidden="true" /> Movilidad
        </a>
        <a href={routeHref({ name: 'routine', id: 'short' })} className={action}>
          <Timer size={16} className="text-rose-700" aria-hidden="true" /> Rutina corta
        </a>
        <button type="button" onClick={() => markRestDay(today)} className={action}>
          <Moon size={16} className="text-bloom-700" aria-hidden="true" /> Hoy descanso
        </button>
      </div>
    </section>
  )
}
