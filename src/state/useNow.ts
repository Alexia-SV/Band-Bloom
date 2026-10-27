import { useEffect, useMemo, useState } from 'react'
import { dayOf } from '../lib/dates'

/**
 * Fecha actual que se refresca cada minuto y al volver a la app,
 * para que "hoy" cambie solo si la app queda abierta pasado el cambio de día.
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const refresh = () => setNow(new Date())
    const interval = window.setInterval(refresh, 60_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return now
}

/** Como `useNow`, pero el día cambia a las 4 a. m. (igual que en Mi Semana). Úsalo para fechas, no para horas. */
export function useDay(): Date {
  const now = useNow()
  return useMemo(() => dayOf(now), [now])
}
