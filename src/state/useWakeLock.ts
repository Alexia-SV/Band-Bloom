import { useEffect } from 'react'

/** Mantiene la pantalla encendida mientras `active` sea true, si el navegador lo permite. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false
    navigator.wakeLock
      .request('screen')
      .then((sentinel) => {
        if (cancelled) void sentinel.release()
        else lock = sentinel
      })
      .catch(() => {
        // Sin permiso o sin soporte: todo funciona igual.
      })
    return () => {
      cancelled = true
      void lock?.release()
    }
  }, [active])
}
