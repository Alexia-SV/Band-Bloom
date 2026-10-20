import { createContext } from 'react'
import type { LoadProblem } from '../lib/storage'
import type {
  AppData,
  ISODate,
  PlanSlot,
  PreferredSession,
  ReminderSettings,
  RoutineId,
  TimeOfDay,
  UserPreferences,
  WeekdayKey,
} from '../types'

export interface OnboardingChoices {
  trainingDays: WeekdayKey[]
  reminderTime: TimeOfDay
  remindersEnabled: boolean
  preferredSession: PreferredSession
  beginnerPlan: boolean
}

export interface AppDataContextValue {
  data: AppData
  loadProblem: LoadProblem
  saveFailed: boolean
  markRestDay: (date: ISODate) => void
  clearRestDay: (date: ISODate) => void
  updatePreferences: (
    patch: Partial<Pick<UserPreferences, 'name' | 'weeklyStrengthGoal' | 'preferredSession' | 'beginnerPlan'>>,
  ) => void
  setPlanDay: (day: WeekdayKey, slot: PlanSlot) => void
  resetPlan: () => void
  toggleFavorite: (routineId: RoutineId) => void
  addNote: (text: string) => void
  deleteNote: (id: string) => void
  updateReminders: (patch: Partial<Omit<ReminderSettings, 'lastDismissedOn'>>) => void
  /** "Ahora no": oculta el aviso de hoy. */
  dismissReminder: (date: ISODate) => void
  completeOnboarding: (choices: OnboardingChoices) => void
  restartOnboarding: () => void
  /** Borra historial, notas y ajustes de este dispositivo. */
  resetAllData: () => void
}

export const AppDataContext = createContext<AppDataContextValue | null>(null)
