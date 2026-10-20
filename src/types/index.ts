/** Fecha local en formato 'YYYY-MM-DD' (sin hora ni zona horaria). */
export type ISODate = string

export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export type StrengthRoutineId = 'a' | 'b' | 'c'
export type RoutineId = StrengthRoutineId | 'short' | 'mobility'
export type RoutineKind = 'strength' | 'short' | 'mobility'

/** Color de acento de cada tarjeta, alineado con los tokens de diseño. */
export type Tone = 'peach' | 'lavender' | 'sky' | 'sage' | 'rose'

/** Qué toca un día de la semana según el plan. */
export type PlanSlot =
  | { type: 'strength'; routineId: StrengthRoutineId }
  | { type: 'mobility-optional' }
  | { type: 'rest' }

export type WeeklyPlan = Record<WeekdayKey, PlanSlot>

/** Versión mínima del ejercicio. En la Etapa 3 se agregan instrucciones, seguridad, variaciones, etc. */
export interface Exercise {
  id: string
  name: string
  nameEn?: string
}

export interface RoutineItem {
  exerciseId: string
  sets: number
  /** Objetivo legible: "8–12", "6–8 por lado", "1 min"… */
  target: string
}

export interface Routine {
  id: RoutineId
  kind: RoutineKind
  /** Letra que se muestra en las rutinas de fuerza (A, B, C). */
  letter?: string
  name: string
  durationLabel: string
  muscleGroups: string[]
  equipment: string[]
  tone: Tone
  items: RoutineItem[]
}

export interface CompletedSet {
  exerciseId: string
  setNumber: number
  completedAt: string
}

export interface WorkoutSession {
  id: string
  routineId: RoutineId
  date: ISODate
  startedAt: string
  endedAt: string
  /** Solo 'completed' cuenta como sesión terminada en el progreso. */
  status: 'completed' | 'ended-early'
  completedSets: CompletedSet[]
  note?: string
}

/** 'full' = rutinas de 15–25 min; 'short' = rutina corta de 10 min. */
export type PreferredSession = 'full' | 'short'

export interface UserPreferences {
  /** Opcional; solo se usa para el saludo. */
  name: string
  weeklyStrengthGoal: number
  plan: WeeklyPlan
  preferredSession: PreferredSession
  favoriteRoutineIds: RoutineId[]
}

export interface PersonalNote {
  id: string
  createdAt: string
  text: string
}

export interface AppData {
  version: 1
  preferences: UserPreferences
  sessions: WorkoutSession[]
  /** Días que la persona marcó como descanso. */
  restDays: ISODate[]
  notes: PersonalNote[]
}
