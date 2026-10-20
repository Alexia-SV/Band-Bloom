import { WEEK_ORDER, WEEKDAY_INITIAL, WEEKDAY_NAME } from '../../lib/dates'
import { cn } from '../../lib/tones'
import type { WeekdayKey } from '../../types'

interface DayPickerProps {
  label: string
  value: WeekdayKey[]
  onChange: (days: WeekdayKey[]) => void
  /** Máximo de días seleccionables (opcional). */
  max?: number
}

/** Siete botones L–D que se activan y desactivan. Cada uno anuncia su estado con aria-pressed. */
export function DayPicker({ label, value, onChange, max }: DayPickerProps) {
  function toggle(day: WeekdayKey) {
    if (value.includes(day)) onChange(value.filter((d) => d !== day))
    else if (max === undefined || value.length < max) onChange(WEEK_ORDER.filter((d) => d === day || value.includes(d)))
  }

  return (
    <div role="group" aria-label={label} className="grid grid-cols-7 gap-1.5">
      {WEEK_ORDER.map((day) => {
        const selected = value.includes(day)
        const blocked = !selected && max !== undefined && value.length >= max
        return (
          <button
            key={day}
            type="button"
            aria-pressed={selected}
            aria-label={WEEKDAY_NAME[day]}
            aria-disabled={blocked || undefined}
            onClick={() => toggle(day)}
            className={cn(
              'flex aspect-square min-h-11 items-center justify-center rounded-2xl text-base font-bold ring-1 transition-colors',
              selected ? 'bg-bloom-600 text-white ring-bloom-600 shadow-lift' : 'bg-white text-ink-700 ring-ink-200 hover:bg-bloom-50',
              blocked && 'opacity-40',
            )}
          >
            {WEEKDAY_INITIAL[day]}
          </button>
        )
      })}
    </div>
  )
}
