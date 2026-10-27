import { useId, useMemo, useState } from 'react'
import { RoutineCard } from '../components/routines/RoutineCard'
import { EmptyState } from '../components/ui/EmptyState'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { SegmentedTabs } from '../components/ui/SegmentedTabs'
import { getRoutine, ROUTINES } from '../data/routines'
import { capitalize, isInSameWeek, WEEK_ORDER, WEEKDAY_NAME } from '../lib/dates'
import { useAppData } from '../state/useAppData'
import { useDay } from '../state/useNow'
import type { RoutineId } from '../types'

type View = 'week' | 'all' | 'favorites'

const VIEWS: Array<{ value: View; label: string }> = [
  { value: 'week', label: 'Esta semana' },
  { value: 'all', label: 'Todas' },
  { value: 'favorites', label: 'Favoritas' },
]

export function RoutinesScreen() {
  const { data } = useAppData()
  const now = useDay()
  const [view, setView] = useState<View>('week')
  const panelId = useId()

  const doneThisWeek = useMemo(() => {
    const ids = new Set<RoutineId>()
    for (const session of data.sessions) {
      if (session.status === 'completed' && isInSameWeek(session.date, now)) ids.add(session.routineId)
    }
    return ids
  }, [data.sessions, now])

  // Días de fuerza del plan, en orden de la semana: "Lunes → A", "Miércoles → B"…
  const plannedDays = WEEK_ORDER.flatMap((day) => {
    const slot = data.preferences.plan[day]
    return slot.type === 'strength' ? [{ day, routineId: slot.routineId }] : []
  })
  const favorites = ROUTINES.filter((routine) => data.preferences.favoriteRoutineIds.includes(routine.id))

  return (
    <div className="space-y-5">
      <ScreenHeader title="Rutinas" subtitle="Elige una o deja que Inicio te sugiera la de hoy." />

      <SegmentedTabs label="Ver rutinas" options={VIEWS} value={view} onChange={setView} panelId={panelId} />

      <div id={panelId} role="tabpanel" aria-label={VIEWS.find((v) => v.value === view)?.label} className="space-y-4">
        {view === 'week' && (
          <>
            {plannedDays.map(({ day, routineId }) => (
              <RoutineCard
                key={day}
                routine={getRoutine(routineId)}
                eyebrow={capitalize(WEEKDAY_NAME[day])}
                doneThisWeek={doneThisWeek.has(routineId)}
              />
            ))}
            <RoutineCard routine={getRoutine('mobility')} eyebrow="Opcional · cualquier día" />
            <RoutineCard routine={getRoutine('short')} eyebrow="Para días con poco tiempo" />
          </>
        )}

        {view === 'all' && ROUTINES.map((routine) => <RoutineCard key={routine.id} routine={routine} />)}

        {view === 'favorites' &&
          (favorites.length > 0 ? (
            favorites.map((routine) => <RoutineCard key={routine.id} routine={routine} />)
          ) : (
            <EmptyState emoji="pink-heart" tone="rose" title="Aún no tienes favoritas">
              Toca el corazón de cualquier rutina para tenerla a la mano aquí.
            </EmptyState>
          ))}
      </div>
    </div>
  )
}
