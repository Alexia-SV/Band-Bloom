import { Check, Leaf, Moon } from 'lucide-react'
import { getRoutine } from '../../data/routines'
import { parseISODate, WEEKDAY_INITIAL, WEEKDAY_NAME } from '../../lib/dates'
import type { DayStatus } from '../../lib/recommendation'
import { cn } from '../../lib/tones'

function describeDay(day: DayStatus): string {
  const parts = [`${WEEKDAY_NAME[day.weekday]} ${parseISODate(day.date).getDate()}`]
  if (day.isToday) parts.push('hoy')
  if (day.slot.type === 'strength') parts.push(`rutina ${getRoutine(day.slot.routineId).letter} planeada`)
  else if (day.slot.type === 'mobility-optional') parts.push('movilidad opcional')
  else parts.push('descanso')
  if (day.strengthDone) parts.push('entrenamiento completado')
  if (day.mobilityDone) parts.push('movilidad completada')
  if (day.restMarked) parts.push('marcado como descanso')
  return parts.join(', ')
}

function DayMarker({ day }: { day: DayStatus }) {
  if (day.strengthDone) {
    return (
      <span className="flex size-5 items-center justify-center rounded-full bg-sage-500 text-white">
        <Check size={12} strokeWidth={3} />
      </span>
    )
  }
  if (day.mobilityDone) return <Leaf size={16} className={day.isToday ? 'text-sage-200' : 'text-sage-600'} />
  if (day.restMarked) return <Moon size={15} className={day.isToday ? 'text-bloom-200' : 'text-bloom-500'} />
  if (day.slot.type === 'strength') {
    return (
      <span className={cn('text-[11px] font-bold', day.isToday ? 'text-bloom-100' : 'text-bloom-500')}>
        {getRoutine(day.slot.routineId).letter}
      </span>
    )
  }
  return <span className={cn('size-1.5 rounded-full', day.isToday ? 'bg-bloom-200' : 'bg-ink-200')} />
}

export function WeekStrip({ week }: { week: DayStatus[] }) {
  return (
    <ol aria-label="Tu semana" className="grid grid-cols-7 gap-1.5">
      {week.map((day) => (
        <li
          key={day.date}
          aria-label={describeDay(day)}
          aria-current={day.isToday ? 'date' : undefined}
          className={cn(
            'flex flex-col items-center gap-1 rounded-2xl py-2 ring-1 transition-colors',
            day.isToday ? 'bg-bloom-800 text-white ring-bloom-800 shadow-lift' : 'bg-white/80 text-ink-700 ring-ink-200/60',
          )}
        >
          <span aria-hidden="true" className={cn('text-[11px] font-semibold', day.isToday ? 'text-bloom-200' : 'text-ink-400')}>
            {WEEKDAY_INITIAL[day.weekday]}
          </span>
          <span aria-hidden="true" className="text-base font-bold leading-none">
            {parseISODate(day.date).getDate()}
          </span>
          <span aria-hidden="true" className="flex h-5 items-center justify-center">
            <DayMarker day={day} />
          </span>
        </li>
      ))}
    </ol>
  )
}
