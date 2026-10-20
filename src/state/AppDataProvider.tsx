import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DEFAULT_WEEKLY_PLAN } from '../data/weeklyPlan'
import { toISODate } from '../lib/dates'
import { createId } from '../lib/id'
import { MAX_TRAINING_DAYS, planFromTrainingDays } from '../lib/onboarding'
import { clearAllAppData, createDefaultAppData, loadAppData, saveAppData } from '../lib/storage'
import type { AppData, ISODate, PlanSlot, RoutineId, WeekdayKey } from '../types'
import { AppDataContext, type AppDataContextValue, type OnboardingChoices } from './appDataContext'

export function AppDataProvider({ children }: { children: ReactNode }) {
  // Se lee una sola vez al iniciar (inicializador perezoso).
  const [initial] = useState(loadAppData)
  const [data, setData] = useState<AppData>(initial.data)
  const [saveFailed, setSaveFailed] = useState(false)
  const skipNextSave = useRef(true)

  useEffect(() => {
    // No reescribimos en el primer render: los datos acaban de leerse.
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    setSaveFailed(!saveAppData(data))
  }, [data])

  const markRestDay = useCallback((date: ISODate) => {
    setData((current) =>
      current.restDays.includes(date) ? current : { ...current, restDays: [...current.restDays, date] },
    )
  }, [])

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
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
