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
  WorkoutSession,
} from '../types'

/**
 * Cuenta compartida con Mi Semana.
 * 'local': sin cuenta, todo en este dispositivo · 'syncing': sincronizando ·
 * 'synced': al día en la nube · 'offline': hay cambios esperando a que vuelva el internet.
 */
export type SyncStatus = 'local' | 'syncing' | 'synced' | 'offline'

export interface AccountState {
  email: string | null
  status: SyncStatus
  lastSyncedAt?: string
}

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
  /** Borra historial, notas y ajustes de este dispositivo (y de la nube si hay cuenta). */
  resetAllData: () => void
  /** Guarda una sesión de entrenamiento; si quedó completa, palomea el ejercicio en Mi Semana. */
  addSession: (session: WorkoutSession) => void
  account: AccountState
  /** Entra con la cuenta de Mi Semana. Devuelve un mensaje de error o null si salió bien. */
  signIn: (email: string, password: string) => Promise<string | null>
  /** Sale de la cuenta; tus datos se quedan en este dispositivo. */
  signOut: () => Promise<void>
  syncNow: () => void
}

export const AppDataContext = createContext<AppDataContextValue | null>(null)
