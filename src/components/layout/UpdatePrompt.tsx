import { CircleCheck, RefreshCw, X } from 'lucide-react'
import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Avisos de la app instalada: cuando queda lista para usarse sin internet y cuando hay
 * una versión nueva. La nueva versión se aplica al tocar "Actualizar", nunca a medio entrenamiento.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW()

  // "Lista sin internet" solo se muestra un momento.
  useEffect(() => {
    if (!offlineReady) return
    const timer = window.setTimeout(() => setOfflineReady(false), 4000)
    return () => window.clearTimeout(timer)
  }, [offlineReady, setOfflineReady])

  if (!needRefresh && !offlineReady) return null

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-bloom-900 p-3 pl-4 text-sm text-white shadow-lift md:bottom-6"
    >
      {needRefresh ? (
        <>
          <span className="flex-1">Hay una versión nueva de la app.</span>
          <button
            type="button"
            onClick={() => void updateServiceWorker()}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white px-4 font-semibold text-bloom-900 transition hover:bg-bloom-50"
          >
            <RefreshCw size={16} aria-hidden="true" /> Actualizar
          </button>
          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            aria-label="Más tarde"
            className="inline-flex size-10 items-center justify-center rounded-full transition hover:bg-white/10"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </>
      ) : (
        <span className="inline-flex items-center gap-2">
          <CircleCheck size={18} className="text-sage-200" aria-hidden="true" /> Lista para usarse sin internet.
        </span>
      )}
    </div>
  )
}
