import { ArrowLeft, ArrowRight, BellRing, CalendarPlus, Dumbbell, Info, Sprout, Timer } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Card } from '../components/ui/Card'
import { DayPicker } from '../components/ui/DayPicker'
import { IconBubble } from '../components/ui/IconBubble'
import { getRoutine } from '../data/routines'
import { capitalize, WEEK_ORDER, WEEKDAY_NAME } from '../lib/dates'
import { appUrl, downloadFile } from '../lib/download'
import { hasBackToBackDays, MAX_TRAINING_DAYS, planFromTrainingDays } from '../lib/onboarding'
import { buildReminderIcs, formatTime } from '../lib/reminders'
import { navigate } from '../lib/router'
import { isTimeOfDay } from '../lib/storage'
import { cn } from '../lib/tones'
import type { OnboardingChoices } from '../state/appDataContext'
import { useAppData } from '../state/useAppData'
import type { PreferredSession } from '../types'

const STEPS = ['welcome', 'days', 'time', 'length', 'beginner', 'done'] as const
type Step = (typeof STEPS)[number]
/** Los pasos con preguntas (para "Paso 2 de 4"). */
const QUESTION_STEPS: Step[] = ['days', 'time', 'length', 'beginner']

function OptionCard({
  checked,
  onSelect,
  name,
  title,
  description,
  icon,
}: {
  checked: boolean
  onSelect: () => void
  name: string
  title: string
  description: string
  icon: typeof Timer
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-2xl p-4 ring-2 transition has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-bloom-500',
        checked ? 'bg-bloom-50 ring-bloom-500' : 'bg-white ring-ink-200 hover:ring-bloom-300',
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="sr-only" />
      <IconBubble icon={icon} tone={checked ? 'lavender' : 'sky'} />
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-ink-500">{description}</span>
      </span>
    </label>
  )
}

/**
 * Configuración inicial en pocos pasos. Todo trae un valor recomendado,
 * así que "Saltar" guarda lo que haya y lleva directo a Inicio.
 */
export function OnboardingScreen() {
  const { data, completeOnboarding } = useAppData()
  const currentTrainingDays = WEEK_ORDER.filter((day) => data.preferences.plan[day].type === 'strength')
  const [step, setStep] = useState<Step>('welcome')
  const [choices, setChoices] = useState<OnboardingChoices>({
    trainingDays: currentTrainingDays.length ? currentTrainingDays : ['mon', 'wed', 'fri'],
    reminderTime: data.reminders.time,
    remindersEnabled: data.reminders.enabled,
    preferredSession: data.preferences.preferredSession,
    beginnerPlan: data.preferences.beginnerPlan,
  })
  const [calendarDone, setCalendarDone] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Al cambiar de paso, mover el foco al título para que lectores de pantalla y teclado sigan el flujo.
  useEffect(() => {
    if (step !== 'welcome') headingRef.current?.focus()
  }, [step])

  const index = STEPS.indexOf(step)
  const questionNumber = QUESTION_STEPS.indexOf(step) + 1
  const next = () => setStep(STEPS[Math.min(index + 1, STEPS.length - 1)])
  const back = () => setStep(STEPS[Math.max(index - 1, 0)])
  const set = (patch: Partial<OnboardingChoices>) => setChoices((current) => ({ ...current, ...patch }))
  const finish = () => {
    completeOnboarding(choices)
    navigate({ name: 'home' })
  }

  const plan = planFromTrainingDays(choices.trainingDays)
  const canContinue = step !== 'days' || choices.trainingDays.length > 0

  function addToCalendar() {
    try {
      const reminders = { ...data.reminders, time: choices.reminderTime, enabled: choices.remindersEnabled }
      downloadFile('band-and-bloom-recordatorio.ics', buildReminderIcs(reminders, new Date(), appUrl()), 'text/calendar')
      setCalendarDone(true)
    } catch {
      setCalendarDone(false)
    }
  }

  let content: ReactNode
  switch (step) {
    case 'welcome':
      content = (
        <div className="text-center">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="mx-auto size-20" />
          <h1 className="mt-5 text-3xl font-bold tracking-tight">Te damos la bienvenida a Band & Bloom 💜</h1>
          <p className="mx-auto mt-3 max-w-sm text-ink-700">
            Tu rutina de fuerza en casa con ligas. Cada día te diremos qué toca, cómo hacerlo y cuándo descansar.
          </p>
          <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-ink-700">
            <li className="flex gap-2">
              <Sprout size={18} className="mt-0.5 shrink-0 text-sage-600" aria-hidden="true" /> Sin cuentas ni datos
              personales: todo se queda en tu teléfono.
            </li>
            <li className="flex gap-2">
              <Sprout size={18} className="mt-0.5 shrink-0 text-sage-600" aria-hidden="true" /> Solo 4 preguntas rápidas.
              Puedes saltarlas y usar lo recomendado.
            </li>
          </ul>
        </div>
      )
      break

    case 'days':
      content = (
        <>
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none">
            ¿Qué días quieres entrenar fuerza?
          </h1>
          <p className="mt-2 text-ink-500">Recomendado: 3 días con un descanso entre ellos. Máximo {MAX_TRAINING_DAYS}.</p>
          <div className="mt-5">
            <DayPicker
              label="Días de entrenamiento"
              value={choices.trainingDays}
              onChange={(trainingDays) => set({ trainingDays })}
              max={MAX_TRAINING_DAYS}
            />
          </div>
          {choices.trainingDays.length === 0 ? (
            <p className="mt-4 text-sm text-peach-700">Elige al menos un día.</p>
          ) : (
            <Card className="mt-5 p-4">
              <p className="text-sm font-semibold text-ink-700">Tu semana quedaría así:</p>
              <ul className="mt-2 space-y-1 text-sm text-ink-700">
                {WEEK_ORDER.filter((day) => choices.trainingDays.includes(day)).map((day) => {
                  const slot = plan[day]
                  const routine = slot.type === 'strength' ? getRoutine(slot.routineId) : null
                  return (
                    <li key={day}>
                      <strong className="font-semibold text-ink-900">{capitalize(WEEKDAY_NAME[day])}:</strong>{' '}
                      {routine?.letter} · {routine?.name}
                    </li>
                  )
                })}
              </ul>
              <p className="mt-2 text-xs text-ink-500">Los demás días: movilidad opcional o descanso.</p>
            </Card>
          )}
          {hasBackToBackDays(choices.trainingDays) && (
            <p className="mt-3 flex gap-2 text-sm text-ink-700">
              <Info size={18} className="mt-0.5 shrink-0 text-peach-700" aria-hidden="true" />
              Elegiste días seguidos. Se vale, pero al empezar ayuda dejar un día de descanso entre sesiones.
            </p>
          )}
        </>
      )
      break

    case 'time':
      content = (
        <>
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none">
            ¿A qué hora prefieres entrenar?
          </h1>
          <p className="mt-2 text-ink-500">La usaremos para tu recordatorio. Puedes cambiarla cuando quieras.</p>
          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-white p-4 ring-1 ring-ink-200">
            <label htmlFor="onboarding-time" className="font-semibold">
              Hora
            </label>
            <input
              id="onboarding-time"
              type="time"
              value={choices.reminderTime}
              onChange={(event) => {
                if (isTimeOfDay(event.target.value)) set({ reminderTime: event.target.value })
              }}
              className="min-h-11 rounded-xl bg-bloom-50 px-3 text-base font-semibold ring-1 ring-bloom-200"
            />
          </div>
          <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-ink-200">
            <input
              type="checkbox"
              checked={choices.remindersEnabled}
              onChange={(event) => set({ remindersEnabled: event.target.checked })}
              className="mt-1 size-5 accent-bloom-600"
            />
            <span>
              <span className="block font-semibold">Recordarme dentro de la app</span>
              <span className="block text-sm text-ink-500">
                Si abres la app después de esa hora y no has hecho nada, verás un aviso amable.
              </span>
            </span>
          </label>
          <p className="mt-3 flex gap-2 text-sm text-ink-500">
            <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            La app no envía notificaciones con el teléfono bloqueado. Al final te mostramos cómo agregar el aviso a tu
            calendario.
          </p>
        </>
      )
      break

    case 'length':
      content = (
        <>
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none">
            ¿Cuánto tiempo quieres que duren tus sesiones?
          </h1>
          <p className="mt-2 text-ink-500">Siempre puedes elegir otra rutina desde la sección Rutinas.</p>
          <fieldset className="mt-5 space-y-3">
            <legend className="sr-only">Duración de las sesiones</legend>
            {(
              [
                { value: 'full', title: '20–25 minutos', description: 'Rutinas completas A, B y C.', icon: Dumbbell },
                { value: 'short', title: '10 minutos', description: 'La rutina corta en tus días de fuerza.', icon: Timer },
              ] as Array<{ value: PreferredSession; title: string; description: string; icon: typeof Timer }>
            ).map((option) => (
              <OptionCard
                key={option.value}
                name="onboarding-length"
                checked={choices.preferredSession === option.value}
                onSelect={() => set({ preferredSession: option.value })}
                title={option.title}
                description={option.description}
                icon={option.icon}
              />
            ))}
          </fieldset>
        </>
      )
      break

    case 'beginner':
      content = (
        <>
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none">
            ¿Empezamos con el plan para principiantes?
          </h1>
          <p className="mt-2 text-ink-500">
            Las primeras dos semanas son para aprender los movimientos con calma, sin subir la dificultad.
          </p>
          <fieldset className="mt-5 space-y-3">
            <legend className="sr-only">Plan para principiantes</legend>
            <OptionCard
              name="onboarding-beginner"
              checked={choices.beginnerPlan}
              onSelect={() => set({ beginnerPlan: true })}
              title="Sí, quiero empezar con calma (recomendado)"
              description="1 o 2 series por ejercicio y liga rosa mientras aprendes la técnica."
              icon={Sprout}
            />
            <OptionCard
              name="onboarding-beginner"
              checked={!choices.beginnerPlan}
              onSelect={() => set({ beginnerPlan: false })}
              title="No, ya tengo experiencia"
              description="2 series por ejercicio desde el inicio."
              icon={Dumbbell}
            />
          </fieldset>
        </>
      )
      break

    case 'done':
      content = (
        <>
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none">
            ¡Todo listo! 🌱
          </h1>
          <Card className="mt-5 p-4">
            <ul className="space-y-2 text-sm text-ink-700">
              <li>
                <strong className="text-ink-900">Fuerza:</strong>{' '}
                {WEEK_ORDER.filter((day) => choices.trainingDays.includes(day))
                  .map((day) => capitalize(WEEKDAY_NAME[day]))
                  .join(', ')}
              </li>
              <li>
                <strong className="text-ink-900">Sesiones:</strong>{' '}
                {choices.preferredSession === 'short' ? '10 minutos' : '20–25 minutos'}
              </li>
              <li>
                <strong className="text-ink-900">Plan para principiantes:</strong> {choices.beginnerPlan ? 'Sí' : 'No'}
              </li>
              <li className="flex items-start gap-1.5">
                <BellRing size={16} className="mt-0.5 shrink-0 text-bloom-700" aria-hidden="true" />
                {choices.remindersEnabled
                  ? `Recordatorio dentro de la app a partir de las ${formatTime(choices.reminderTime)}`
                  : 'Sin recordatorio dentro de la app.'}
              </li>
            </ul>
          </Card>
          <Card tone="lavender" className="mt-4 p-4">
            <p className="text-sm text-ink-700">
              ¿Quieres un aviso aunque la app esté cerrada? Agrega el recordatorio a tu calendario:
            </p>
            <button
              type="button"
              onClick={addToCalendar}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-bloom-700 ring-1 ring-bloom-200 transition hover:bg-bloom-50"
            >
              <CalendarPlus size={18} aria-hidden="true" />
              Agregar a mi calendario
            </button>
            <p role="status" className="mt-2 text-xs text-ink-500">
              {calendarDone && 'Listo. Si no se abrió el Calendario, busca el archivo .ics en tus descargas y ábrelo.'}
            </p>
          </Card>
          <p className="mt-4 text-sm text-ink-500">Puedes cambiar todo esto después en la sección Más.</p>
        </>
      )
      break
  }

  return (
    <div className="min-h-dvh px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))]">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col">
        <div className="flex min-h-11 items-center justify-between">
          {index > 0 && step !== 'done' ? (
            <button
              type="button"
              onClick={back}
              aria-label="Paso anterior"
              className="inline-flex size-11 items-center justify-center rounded-full bg-white/85 shadow-soft ring-1 ring-ink-200/60 transition hover:bg-white"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
          ) : (
            <span />
          )}
          {questionNumber > 0 && (
            <p className="text-sm font-semibold text-ink-500" aria-live="polite">
              Paso {questionNumber} de {QUESTION_STEPS.length}
            </p>
          )}
          {step !== 'done' ? (
            <button
              type="button"
              onClick={finish}
              className="min-h-11 rounded-full px-4 text-sm font-semibold text-ink-700 transition hover:bg-white/70"
            >
              Saltar
            </button>
          ) : (
            <span />
          )}
        </div>

        {questionNumber > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
            {QUESTION_STEPS.map((s, i) => (
              <span key={s} className={cn('h-1.5 rounded-full', i < questionNumber ? 'bg-bloom-500' : 'bg-bloom-100')} />
            ))}
          </div>
        )}

        <main className="flex-1 py-8">{content}</main>

        <button
          type="button"
          onClick={step === 'done' ? finish : next}
          disabled={!canContinue}
          className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-bloom-600 px-6 text-base font-semibold text-white shadow-lift transition hover:bg-bloom-700 disabled:bg-ink-200 disabled:text-ink-500 disabled:shadow-none"
        >
          {step === 'welcome' ? 'Empezar' : step === 'done' ? 'Ir a Inicio' : 'Siguiente'}
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
