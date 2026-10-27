import { Dumbbell, RotateCcw, Sprout, Timer } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { IconBubble } from '../../components/ui/IconBubble'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { parseISODate } from '../../lib/dates'
import { cn } from '../../lib/tones'
import { useAppData } from '../../state/useAppData'
import type { PreferredSession } from '../../types'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long' }).format(parseISODate(iso))
}

const SESSION_OPTIONS: Array<{ value: PreferredSession; title: string; description: string; icon: typeof Timer }> = [
  {
    value: 'full',
    title: 'Completa · 15–25 min',
    description: 'Inicio te sugiere la rutina A, B o C del día.',
    icon: Dumbbell,
  },
  {
    value: 'short',
    title: 'Corta · 10 min',
    description: 'Inicio te sugiere la rutina corta en tus días de fuerza.',
    icon: Timer,
  },
]

export function PreferencesScreen() {
  const { data, updatePreferences, restartOnboarding } = useAppData()
  const { name, preferredSession, beginnerPlan, beginnerPlanStartedOn } = data.preferences

  return (
    <div className="space-y-5">
      <ScreenHeader title="Preferencias" backTo={{ name: 'more' }} />

      <Card as="section" className="p-5" aria-labelledby="name-title">
        <h2 id="name-title" className="font-bold">
          ¿Cómo te llamamos?
        </h2>
        <p className="mt-1 text-sm text-ink-500">Opcional. Solo se usa para saludarte en Inicio.</p>
        <label htmlFor="pref-name" className="sr-only">
          Tu nombre
        </label>
        <input
          id="pref-name"
          type="text"
          value={name}
          maxLength={40}
          autoComplete="given-name"
          placeholder="Tu nombre"
          onChange={(event) => updatePreferences({ name: event.target.value })}
          className="mt-3 min-h-12 w-full rounded-xl bg-bloom-50 px-4 text-base ring-1 ring-bloom-200 placeholder:text-ink-400"
        />
      </Card>

      <Card as="section" className="p-5">
        <fieldset>
          <legend className="font-bold">Duración preferida de tus sesiones</legend>
          <p className="mt-1 text-sm text-ink-500">Puedes elegir cualquier rutina en cualquier momento desde Rutinas.</p>
          <div className="mt-3 grid gap-3">
            {SESSION_OPTIONS.map((option) => {
              const checked = preferredSession === option.value
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-2xl p-4 ring-2 transition has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-bloom-500',
                    checked ? 'bg-bloom-50 ring-bloom-500' : 'bg-white ring-ink-200 hover:ring-bloom-300',
                  )}
                >
                  <input
                    type="radio"
                    name="preferred-session"
                    value={option.value}
                    checked={checked}
                    onChange={() => updatePreferences({ preferredSession: option.value })}
                    className="sr-only"
                  />
                  <IconBubble icon={option.icon} tone={checked ? 'lavender' : 'sky'} />
                  <span>
                    <span className="block font-semibold">{option.title}</span>
                    <span className="block text-sm text-ink-500">{option.description}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      </Card>

      <Card as="section" className="p-5" aria-labelledby="beginner-title">
        <div className="flex items-start gap-3">
          <IconBubble icon={Sprout} tone="sage" />
          <div className="flex-1">
            <h2 id="beginner-title" className="font-bold">
              Plan para principiantes
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Las primeras dos semanas se enfocan en aprender la técnica con 1 o 2 series y la liga rosa.
              {beginnerPlan && beginnerPlanStartedOn && ` Empezó el ${formatDate(beginnerPlanStartedOn)}.`}
            </p>
          </div>
        </div>
        <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-sage-50 p-4 ring-1 ring-sage-200">
          <span className="font-semibold">Usar el plan para principiantes</span>
          <input
            type="checkbox"
            checked={beginnerPlan}
            onChange={(event) => updatePreferences({ beginnerPlan: event.target.checked })}
            className="size-5 accent-sage-600"
          />
        </label>
      </Card>

      <Card as="section" className="p-5" aria-labelledby="restart-title">
        <h2 id="restart-title" className="font-bold">
          Configuración inicial
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Vuelve a responder las preguntas del inicio (días, hora, duración). Tu historial y tus notas no se borran.
        </p>
        <button
          type="button"
          onClick={restartOnboarding}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-bloom-700 ring-1 ring-bloom-200 transition hover:bg-bloom-50"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Repetir configuración inicial
        </button>
      </Card>

      <p className="text-center text-sm text-ink-500">Los cambios se guardan automáticamente.</p>
    </div>
  )
}
