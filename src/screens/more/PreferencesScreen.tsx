import { Dumbbell, Timer } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { IconBubble } from '../../components/ui/IconBubble'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { cn } from '../../lib/tones'
import { useAppData } from '../../state/useAppData'
import type { PreferredSession } from '../../types'

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
  const { data, updatePreferences } = useAppData()
  const { name, preferredSession } = data.preferences

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

      <p className="text-center text-sm text-ink-500">Los cambios se guardan automáticamente en este dispositivo.</p>
    </div>
  )
}
