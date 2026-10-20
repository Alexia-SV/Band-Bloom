import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DEFAULT_WEEKLY_PLAN } from '../data/weeklyPlan'
import { createId } from '../lib/id'
import { clearAllAppData, createDefaultAppData, loadAppData, saveAppData } from '../lib/storage'
import type { AppData, ISODate, PlanSlot, RoutineId, WeekdayKey } from '../types'
import { AppDataContext, type AppDataContextValue } from './appDataContext'

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
    setData((current) => ({ ...current, preferences: { ...current.preferences, ...patch } }))
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
      resetAllData,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
