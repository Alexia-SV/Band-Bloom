import { Quote } from 'lucide-react'
import { useMemo } from 'react'
import { QuickAccess } from '../components/home/QuickAccess'
import { ReminderBanner } from '../components/home/ReminderBanner'
import { TodayCard } from '../components/home/TodayCard'
import { WeeklyProgressCard } from '../components/home/WeeklyProgressCard'
import { WeekStrip } from '../components/home/WeekStrip'
import { Card } from '../components/ui/Card'
import { Emoji } from '../components/ui/Emoji'
import { messageForDate } from '../data/messages'
import { formatLongDate, parseISODate, toISODate } from '../lib/dates'
import { buildDashboard } from '../lib/recommendation'
import { useAppData } from '../state/useAppData'
import { useNow } from '../state/useNow'

export function HomeScreen() {
  const { data, markRestDay, clearRestDay } = useAppData()
  const now = useNow()
  const today = toISODate(now)
  // `day` solo cambia cuando cambia la fecha, así no recalculamos cada minuto.
  const day = useMemo(() => parseISODate(today), [today])
  const summary = useMemo(() => buildDashboard(data, day), [data, day])
  const name = data.preferences.name.trim()

  return (
    <div className="space-y-5">
      <ReminderBanner />
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          Hola{name ? `, ${name}` : ''}
          <Emoji name="pink-heart" size={28} />
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-ink-500">
          Tu espacio para sentirte fuerte
          <Emoji name="seedling" size={20} />
        </p>
        <p className="mt-0.5 text-sm font-medium text-ink-700">{formatLongDate(day)}</p>
      </header>

      <WeekStrip week={summary.week} />

      <TodayCard
        summary={summary}
        now={day}
        onMarkRest={() => markRestDay(today)}
        onUndoRest={() => clearRestDay(today)}
      />

      <Card tone="lavender" as="figure" className="px-6 py-5 text-center">
        <Quote size={18} className="mx-auto mb-2 text-bloom-400" aria-hidden="true" />
        <blockquote className="text-[15px] leading-relaxed text-ink-700">{messageForDate(day)}</blockquote>
      </Card>

      <WeeklyProgressCard done={summary.strengthDoneThisWeek} goal={summary.weeklyGoal} />

      <QuickAccess />
    </div>
  )
}
