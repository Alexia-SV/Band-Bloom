import { Info, Minus, Plus, RotateCcw } from 'lucide-react'
import { SecondaryButton } from '../../components/ui/Buttons'
import { Card } from '../../components/ui/Card'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { getRoutine, routineTitle } from '../../data/routines'
import { capitalize, WEEK_ORDER, WEEKDAY_NAME } from '../../lib/dates'
import { useAppData } from '../../state/useAppData'
import type { PlanSlot } from '../../types'

/** Valor del <select> para cada tipo de día. */
type SlotValue = 'a' | 'b' | 'c' | 'mobility-optional' | 'rest'

const OPTIONS: Array<{ value: SlotValue; label: string }> = [
  { value: 'a', label: routineTitle(getRoutine('a')) },
  { value: 'b', label: routineTitle(getRoutine('b')) },
  { value: 'c', label: routineTitle(getRoutine('c')) },
  { value: 'mobility-optional', label: 'Movilidad opcional' },
  { value: 'rest', label: 'Descanso' },
]

function slotToValue(slot: PlanSlot): SlotValue {
  return slot.type === 'strength' ? slot.routineId : slot.type
}

function valueToSlot(value: SlotValue): PlanSlot {
  if (value === 'a' || value === 'b' || value === 'c') return { type: 'strength', routineId: value }
  return { type: value }
}

const MIN_GOAL = 1
const MAX_GOAL = 6

export function ScheduleScreen() {
  const { data, setPlanDay, resetPlan, updatePreferences } = useAppData()
  const { plan, weeklyStrengthGoal } = data.preferences
  const strengthDays = WEEK_ORDER.filter((day) => plan[day].type === 'strength')
  // ¿Hay dos días de fuerza seguidos? (incluye domingo → lunes)
  const hasBackToBack = WEEK_ORDER.some(
    (day, i) => plan[day].type === 'strength' && plan[WEEK_ORDER[(i + 1) % 7]].type === 'strength',
  )

  return (
    <div className="space-y-5">
      <ScreenHeader
        title="Horario de entrenamiento"
        subtitle="Elige qué toca cada día. Tu historial no cambia."
        backTo={{ name: 'more' }}
      />

      <Card as="section" className="p-5" aria-labelledby="plan-title">
        <h2 id="plan-title" className="font-bold">
          Mi semana
        </h2>
        <ul className="mt-3 divide-y divide-ink-100">
          {WEEK_ORDER.map((day) => {
            const id = `plan-${day}`
            return (
              <li key={day} className="flex items-center justify-between gap-3 py-2.5">
                <label htmlFor={id} className="font-medium">
                  {capitalize(WEEKDAY_NAME[day])}
                </label>
                <select
                  id={id}
                  value={slotToValue(plan[day])}
                  onChange={(event) => setPlanDay(day, valueToSlot(event.target.value as SlotValue))}
                  className="min-h-11 w-48 max-w-[60%] rounded-xl bg-bloom-50 px-3 text-sm font-medium text-ink-900 ring-1 ring-bloom-200 sm:w-60"
                >
                  {OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </li>
            )
          })}
        </ul>
        <SecondaryButton onClick={resetPlan} icon={RotateCcw} className="-ml-4 mt-2">
          Volver al plan recomendado
        </SecondaryButton>
      </Card>

      {hasBackToBack && (
        <Card tone="peach" className="flex gap-3 p-4" >
          <Info size={20} className="mt-0.5 shrink-0 text-peach-700" aria-hidden="true" />
          <p className="text-sm text-ink-700">
            Tienes días de fuerza seguidos. Funciona, pero dejar un día de descanso entre sesiones ayuda a que tus músculos
            se recuperen, sobre todo al empezar.
          </p>
        </Card>
      )}

      <Card as="section" className="p-5" aria-labelledby="goal-title">
        <h2 id="goal-title" className="font-bold">
          Meta semanal de fuerza
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Cuántas sesiones de fuerza quieres hacer por semana. La rutina corta también cuenta. Tienes{' '}
          {strengthDays.length} {strengthDays.length === 1 ? 'día' : 'días'} de fuerza en tu plan.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => updatePreferences({ weeklyStrengthGoal: weeklyStrengthGoal - 1 })}
            disabled={weeklyStrengthGoal <= MIN_GOAL}
            aria-label="Bajar meta"
            className="inline-flex size-11 items-center justify-center rounded-full bg-bloom-100 text-bloom-700 transition hover:bg-bloom-200 disabled:opacity-40"
          >
            <Minus size={20} aria-hidden="true" />
          </button>
          <p className="min-w-24 text-center" aria-live="polite">
            <span className="text-3xl font-bold">{weeklyStrengthGoal}</span>{' '}
            <span className="text-sm text-ink-500">{weeklyStrengthGoal === 1 ? 'sesión' : 'sesiones'}</span>
          </p>
          <button
            type="button"
            onClick={() => updatePreferences({ weeklyStrengthGoal: weeklyStrengthGoal + 1 })}
            disabled={weeklyStrengthGoal >= MAX_GOAL}
            aria-label="Subir meta"
            className="inline-flex size-11 items-center justify-center rounded-full bg-bloom-100 text-bloom-700 transition hover:bg-bloom-200 disabled:opacity-40"
          >
            <Plus size={20} aria-hidden="true" />
          </button>
        </div>
      </Card>

      <p className="text-center text-sm text-ink-500">Los cambios se guardan automáticamente en este dispositivo.</p>
    </div>
  )
}
