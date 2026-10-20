import { useEffect, useState } from 'react'

/**
 * Fecha actual que se refresca cada minuto y al volver a la app,
 * para que "hoy" cambie solo si la app queda abierta pasada la medianoche.
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
