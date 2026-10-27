import { Settings } from 'lucide-react'
import { ListRow } from '../../components/ui/ListRow'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { routeHref, type MoreSection } from '../../lib/router'
import { useAppData } from '../../state/useAppData'
import type { EmojiName } from '../../data/emoji'
import type { Tone } from '../../types'
import { APP_VERSION } from '../../data/app'
import { formatTime } from '../../lib/reminders'

interface Row {
  section: MoreSection
  emoji: EmojiName
  tone: Tone
  title: string
  subtitle: string
}

export function MoreScreen() {
  const { data } = useAppData()
  const strengthDays = Object.values(data.preferences.plan).filter((slot) => slot.type === 'strength').length

  const groups: Array<{ title: string; rows: Row[] }> = [
    {
      title: 'Mi entrenamiento',
      rows: [
        { section: 'ligas', emoji: 'flexed-biceps', tone: 'rose', title: 'Mis ligas', subtitle: 'Rosa (Light) · Morada (X-Heavy)' },
        {
          section: 'horario',
          emoji: 'calendar',
          tone: 'lavender',
          title: 'Horario de entrenamiento',
          subtitle: `${strengthDays} días de fuerza por semana`,
        },
        {
          section: 'preferencias',
          emoji: 'gear',
          tone: 'sky',
          title: 'Preferencias',
          subtitle: data.preferences.preferredSession === 'short' ? 'Sesiones de 10 min' : 'Sesiones de 15–25 min',
        },
        {
          section: 'recordatorios',
          emoji: 'bell',
          tone: 'lavender',
          title: 'Recordatorios',
          subtitle: data.reminders.enabled ? `${formatTime(data.reminders.time)} · dentro de la app` : 'Desactivados',
        },
        {
          section: 'notas',
          emoji: 'spiral-notepad',
          tone: 'peach',
          title: 'Notas personales',
          subtitle: data.notes.length ? `${data.notes.length} ${data.notes.length === 1 ? 'nota' : 'notas'}` : 'Cómo me siento, observaciones…',
        },
      ],
    },
    {
      title: 'Aprender',
      rows: [
        { section: 'consejos', emoji: 'light-bulb', tone: 'peach', title: 'Consejos', subtitle: 'Técnica, descanso, progreso' },
        { section: 'preguntas', emoji: 'red-question-mark', tone: 'sky', title: 'Preguntas frecuentes', subtitle: 'Dudas comunes' },
      ],
    },
    {
      title: 'App',
      rows: [
        { section: 'instalar', emoji: 'sparkles', tone: 'lavender', title: 'Instalar la app', subtitle: 'En tu teléfono o computadora' },
        { section: 'datos', emoji: 'floppy-disk', tone: 'sage', title: 'Mis datos', subtitle: 'Cuenta, respaldo o borrar' },
        { section: 'acerca', emoji: 'purple-heart', tone: 'rose', title: 'Sobre la app', subtitle: `Versión ${APP_VERSION}` },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <ScreenHeader
        title="Más"
        action={
          <a
            href={routeHref({ name: 'more-section', section: 'preferencias' })}
            aria-label="Preferencias"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/85 shadow-soft ring-1 ring-ink-200/60 transition hover:bg-white"
          >
            <Settings size={20} aria-hidden="true" />
          </a>
        }
      />
      {groups.map((group) => (
        <section key={group.title} aria-labelledby={`more-${group.title}`} className="space-y-3">
          <h2 id={`more-${group.title}`} className="text-sm font-semibold uppercase tracking-wide text-ink-500">
            {group.title}
          </h2>
          <ul className="space-y-3">
            {group.rows.map((row) => (
              <li key={row.section}>
                <ListRow
                  href={routeHref({ name: 'more-section', section: row.section })}
                  emoji={row.emoji}
                  tone={row.tone}
                  title={row.title}
                  subtitle={row.subtitle}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
