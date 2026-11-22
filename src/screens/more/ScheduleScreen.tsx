import { CalendarHeart, Info, Minus, Plus, RotateCcw } from 'lucide-react'
import { SecondaryButton } from '../../components/ui/Buttons'
import { Card } from '../../components/ui/Card'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { getRoutine, isStrengthRoutineId, routineTitle, STRENGTH_ROTATION } from '../../data/routines'
import { DAILY_WEEKLY_GOAL, DAILY_WEEKLY_PLAN } from '../../data/weeklyPlan'
import { capitalize, WEEK_ORDER, WEEKDAY_NAME } from '../../lib/dates'
import { useAppData } from '../../state/useAppData'
import type { PlanSlot, StrengthRoutineId, WeekdayKey, WeeklyPlan } from '../../types'

/** Valor del <select> para cada tipo de día. */
type SlotValue = StrengthRoutineId | 'mobility-optional' | 'rest'

const OPTIONS: Array<{ value: SlotValue; label: string }> = [
  ...[...STRENGTH_ROTATION].sort().map((id) => ({ value: id, label: routineTitle(getRoutine(id)) })),
  { value: 'mobility-optional', label: 'Movilidad opcional' },
  { value: 'rest', label: 'Descanso' },
]

/** ¿Estos dos días trabajan el mismo grupo? (cuerpo completo choca con piernas y con tren superior). */
function sameGroup(a: PlanSlot, b: PlanSlot): boolean {
  if (a.type !== 'strength' || b.type !== 'strength') return false
  const fa = getRoutine(a.routineId).focus
  const fb = getRoutine(b.routineId).focus
  if (fa === fb) return fa !== 'cardio'
  const pair = new Set([fa, fb])
  return pair.has('full') && (pair.has('legs') || pair.has('upper'))
}

/** Pares de días seguidos que repiten grupo (incluye domingo → lunes). */
function repeatedDays(plan: WeeklyPlan): Array<[WeekdayKey, WeekdayKey]> {
  return WEEK_ORDER.flatMap((day, i): Array<[WeekdayKey, WeekdayKey]> => {
    const next = WEEK_ORDER[(i + 1) % 7]
    return sameGroup(plan[day], plan[next]) ? [[day, next]] : []
  })
}

const isDailyPlan = (plan: WeeklyPlan) =>
  WEEK_ORDER.every((day) => JSON.stringify(plan[day]) === JSON.stringify(DAILY_WEEKLY_PLAN[day]))

function slotToValue(slot: PlanSlot): SlotValue {
  return slot.type === 'strength' ? slot.routineId : slot.type
}

function valueToSlot(value: SlotValue): PlanSlot {
  if (isStrengthRoutineId(value)) return { type: 'strength', routineId: value }
  return { type: value as 'mobility-optional' | 'rest' }
}

const MIN_GOAL = 1
const MAX_GOAL = 6

export function ScheduleScreen() {
  const { data, setPlanDay, resetPlan, updatePreferences } = useAppData()
  const { plan, weeklyStrengthGoal } = data.preferences
  const strengthDays = WEEK_ORDER.filter((day) => plan[day].type === 'strength')
  const repeated = repeatedDays(plan)
  const useDailyPlan = () => {
    for (const day of WEEK_ORDER) setPlanDay(day, DAILY_WEEKLY_PLAN[day])
    updatePreferences({ weeklyStrengthGoal: DAILY_WEEKLY_GOAL })
  }

  return (
    <div className="space-y-5">
      <ScreenHeader
        title="Horario de entrenamiento"
        subtitle="Elige qué toca cada día. Tu historial no cambia."
        backTo={{ name: 'more' }}
      />

      {!isDailyPlan(plan) && (
        <Card tone="lavender" as="section" className="p-5" aria-labelledby="daily-title">
          <h2 id="daily-title" className="flex items-center gap-2 font-bold">
            <CalendarHeart size={20} aria-hidden="true" /> ¿Entrenas todos los días?
          </h2>
          <p className="mt-1 text-sm text-ink-700">
            Plan diario: piernas, tren superior, cardio, cuerpo completo, core y glúteos, y movilidad el domingo. Nunca
            repite el mismo grupo dos días seguidos, así tus músculos descansan aunque tú no pares.
          </p>
          <button
            type="button"
            onClick={useDailyPlan}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-bloom-600 px-5 text-sm font-bold text-white transition hover:bg-bloom-700"
          >
            Usar el plan diario
          </button>
        </Card>
      )}

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

      {repeated.length > 0 && (
        <Card tone="peach" className="flex gap-3 p-4">
          <Info size={20} className="mt-0.5 shrink-0 text-peach-700" aria-hidden="true" />
          <p className="text-sm text-ink-700">
            El {WEEKDAY_NAME[repeated[0][0]]} y el {WEEKDAY_NAME[repeated[0][1]]} trabajas el mismo grupo muscular. Mejor
            alterna (por ejemplo, piernas un día y tren superior o cardio al siguiente) para que se recupere.
          </p>
        </Card>
      )}

      <Card as="section" className="p-5" aria-labelledby="goal-title">
        <h2 id="goal-title" className="font-bold">
          Meta semanal de entrenamiento
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Cuántas sesiones quieres hacer por semana (cardio y rutina corta también cuentan). Tienes{' '}
          {strengthDays.length} {strengthDays.length === 1 ? 'día' : 'días'} de entrenamiento en tu plan.
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

      <p className="text-center text-sm text-ink-500">Los cambios se guardan automáticamente.</p>
    </div>
  )
}
