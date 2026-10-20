import { CircleCheck, Download, Trash, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { APP_NAME, APP_VERSION } from '../../data/app'
import { toISODate } from '../../lib/dates'
import { downloadFile } from '../../lib/download'
import { useAppData } from '../../state/useAppData'

type ExportStatus = 'idle' | 'done' | 'error'

export function DataScreen() {
  const { data, resetAllData } = useAppData()
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle')
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  const completed = data.sessions.filter((session) => session.status === 'completed').length

  function exportJson() {
    try {
      const payload = { app: APP_NAME, version: APP_VERSION, exportedAt: new Date().toISOString(), data }
      downloadFile(`band-and-bloom-${toISODate(new Date())}.json`, JSON.stringify(payload, null, 2), 'application/json')
      setExportStatus('done')
    } catch {
      setExportStatus('error')
    }
  }

  return (
    <div className="space-y-5">
      <ScreenHeader title="Mis datos" subtitle="Todo se guarda solo en este dispositivo." backTo={{ name: 'more' }} />

      <Card as="section" className="p-5" aria-labelledby="data-summary-title">
        <h2 id="data-summary-title" className="font-bold">
          Lo que hay guardado
        </h2>
        <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Rutinas completadas', value: completed },
            { label: 'Descansos marcados', value: data.restDays.length },
            { label: 'Notas', value: data.notes.length },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-bloom-50 p-3">
              <dt className="text-xs text-ink-500">{item.label}</dt>
              <dd className="text-2xl font-bold">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card as="section" className="p-5" aria-labelledby="export-title">
        <h2 id="export-title" className="font-bold">
          Exportar respaldo
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Descarga un archivo JSON con tu historial, notas y ajustes. Guárdalo donde quieras como respaldo.
        </p>
        <button
          type="button"
          onClick={exportJson}
          className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-bloom-600 px-5 font-semibold text-white shadow-lift transition hover:bg-bloom-700"
        >
          <Download size={18} aria-hidden="true" />
          Descargar mis datos
        </button>
        <p role="status" className="mt-3 text-sm">
          {exportStatus === 'done' && (
            <span className="inline-flex items-center gap-1.5 text-sage-700">
              <CircleCheck size={16} aria-hidden="true" /> Listo. Revisa tus descargas.
            </span>
          )}
          {exportStatus === 'error' && (
            <span className="text-rose-700">No se pudo crear el archivo en este navegador. Intenta desde otro navegador.</span>
          )}
        </p>
      </Card>

      <Card tone="rose" as="section" className="p-5" aria-labelledby="reset-title">
        <h2 id="reset-title" className="flex items-center gap-2 font-bold">
          <TriangleAlert size={20} className="text-rose-700" aria-hidden="true" />
          Borrar todos mis datos
        </h2>
        <p className="mt-1 text-sm text-ink-700">
          Elimina tu historial, notas, descansos y ajustes de este dispositivo. No se puede deshacer, así que te
          recomendamos exportar un respaldo antes.
        </p>
        {confirmingReset ? (
          <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-rose-200" role="group" aria-labelledby="reset-confirm">
            <p id="reset-confirm" className="font-semibold">
              ¿Borrar todo? Esta acción no se puede deshacer.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="min-h-11 rounded-full px-4 font-semibold text-ink-700 ring-1 ring-ink-200 hover:bg-ink-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllData()
                  setConfirmingReset(false)
                  setResetDone(true)
                  setExportStatus('idle')
                }}
                className="min-h-11 rounded-full bg-rose-700 px-4 font-semibold text-white hover:bg-rose-500"
              >
                Sí, borrar todo
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setConfirmingReset(true)
              setResetDone(false)
            }}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-50"
          >
            <Trash size={18} aria-hidden="true" />
            Borrar datos…
          </button>
        )}
        <p role="status" className="mt-3 text-sm text-ink-700">
          {resetDone && 'Listo. La app quedó como nueva.'}
        </p>
      </Card>
    </div>
  )
}
