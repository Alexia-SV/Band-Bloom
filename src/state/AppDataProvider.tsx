import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DEFAULT_WEEKLY_PLAN } from '../data/weeklyPlan'
import { deleteCloudData, fetchCloud, markExerciseInMiSemana, pushDatos, pushSessions } from '../lib/cloud'
import { toISODate } from '../lib/dates'
import { createId } from '../lib/id'
import { miSemanaDay } from '../lib/miSemana'
import { MAX_TRAINING_DAYS, planFromTrainingDays } from '../lib/onboarding'
import {
  clearAllAppData,
  createDefaultAppData,
  loadAppData,
  sanitizeAppData,
  saveAppData,
  STORAGE_KEY,
} from '../lib/storage'
import { supabase } from '../lib/supabase'
import { mergeCloud } from '../lib/sync'
import type { AppData, ISODate, PlanSlot, RoutineId, WeekdayKey, WorkoutSession } from '../types'
import { AppDataContext, type AccountState, type AppDataContextValue, type OnboardingChoices } from './appDataContext'

/** Hay cambios de este dispositivo que todavía no llegan a la nube. */
const DIRTY_KEY = `${STORAGE_KEY}:pendiente-nube`
/** Cuenta con la que este dispositivo ya se sincronizó (la primera vez se juntan los datos). */
const LINKED_KEY = `${STORAGE_KEY}:cuenta`

function readFlag(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeFlag(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Sin almacenamiento solo se pierde la marca; la próxima sincronización lo arregla.
  }
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  // Se lee una sola vez al iniciar (inicializador perezoso).
  const [initial] = useState(loadAppData)
  const [data, setData] = useState<AppData>(initial.data)
  const [saveFailed, setSaveFailed] = useState(false)
  const [account, setAccount] = useState<AccountState>({ email: null, status: 'local' })
  const skipNextSave = useRef(true)
  const skipNextPush = useRef(false)
  const dataRef = useRef(data)
  const userIdRef = useRef<string | null>(null)
  const syncing = useRef(false)

  // Sube los ajustes a la nube; si no hay internet, quedan marcados para la próxima vez.
  const pushNow = useCallback(async (snapshot: AppData) => {
    const userId = userIdRef.current
    if (!userId) return
    try {
      await pushDatos(userId, snapshot)
      writeFlag(DIRTY_KEY, null)
      setAccount((current) => ({ ...current, status: 'synced', lastSyncedAt: new Date().toISOString() }))
    } catch {
      setAccount((current) => ({ ...current, status: 'offline' }))
    }
  }, [])

  useEffect(() => {
    dataRef.current = data
    // No reescribimos en el primer render: los datos acaban de leerse.
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    setSaveFailed(!saveAppData(data))
    if (!userIdRef.current) return
    // Lo que acaba de llegar de la nube no se vuelve a subir.
    if (skipNextPush.current) {
      skipNextPush.current = false
      return
    }
    writeFlag(DIRTY_KEY, '1')
    const timer = window.setTimeout(() => void pushNow(data), 800)
    return () => window.clearTimeout(timer)
  }, [data, pushNow])

  /**
   * Trae la nube y la junta con este dispositivo. La primera vez que este dispositivo entra a la cuenta
   * se suman sus descansos, notas y sesiones a los de la nube; después, la nube manda.
   */
  const sync = useCallback(async () => {
    const userId = userIdRef.current
    if (!userId || syncing.current) return
    syncing.current = true
    setAccount((current) => ({ ...current, status: 'syncing' }))
    try {
      const local = dataRef.current
      const firstLink = readFlag(LINKED_KEY) !== userId
      if (!firstLink && readFlag(DIRTY_KEY)) await pushDatos(userId, local)
      const cloud = await fetchCloud()
      if (!cloud) {
        // Primera vez en la nube: se sube lo de este dispositivo.
        await pushDatos(userId, local)
        await pushSessions(userId, local.sessions)
      } else {
        const { merged, missing } = mergeCloud(cloud.datos, cloud.sessions, local, firstLink)
        await pushSessions(userId, missing)
        const next = sanitizeAppData(merged)
        if (next) {
          if (firstLink) await pushDatos(userId, next)
          skipNextPush.current = true
          setData(next)
        }
      }
      writeFlag(DIRTY_KEY, null)
      writeFlag(LINKED_KEY, userId)
      setAccount((current) => ({ ...current, status: 'synced', lastSyncedAt: new Date().toISOString() }))
    } catch {
      setAccount((current) => ({ ...current, status: 'offline' }))
    } finally {
      syncing.current = false
    }
  }, [])

  // Sesión de Supabase (la misma de Mi Semana) y reintento al volver el internet.
  useEffect(() => {
    const apply = (session: Session | null) => {
      userIdRef.current = session?.user.id ?? null
      if (session) {
        setAccount((current) => ({ ...current, email: session.user.email ?? null }))
        void sync()
      } else {
        setAccount({ email: null, status: 'local' })
      }
    }
    void supabase.auth.getSession().then(({ data: { session } }) => apply(session))
    // Diferido: llamar a Supabase dentro de este aviso puede bloquear la sesión.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') window.setTimeout(() => apply(session), 0)
    })
    const onOnline = () => void sync()
    window.addEventListener('online', onOnline)
    return () => {
      listener.subscription.unsubscribe()
      window.removeEventListener('online', onOnline)
    }
  }, [sync])

  const markRestDay = useCallback((date: ISODate) => {
    setData((current) =>
      current.restDays.includes(date) ? current : { ...current, restDays: [...current.restDays, date] },
    )
    // Con cuenta, el descanso de hoy también cuenta en Mi Semana (sin romper la racha).
    const now = new Date()
    if (userIdRef.current && date === toISODate(now)) {
      void markExerciseInMiSemana(miSemanaDay(now), 'rest').catch(() => {})
    }
  }, [])

  const addSession = useCallback((session: WorkoutSession) => {
    setData((current) => ({
      ...current,
      sessions: [...current.sessions.filter((existing) => existing.id !== session.id), session],
    }))
    const userId = userIdRef.current
    if (!userId) return
    // Si no hay internet, la sesión se queda aquí y la próxima sincronización la sube.
    void pushSessions(userId, [session]).catch(() => setAccount((current) => ({ ...current, status: 'offline' })))
    if (session.status === 'completed') {
      void markExerciseInMiSemana(miSemanaDay(new Date(session.endedAt)), 'done').catch(() => {})
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (!error) return null
    if (error.status === 400) return 'Correo o contraseña incorrectos.'
    if (error.status === 429) return 'Demasiados intentos. Espera unos minutos.'
    return 'No se pudo entrar. Revisa tu conexión.'
  }, [])

  const signOut = useCallback(async () => {
    writeFlag(LINKED_KEY, null)
    await supabase.auth.signOut()
  }, [])

  const syncNow = useCallback(() => void sync(), [sync])

  const clearRestDay = useCallback((date: ISODate) => {
    setData((current) => ({ ...current, restDays: current.restDays.filter((day) => day !== date) }))
  }, [])

  const updatePreferences = useCallback<AppDataContextValue['updatePreferences']>((patch) => {
    setData((current) => {
      const preferences = { ...current.preferences, ...patch }
      // Al activar el plan para principiantes, sus dos semanas empiezan hoy.
      if (patch.beginnerPlan && !current.preferences.beginnerPlan) preferences.beginnerPlanStartedOn = toISODate(new Date())
      return { ...current, preferences }
    })
  }, [])

  const updateReminders = useCallback<AppDataContextValue['updateReminders']>((patch) => {
    setData((current) => ({ ...current, reminders: { ...current.reminders, ...patch } }))
  }, [])

  const dismissReminder = useCallback((date: ISODate) => {
    setData((current) => ({ ...current, reminders: { ...current.reminders, lastDismissedOn: date } }))
  }, [])

  const completeOnboarding = useCallback((choices: OnboardingChoices) => {
    setData((current) => {
      const days = choices.trainingDays.slice(0, MAX_TRAINING_DAYS)
      return {
        ...current,
        preferences: {
          ...current.preferences,
          plan: days.length > 0 ? planFromTrainingDays(days) : current.preferences.plan,
          weeklyStrengthGoal: days.length > 0 ? days.length : current.preferences.weeklyStrengthGoal,
          preferredSession: choices.preferredSession,
          beginnerPlan: choices.beginnerPlan,
          ...(choices.beginnerPlan ? { beginnerPlanStartedOn: toISODate(new Date()) } : {}),
          onboardingCompleted: true,
        },
        reminders: { ...current.reminders, time: choices.reminderTime, enabled: choices.remindersEnabled },
      }
    })
  }, [])

  const restartOnboarding = useCallback(() => {
    setData((current) => ({ ...current, preferences: { ...current.preferences, onboardingCompleted: false } }))
  }, [])

  const setPlanDay = useCallback((day: WeekdayKey, slot: PlanSlot) => {
    setData((current) => ({
      ...current,
      preferences: { ...current.preferences, plan: { ...current.preferences.plan, [day]: slot } },
    }))
  }, [])

  const resetPlan = useCallback(() => {
    setData((current) => ({ ...current, preferences: { ...current.preferences, plan: { ...DEFAULT_WEEKLY_PLAN } } }))
  }, [])

  const toggleFavorite = useCallback((routineId: RoutineId) => {
    setData((current) => {
      const favorites = current.preferences.favoriteRoutineIds
      const next = favorites.includes(routineId)
        ? favorites.filter((id) => id !== routineId)
        : [...favorites, routineId]
      return { ...current, preferences: { ...current.preferences, favoriteRoutineIds: next } }
    })
  }, [])

  const addNote = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setData((current) => ({
      ...current,
      notes: [{ id: createId(), createdAt: new Date().toISOString(), text: trimmed }, ...current.notes],
    }))
  }, [])

  const deleteNote = useCallback((id: string) => {
    setData((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== id) }))
  }, [])

  const resetAllData = useCallback(() => {
    clearAllAppData()
    const userId = userIdRef.current
    if (userId) void deleteCloudData(userId).catch(() => setAccount((current) => ({ ...current, status: 'offline' })))
    setData(createDefaultAppData())
  }, [])

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      loadProblem: initial.problem,
      saveFailed,
      markRestDay,
      clearRestDay,
      updatePreferences,
      setPlanDay,
      resetPlan,
      toggleFavorite,
      addNote,
      deleteNote,
      updateReminders,
      dismissReminder,
      completeOnboarding,
      restartOnboarding,
      resetAllData,
      addSession,
      account,
      signIn,
      signOut,
      syncNow,
    }),
    [
      data,
      initial.problem,
      saveFailed,
      markRestDay,
      clearRestDay,
      updatePreferences,
      setPlanDay,
      resetPlan,
      toggleFavorite,
      addNote,
      deleteNote,
      updateReminders,
      dismissReminder,
      completeOnboarding,
      restartOnboarding,
      resetAllData,
      addSession,
      account,
      signIn,
      signOut,
      syncNow,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
