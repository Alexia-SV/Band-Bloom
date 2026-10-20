import { getRoutine, routineTitle } from '../../data/routines'
import { parseISODate } from '../../lib/dates'
import { sessionKind, sessionMinutes } from '../../lib/progress'
import type { WorkoutSession } from '../../types'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { ActivityMarker } from './ActivityMarker'

function formatDay(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
    .format(parseISODate(iso))
    .replaceAll('.', '')
}

interface SessionHistoryProps {
  sessions: WorkoutSession[]
  emptyText: string
}

export function SessionHistory({ sessions, emptyText }: SessionHistoryProps) {
  return (
    <section aria-labelledby="history-title" className="space-y-3">
      <h2 id="history-title" className="font-bold">
        Historial
      </h2>
      {sessions.length === 0 ? (
        <EmptyState emoji="spiral-notepad" title="Sin entrenamientos aquí">
          {emptyText}
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => {
            const minutes = sessionMinutes(session)
            const completed = session.status === 'completed'
            return (
              <li key={session.id}>
                <Card className="flex gap-3 p-4">
                  <ActivityMarker kind={completed ? sessionKind(session) : null} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="font-semibold">{routineTitle(getRoutine(session.routineId))}</p>
                      <p className="text-sm text-ink-500">{formatDay(session.date)}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-ink-700">
                      {completed ? 'Completada' : 'Terminada antes de tiempo'}
                      {minutes !== null && ` · ${minutes} min`}
                      {session.completedSets.length > 0 &&
                        ` · ${session.completedSets.length} ${session.completedSets.length === 1 ? 'serie' : 'series'}`}
                    </p>
                    {session.note && <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-sm italic text-ink-700">“{session.note}”</p>}
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
