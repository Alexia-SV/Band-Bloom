import { BellRing, CalendarPlus, CircleCheck, Info, Smartphone, X } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { DayPicker } from '../../components/ui/DayPicker'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { CUSTOM_MESSAGE_MAX_LENGTH, REMINDER_MESSAGES, reminderText } from '../../data/reminders'
import { WEEK_ORDER } from '../../lib/dates'
import { appUrl, downloadFile } from '../../lib/download'
import { buildReminderIcs, describeDays, formatTime } from '../../lib/reminders'
import { isTimeOfDay } from '../../lib/storage'
import { cn } from '../../lib/tones'
import { useAppData } from '../../state/useAppData'

type CalendarStatus = 'idle' | 'done' | 'error'

export function RemindersScreen() {
  const { data, updateReminders } = useAppData()
  const { reminders, preferences } = data
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus>('idle')

  const trainingDays = WEEK_ORDER.filter((day) => preferences.plan[day].type === 'strength')
  const allDays = [...WEEK_ORDER]
  const sameDays = (a: string[], b: string[]) => a.length === b.length && a.every((day) => b.includes(day))

  function addToCalendar() {
    try {
      downloadFile('band-and-bloom-recordatorio.ics', buildReminderIcs(reminders, new Date(), appUrl()), 'text/calendar')
      setCalendarStatus('done')
    } catch {
      setCalendarStatus('error')
    }
  }

  return (
    <div className="space-y-5">
      <ScreenHeader title="Recordatorios" subtitle="Un empujoncito amable, sin presión." backTo={{ name: 'more' }} />

      {/* Lo que hace y lo que no hace la app, dicho claro. */}
      <Card tone="lavender" as="section" className="p-5" aria-labelledby="how-title">
        <h2 id="how-title" className="flex items-center gap-2 font-bold">
          <Info size={20} className="text-bloom-700" aria-hidden="true" />
          Cómo funcionan
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-700">
          <li className="flex gap-2">
            <CircleCheck size={18} className="mt-0.5 shrink-0 text-sage-700" aria-hidden="true" />
            <span>
              <strong className="text-ink-900">Dentro de la app:</strong> si la abres después de tu hora y hoy no has
              registrado nada, verás un recordatorio arriba de la pantalla.
            </span>
          </li>
          <li className="flex gap-2">
            <CircleCheck size={18} className="mt-0.5 shrink-0 text-sage-700" aria-hidden="true" />
            <span>
              <strong className="text-ink-900">Con la app cerrada:</strong> agrega el recordatorio a tu calendario o crea
              una automatización en Atajos (abajo). Tu teléfono te avisará a la hora.
            </span>
          </li>
          <li className="flex gap-2">
            <X size={18} className="mt-0.5 shrink-0 text-rose-700" aria-hidden="true" />
            <span>
              <strong className="text-ink-900">Notificaciones de la app:</strong> por ahora Band & Bloom no envía
              notificaciones por sí sola. Una página web no puede programarlas sin un servidor.
            </span>
          </li>
        </ul>
      </Card>

      <Card as="section" className="space-y-5 p-5" aria-labelledby="settings-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="settings-title" className="font-bold">
              Recordatorio dentro de la app
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              {reminders.enabled
                ? `${describeDays(reminders.days)} a partir de las ${formatTime(reminders.time)}`
                : 'Desactivado'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={reminders.enabled}
            aria-label="Recordatorio dentro de la app"
            onClick={() => updateReminders({ enabled: !reminders.enabled })}
            className={cn(
              'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors',
              reminders.enabled ? 'bg-bloom-600' : 'bg-ink-200',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'inline-block size-6 rounded-full bg-white shadow-soft transition-transform',
                reminders.enabled ? 'translate-x-7' : 'translate-x-1',
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <label htmlFor="reminder-time" className="font-medium">
            Hora
          </label>
          <input
            id="reminder-time"
            type="time"
            value={reminders.time}
            onChange={(event) => {
              if (isTimeOfDay(event.target.value)) updateReminders({ time: event.target.value })
            }}
            className="min-h-11 rounded-xl bg-bloom-50 px-3 text-base font-semibold ring-1 ring-bloom-200"
          />
        </div>

        <div>
          <p id="reminder-days-label" className="font-medium">
            Días
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { label: 'Todos los días', days: allDays },
              { label: 'Solo días de fuerza', days: trainingDays },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                aria-pressed={sameDays(reminders.days, preset.days)}
                onClick={() => updateReminders({ days: preset.days })}
                className={cn(
                  'min-h-10 rounded-full px-3 text-sm font-semibold ring-1 transition-colors',
                  sameDays(reminders.days, preset.days)
                    ? 'bg-bloom-100 text-bloom-800 ring-bloom-300'
                    : 'bg-white text-ink-700 ring-ink-200 hover:bg-bloom-50',
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <DayPicker label="Días del recordatorio" value={reminders.days} onChange={(days) => updateReminders({ days })} />
          </div>
          {reminders.days.length === 0 && (
            <p className="mt-2 text-sm text-peach-700">Elige al menos un día para que aparezca el recordatorio.</p>
          )}
        </div>

        <fieldset>
          <legend className="font-medium">Mensaje</legend>
          <div className="mt-2 space-y-2">
            {[...REMINDER_MESSAGES, { id: 'custom' as const, text: 'Escribir mi propio mensaje' }].map((message) => {
              const checked = reminders.messageId === message.id
              return (
                <label
                  key={message.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-2xl p-3 text-sm ring-1 transition has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-bloom-500',
                    checked ? 'bg-bloom-50 ring-bloom-400' : 'bg-white ring-ink-200 hover:ring-bloom-300',
                  )}
                >
                  <input
                    type="radio"
                    name="reminder-message"
                    checked={checked}
                    onChange={() => updateReminders({ messageId: message.id })}
                    className="mt-0.5 size-4 accent-bloom-600"
                  />
                  <span>{message.text}</span>
                </label>
              )
            })}
          </div>
          {reminders.messageId === 'custom' && (
            <div className="mt-3">
              <label htmlFor="custom-message" className="sr-only">
                Tu mensaje
              </label>
              <input
                id="custom-message"
                type="text"
                value={reminders.customMessage}
                maxLength={CUSTOM_MESSAGE_MAX_LENGTH}
                placeholder="Por ejemplo: 7 minutos para mí 💜"
                onChange={(event) => updateReminders({ customMessage: event.target.value })}
                className="min-h-12 w-full rounded-xl bg-bloom-50 px-4 text-base ring-1 ring-bloom-200 placeholder:text-ink-400"
              />
            </div>
          )}
        </fieldset>

        <div className="rounded-2xl bg-ink-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Vista previa</p>
          <p className="mt-1 flex items-start gap-2 text-sm font-semibold text-ink-900">
            <BellRing size={18} className="mt-0.5 shrink-0 text-bloom-700" aria-hidden="true" />
            {reminderText(reminders)}
          </p>
        </div>
      </Card>

      <Card as="section" className="p-5" aria-labelledby="calendar-title">
        <h2 id="calendar-title" className="flex items-center gap-2 font-bold">
          <CalendarPlus size={20} className="text-bloom-600" aria-hidden="true" />
          Aviso con la app cerrada: tu calendario
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Descarga un evento que se repite {describeDays(reminders.days).toLowerCase()} a las {formatTime(reminders.time)},
          con alarma. Funciona aunque no tengas internet.
        </p>
        <button
          type="button"
          onClick={addToCalendar}
          disabled={reminders.days.length === 0}
          className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-bloom-600 px-5 font-semibold text-white shadow-lift transition hover:bg-bloom-700 disabled:bg-ink-200 disabled:text-ink-500 disabled:shadow-none"
        >
          <CalendarPlus size={18} aria-hidden="true" />
          Agregar a mi calendario
        </button>
        <p role="status" className="mt-3 text-sm">
          {calendarStatus === 'done' && (
            <span className="text-ink-700">
              Listo. Si tu teléfono no abre el Calendario solo, busca el archivo{' '}
              <strong>band-and-bloom-recordatorio.ics</strong> en tus descargas (en iPhone, en la app Archivos), ábrelo y
              toca «Agregar».
            </span>
          )}
          {calendarStatus === 'error' && (
            <span className="text-rose-700">No se pudo crear el archivo en este navegador. Intenta desde Safari o Chrome.</span>
          )}
        </p>
        <p className="mt-2 text-xs text-ink-500">
          Si cambias la hora o los días aquí, descarga el evento otra vez y borra el anterior de tu calendario.
        </p>
      </Card>

      <Card as="section" className="p-5" aria-labelledby="shortcuts-title">
        <h2 id="shortcuts-title" className="flex items-center gap-2 font-bold">
          <Smartphone size={20} className="text-bloom-600" aria-hidden="true" />
          Otra opción en iPhone: Atajos
        </h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink-700">
          <li>Abre la app Atajos y ve a la pestaña Automatización.</li>
          <li>Crea una automatización nueva de tipo «Hora del día» y elige {formatTime(reminders.time)}.</li>
          <li>Hazla diaria (o elige tus días) y configúrala para que se ejecute sin preguntar.</li>
          <li>
            Como acción, agrega «Mostrar notificación» con tu mensaje, o «Abrir URL» con la dirección de Band & Bloom.
          </li>
        </ol>
        <p className="mt-3 text-xs text-ink-500">Los nombres exactos pueden variar un poco según tu versión de iOS.</p>
      </Card>
    </div>
  )
}
