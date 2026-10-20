import { CalendarCheck, ChevronLeft, ChevronRight, Clock, Dumbbell, Flower2, Moon, Star, Timer } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { ActivityLegend } from '../components/progress/ActivityMarker'
import { ActivityCalendar } from '../components/progress/ActivityCalendar'
import { ConsistencyChart } from '../components/progress/ConsistencyChart'
import { SessionHistory } from '../components/progress/SessionHistory'
import { StatCard } from '../components/progress/StatCard'
import { Card } from '../components/ui/Card'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { SegmentedTabs } from '../components/ui/SegmentedTabs'
import { addDays, capitalize, parseISODate, startOfWeek, toISODate, weekDates } from '../lib/dates'
import {
  activityByDate,
  completedSessions,
  monthGrid,
  periodStats,
  sessionHistory,
  weeklyStrengthCounts,
} from '../lib/progress'
import { useAppData } from '../state/useAppData'
import { useNow } from '../state/useNow'

type View = 'week' | 'month' | 'total'

const VIEWS: Array<{ value: View; label: string }> = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'total', label: 'Total' },
]

function monthLabel(year: number, month: number): string {
  return capitalize(new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(new Date(year, month, 1)))
}

function Encouragement() {
  return (
    <Card tone="peach" className="flex items-start gap-3 p-4">
      <Star size={22} className="mt-0.5 shrink-0 fill-peach-500 text-peach-500" aria-hidden="true" />
      <p className="text-sm text-ink-700">
        <strong className="block text-ink-900">¡Vas muy bien!</strong>
        La constancia también se construye con pasos pequeños. 💜
      </p>
    </Card>
  )
}

export function ProgressScreen() {
  const { data } = useAppData()
  const now = useNow()
  const today = toISODate(now)
  const [view, setView] = useState<View>('week')
  // Mes visible en la vista "Mes": desplazamiento respecto al mes actual (0 = este mes).
  const [monthOffset, setMonthOffset] = useState(0)
  const panelId = useId()

  const activity = useMemo(() => activityByDate(data), [data])
  const hasAnySession = completedSessions(data).length > 0
  const goal = data.preferences.weeklyStrengthGoal

  const weekStart = toISODate(startOfWeek(now))
  const weekEnd = toISODate(addDays(startOfWeek(now), 6))
  const week = periodStats(data, weekStart, weekEnd)

  const shown = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const monthStart = toISODate(shown)
  const monthEnd = toISODate(new Date(shown.getFullYear(), shown.getMonth() + 1, 0))
  const month = periodStats(data, monthStart, monthEnd)

  const total = periodStats(data)
  const firstSession = completedSessions(data)
    .map((session) => session.date)
    .sort()[0]

  return (
    <div className="space-y-5">
      <ScreenHeader title="Mi progreso" subtitle="Solo lo que realmente hiciste, sin números inventados." />

      <SegmentedTabs label="Periodo" options={VIEWS} value={view} onChange={setView} panelId={panelId} />

      <div id={panelId} role="tabpanel" aria-label={VIEWS.find((v) => v.value === view)?.label} className="space-y-5">
        {view === 'week' && (
          <>
            <Card as="section" className="space-y-4 p-5" aria-labelledby="week-calendar-title">
              <h2 id="week-calendar-title" className="font-bold">
                Semana del {parseISODate(weekStart).getDate()} al {parseISODate(weekEnd).getDate()}
              </h2>
              <ActivityCalendar rows={[weekDates(now)]} activity={activity} today={today} label="Actividad de esta semana" />
              <ActivityLegend />
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={Dumbbell}
                tone="lavender"
                value={`${week.strength + week.short}/${goal}`}
                label="Rutinas de fuerza"
              />
              <StatCard
                icon={Flower2}
                tone="sage"
                value={String(week.mobility)}
                label="Sesiones de movilidad"
              />
            </div>

            <ConsistencyChart weeks={weeklyStrengthCounts(data, now)} goal={goal} />

            {week.strength + week.short + week.mobility > 0 && <Encouragement />}

            <SessionHistory
              sessions={sessionHistory(data, weekStart, weekEnd)}
              emptyText="Cuando completes una rutina esta semana, aparecerá aquí."
            />
          </>
        )}

        {view === 'month' && (
          <>
            <Card as="section" className="space-y-4 p-5" aria-labelledby="month-title">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMonthOffset((offset) => offset - 1)}
                  aria-label="Mes anterior"
                  className="inline-flex size-11 items-center justify-center rounded-full transition hover:bg-bloom-50"
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <h2 id="month-title" className="font-bold" aria-live="polite">
                  {monthLabel(shown.getFullYear(), shown.getMonth())}
                </h2>
                <button
                  type="button"
                  onClick={() => setMonthOffset((offset) => offset + 1)}
                  disabled={monthOffset >= 0}
                  aria-label="Mes siguiente"
                  className="inline-flex size-11 items-center justify-center rounded-full transition hover:bg-bloom-50 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </div>
              <ActivityCalendar
                rows={monthGrid(shown.getFullYear(), shown.getMonth())}
                activity={activity}
                today={today}
                label={`Actividad de ${monthLabel(shown.getFullYear(), shown.getMonth())}`}
              />
              <ActivityLegend />
            </Card>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={Dumbbell} tone="lavender" value={String(month.strength)} label="Rutinas A, B o C" />
              <StatCard icon={Timer} tone="rose" value={String(month.short)} label="Rutinas cortas" />
              <StatCard icon={Flower2} tone="sage" value={String(month.mobility)} label="Movilidad" />
              <StatCard icon={Moon} tone="lavender" value={String(month.restDays)} label="Descansos marcados" />
            </div>

            <SessionHistory
              sessions={sessionHistory(data, monthStart, monthEnd)}
              emptyText="No hay entrenamientos registrados en este mes."
            />
          </>
        )}

        {view === 'total' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Dumbbell} tone="lavender" value={String(total.strength + total.short)} label="Sesiones de fuerza" />
              <StatCard icon={Flower2} tone="sage" value={String(total.mobility)} label="Sesiones de movilidad" />
              <StatCard icon={Clock} tone="peach" value={`${total.minutes}`} label="Minutos en movimiento" />
              <StatCard
                icon={CalendarCheck}
                tone="sky"
                value={
                  firstSession
                    ? new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' })
                        .format(parseISODate(firstSession))
                        .replace('.', '')
                    : '—'
                }
                label="Primera sesión"
              />
            </div>

            {hasAnySession && <Encouragement />}

            <SessionHistory
              sessions={sessionHistory(data)}
              emptyText="Cuando completes tu primera rutina, tu historial empezará aquí."
            />
          </>
        )}
      </div>
    </div>
  )
}
