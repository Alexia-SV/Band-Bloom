import { useSyncExternalStore } from 'react'
import { isRoutineId } from '../data/routines'
import type { RoutineId } from '../types'

/** Subpantallas de "Más". La clave es el segmento de la URL (#/mas/ligas). */
export const MORE_SECTIONS = [
  'ligas',
  'horario',
  'preferencias',
  'recordatorios',
  'notas',
  'consejos',
  'preguntas',
  'datos',
  'acerca',
] as const
export type MoreSection = (typeof MORE_SECTIONS)[number]

function isMoreSection(value: string): value is MoreSection {
  return (MORE_SECTIONS as readonly string[]).includes(value)
}

/**
 * Router mínimo basado en el hash (#/rutinas). No requiere dependencias,
 * funciona sin servidor y el botón "atrás" del navegador funciona igual.
 */
export type Route =
  | { name: 'home' }
  | { name: 'routines' }
  | { name: 'progress' }
  | { name: 'more' }
  | { name: 'routine'; id: RoutineId }
  | { name: 'more-section'; section: MoreSection }

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  switch (parts[0]) {
    case undefined:
      return { name: 'home' }
    case 'rutinas':
      if (parts[1] && isRoutineId(parts[1])) return { name: 'routine', id: parts[1] }
      return { name: 'routines' }
    case 'progreso':
      return { name: 'progress' }
    case 'mas':
      if (parts[1] && isMoreSection(parts[1])) return { name: 'more-section', section: parts[1] }
      return { name: 'more' }
    default:
      return { name: 'home' }
  }
}

export function routeHref(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/'
    case 'routines':
      return '#/rutinas'
    case 'routine':
      return `#/rutinas/${route.id}`
    case 'progress':
      return '#/progreso'
    case 'more':
      return '#/mas'
    case 'more-section':
      return `#/mas/${route.section}`
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function getHash(): string {
  return window.location.hash
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash)
  return parseHash(hash)
}

export function navigate(route: Route): void {
  window.location.hash = routeHref(route)
}

/**
 * Regresa a la pantalla anterior si venimos de dentro de la app;
 * si la pantalla se abrió directo (por ejemplo, desde un enlace), va a `fallback`.
 */
export function goBack(fallback: Route): void {
  const state = window.history.state as { bbDepth?: number } | null
  if (state?.bbDepth && state.bbDepth > 0) window.history.back()
  else navigate(fallback)
}

/**
 * Lleva la cuenta de cuántas pantallas hemos avanzado dentro de la app,
 * guardándola en history.state, para que goBack sepa si puede regresar.
 */
export function trackHistoryDepth(): () => void {
  const initialState = window.history.state as { bbDepth?: number } | null
  let depth = initialState?.bbDepth ?? 0
  // Marcamos la entrada inicial para reconocerla al regresar a ella.
  if (typeof initialState?.bbDepth !== 'number') {
    window.history.replaceState({ ...(initialState ?? {}), bbDepth: depth }, '')
  }
  const onHashChange = () => {
    const state = window.history.state as { bbDepth?: number } | null
    if (typeof state?.bbDepth === 'number') {
      depth = state.bbDepth // Navegación atrás/adelante: ya tiene su profundidad.
    } else {
      depth += 1
      window.history.replaceState({ ...(state ?? {}), bbDepth: depth }, '')
    }
  }
  window.addEventListener('hashchange', onHashChange)
  return () => window.removeEventListener('hashchange', onHashChange)
}
