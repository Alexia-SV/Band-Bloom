import { createContext } from 'react'
import type { LoadProblem } from '../lib/storage'
import type { AppData, ISODate, PlanSlot, RoutineId, UserPreferences, WeekdayKey } from '../types'

export interface AppDataContextValue {
  data: AppData
  loadProblem: LoadProblem
  saveFailed: boolean
  markRestDay: (date: ISODate) => void
  clearRestDay: (date: ISODate) => void
  updatePreferences: (patch: Partial<Pick<UserPreferences, 'name' | 'weeklyStrengthGoal' | 'preferredSession'>>) => void
  setPlanDay: (day: WeekdayKey, slot: PlanSlot) => void
  resetPlan: () => void
  toggleFavorite: (routineId: RoutineId) => void
  addNote: (text: string) => void
  deleteNote: (id: string) => void
  /** Borra historial, notas y ajustes de este dispositivo. */
  resetAllData: () => void
}

export const AppDataContext = createContext<AppDataContextValue | null>(null)
