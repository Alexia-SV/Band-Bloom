import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DEFAULT_WEEKLY_PLAN } from '../data/weeklyPlan'
import { deleteCloudData, fetchCloud, markExerciseInMiSemana, pushDatos, pushSessions, unmarkRestInMiSemana } from '../lib/cloud'
import { dayOf, toISODate } from '../lib/dates'
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
import { chooseMergeMode, mergeCloud } from '../lib/sync'
import type { AppData, ISODate, PlanSlot, RoutineId, WeekdayKey, WorkoutSession } from '../types'
import { AppDataContext, type AccountState, type AppDataContextValue, type OnboardingChoices } from './appDataContext'

/** Hay cambios de este dispositivo que todavía no llegan a la nube. */
const DIRTY_KEY = `${STORAGE_KEY}:pendiente-nube`
/**
 * Cuenta a la que pertenecen los datos de este dispositivo. No se borra al salir de la cuenta:
 * así, si después entra otra cuenta, no se le copian datos ajenos.
 */
const LINKED_KEY = `${STORAGE_KEY}:cuenta`
/** Último "Borrar todo" que este dispositivo ya aplicó (para no revivir lo borrado en otro dispositivo). */
const RESET_SEEN_KEY = `${STORAGE_KEY}:borrado`
/** "Borrar todo" que no se pudo hacer en la nube (sin internet); se termina en la próxima sincronización. */
const RESET_PENDING_KEY = `${STORAGE_KEY}:borrado-pendiente`
/** Marcas para Mi Semana que no se pudieron enviar (sin internet); se reintentan al sincronizar. */
const MARKS_KEY = `${STORAGE_KEY}:mi-semana-pendiente`

type MiSemanaMark = { day: ISODate; kind: 'done' | 'rest' | 'unrest' }

function readMarks(): MiSemanaMark[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(MARKS_KEY) ?? '[]')
    return Array.isArray(value) ? (value as MiSemanaMark[]) : []
  } catch {
    return []
  }
}

function writeMarks(marks: MiSemanaMark[]): void {
  writeFlag(MARKS_KEY, marks.length ? JSON.stringify(marks) : null)
}

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
  /** Cuenta los cambios hechos aquí: solo se quita "pendiente" si no hubo otro cambio mientras se subía. */
  const changes = useRef(0)

  /** ¿Esta sesión es de la cuenta a la que pertenecen los datos de este dispositivo? */
  const ownAccount = () => userIdRef.current !== null && readFlag(LINKED_KEY) === userIdRef.current

  // Sube los ajustes a la nube; si no hay internet, quedan marcados para la próxima vez.
  const pushNow = useCallback(async (snapshot: AppData, change: number) => {
    const userId = userIdRef.current
    // Hasta que la primera sincronización junte los datos, no se sube nada (podría pisar la nube).
    if (!userId || !ownAccount()) return
    try {
      await pushDatos(userId, snapshot, readFlag(RESET_SEEN_KEY))
      if (changes.current === change) writeFlag(DIRTY_KEY, null)
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
    // Lo que acaba de llegar de la nube no se vuelve a subir.
    if (skipNextPush.current) {
      skipNextPush.current = false
      return
    }
    changes.current += 1
    // Con los datos ligados a una cuenta queda pendiente de subir, aunque ahorita no haya sesión
    // (por ejemplo, sin internet después de un rato): la próxima sincronización lo sube primero.
    if (readFlag(LINKED_KEY)) writeFlag(DIRTY_KEY, '1')
    if (!userIdRef.current) return
    const change = changes.current
    const timer = window.setTimeout(() => void pushNow(data, change), 800)
    return () => window.clearTimeout(timer)
  }, [data, pushNow])

  /** Envía a Mi Semana las marcas pendientes, en orden; las que fallan se quedan para la próxima. */
  const flushMarks = useCallback(async () => {
    if (!ownAccount()) return
    const marks = readMarks()
    while (marks.length) {
      const mark = marks[0]
      try {
        if (mark.kind === 'unrest') await unmarkRestInMiSemana(mark.day)
        else await markExerciseInMiSemana(mark.day, mark.kind)
      } catch {
        break
      }
      marks.shift()
      writeMarks(marks)
    }
  }, [])

  const sendMark = useCallback(
    (mark: MiSemanaMark) => {
      // Solo con los datos ligados a una cuenta: sin cuenta no hay Mi Semana que marcar.
      if (!readFlag(LINKED_KEY)) return
      writeMarks([...readMarks(), mark])
      void flushMarks()
    },
    [flushMarks],
  )

  /**
   * Trae la nube y la junta con este dispositivo (ver `chooseMergeMode`): la primera vez se suman los datos;
   * con cambios sin subir mandan los de aquí; después de un "Borrar todo" en otro dispositivo o con datos de
   * otra cuenta, solo cuenta la nube. Si cambias algo mientras sincroniza, tu cambio no se pierde.
   */
  const sync = useCallback(async () => {
    const userId = userIdRef.current
    if (!userId || syncing.current) return
    syncing.current = true
    setAccount((current) => ({ ...current, status: 'syncing' }))
    try {
      const startChange = changes.current
      const local = dataRef.current
      const linkedUser = readFlag(LINKED_KEY)

      // Un "Borrar todo" que se hizo sin internet se termina primero.
      const pendingReset = readFlag(RESET_PENDING_KEY)
      if (pendingReset && linkedUser === userId) {
        await deleteCloudData(userId)
        await pushDatos(userId, local, pendingReset)
        writeFlag(RESET_PENDING_KEY, null)
      }

      const cloud = await fetchCloud()
      let next: AppData | null = null
      if (!cloud) {
        // Primera vez en la nube. Si los datos de aquí son de otra cuenta, esta empieza de cero.
        const start = linkedUser !== null && linkedUser !== userId ? createDefaultAppData() : local
        await pushDatos(userId, start, null)
        await pushSessions(userId, start.sessions)
        if (start !== local) next = start
      } else {
        const mode = chooseMergeMode({
          linkedUser,
          userId,
          dirty: readFlag(DIRTY_KEY) !== null,
          cloudResetAt: cloud.resetAt,
          seenResetAt: readFlag(RESET_SEEN_KEY),
        })
        const { merged, missing } = mergeCloud(cloud.datos, cloud.sessions, local, mode)
        await pushSessions(userId, missing)
        next = sanitizeAppData(merged)
        if (cloud.resetAt) writeFlag(RESET_SEEN_KEY, cloud.resetAt)
        // Datos de la nube ilegibles: se reparan con los de aquí. Y si mandan los de aquí, se suben.
        if (!next) await pushDatos(userId, local, cloud.resetAt)
        else if (mode === 'first-link' || mode === 'local') await pushDatos(userId, next, cloud.resetAt)
      }

      writeFlag(LINKED_KEY, userId)
      if (next) {
        const fromCloud = next
        if (changes.current === startChange) {
          skipNextPush.current = true
          setData(fromCloud)
        } else {
          // Cambiaste algo mientras sincronizaba: se queda tu cambio (sube después) y solo se suman las sesiones.
          setData((current) => {
            const ids = new Set(current.sessions.map((s) => s.id))
            return { ...current, sessions: [...current.sessions, ...fromCloud.sessions.filter((s) => !ids.has(s.id))] }
          })
        }
      }
      if (changes.current === startChange) writeFlag(DIRTY_KEY, null)
      await flushMarks()
      setAccount((current) => ({ ...current, status: 'synced', lastSyncedAt: new Date().toISOString() }))
    } catch {
      setAccount((current) => ({ ...current, status: 'offline' }))
    } finally {
      syncing.current = false
    }
  }, [flushMarks])

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
    // TOKEN_REFRESHED también cuenta: es el aviso cuando la sesión vuelve después de estar sin internet.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        window.setTimeout(() => apply(session), 0)
      }
    })
    const onOnline = () => void sync()
    window.addEventListener('online', onOnline)
    return () => {
      listener.subscription.unsubscribe()
      window.removeEventListener('online', onOnline)
    }
  }, [sync])

  const markRestDay = useCallback(
    (date: ISODate) => {
      const isNew = !dataRef.current.restDays.includes(date)
      setData((current) =>
        current.restDays.includes(date) ? current : { ...current, restDays: [...current.restDays, date] },
      )
      // Con cuenta, el descanso de hoy también cuenta en Mi Semana (sin romper la racha); solo la primera vez.
      // Las dos apps cambian de día a las 4 a. m., así que es el mismo día en ambas.
      if (isNew && date === miSemanaDay(new Date())) sendMark({ day: date, kind: 'rest' })
    },
    [sendMark],
  )

  const clearRestDay = useCallback(
    (date: ISODate) => {
      const wasMarked = dataRef.current.restDays.includes(date)
      setData((current) => ({ ...current, restDays: current.restDays.filter((day) => day !== date) }))
      // "Cambié de opinión": también se deshace en Mi Semana.
      if (wasMarked && date === miSemanaDay(new Date())) sendMark({ day: date, kind: 'unrest' })
    },
    [sendMark],
  )

  const addSession = useCallback(
    (session: WorkoutSession) => {
      const isNew = !dataRef.current.sessions.some((existing) => existing.id === session.id)
      setData((current) => ({
        ...current,
        sessions: [...current.sessions.filter((existing) => existing.id !== session.id), session],
      }))
      // Palomear Mi Semana solo al guardar la sesión por primera vez (no al agregarle la nota).
      if (isNew && session.status === 'completed') sendMark({ day: miSemanaDay(new Date(session.endedAt)), kind: 'done' })
      const userId = userIdRef.current
      if (!userId || !ownAccount()) return
      // Si no hay internet, la sesión se queda aquí y la próxima sincronización la sube.
      void pushSessions(userId, [session]).catch(() => setAccount((current) => ({ ...current, status: 'offline' })))
    },
    [sendMark],
  )

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (!error) return null
    if (error.status === 400) return 'Correo o contraseña incorrectos.'
    if (error.status === 429) return 'Demasiados intentos. Espera unos minutos.'
    return 'No se pudo entrar. Revisa tu conexión.'
  }, [])

  // Los datos se quedan en el dispositivo y siguen ligados a esta cuenta (LINKED_KEY no se borra).
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const syncNow = useCallback(() => void sync(), [sync])

  const updatePreferences = useCallback<AppDataContextValue['updatePreferences']>((patch) => {
    setData((current) => {
      const preferences = { ...current.preferences, ...patch }
      // Al activar el plan para principiantes, sus dos semanas empiezan hoy.
      if (patch.beginnerPlan && !current.preferences.beginnerPlan) preferences.beginnerPlanStartedOn = toISODate(dayOf(new Date()))
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
          ...(choices.beginnerPlan ? { beginnerPlanStartedOn: toISODate(dayOf(new Date())) } : {}),
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

  /**
   * Con cuenta, también se borra la nube y queda una marca (`resetAt`) para que los otros dispositivos
   * no vuelvan a subir lo borrado. Sin internet, se termina en la próxima sincronización.
   */
  const resetAllData = useCallback(() => {
    const linkedUser = readFlag(LINKED_KEY)
    clearAllAppData()
    const fresh = createDefaultAppData()
    if (!linkedUser) {
      setData(fresh)
      return
    }
    const resetAt = new Date().toISOString()
    writeFlag(LINKED_KEY, linkedUser)
    writeFlag(RESET_SEEN_KEY, resetAt)
    writeFlag(RESET_PENDING_KEY, resetAt)
    // La nube se actualiza aquí abajo (primero borrar, luego subir), no con la subida automática.
    skipNextPush.current = true
    setData(fresh)
    const userId = userIdRef.current
    if (userId !== linkedUser) return
    void (async () => {
      try {
        await deleteCloudData(userId)
        await pushDatos(userId, fresh, resetAt)
        writeFlag(RESET_PENDING_KEY, null)
      } catch {
        setAccount((current) => ({ ...current, status: 'offline' }))
      }
    })()
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
