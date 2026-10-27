import { Plus, Trash } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { useAppData } from '../../state/useAppData'

const MAX_LENGTH = 1000

function formatNoteDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function NotesScreen() {
  const { data, addNote, deleteNote } = useAppData()
  const [draft, setDraft] = useState('')
  // Borrar pide confirmación en dos pasos: primero se marca, luego se confirma.
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!draft.trim()) return
    addNote(draft)
    setDraft('')
  }

  return (
    <div className="space-y-5">
      <ScreenHeader title="Notas personales" subtitle="Cómo te sientes, qué notaste, qué quieres recordar." backTo={{ name: 'more' }} />

      <Card as="section" className="p-5" aria-labelledby="new-note-title">
        <form onSubmit={onSubmit}>
          <h2 id="new-note-title" className="font-bold">
            <label htmlFor="new-note">Nueva nota</label>
          </h2>
          <textarea
            id="new-note"
            value={draft}
            maxLength={MAX_LENGTH}
            rows={4}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Por ejemplo: hoy las sentadillas se sintieron más fáciles."
            className="mt-3 w-full resize-y rounded-xl bg-bloom-50 p-4 text-base ring-1 ring-bloom-200 placeholder:text-ink-400"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-ink-500">
              {draft.length}/{MAX_LENGTH}
            </span>
            <button
              type="submit"
              disabled={!draft.trim()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bloom-600 px-5 font-semibold text-white shadow-lift transition hover:bg-bloom-700 disabled:bg-ink-200 disabled:text-ink-500 disabled:shadow-none"
            >
              <Plus size={18} aria-hidden="true" />
              Guardar nota
            </button>
          </div>
        </form>
      </Card>

      {data.notes.length === 0 ? (
        <EmptyState emoji="spiral-notepad" tone="peach" title="Aún no tienes notas">
          Tus notas se guardan en este dispositivo (y en tu cuenta, si entraste con Mi Semana).
        </EmptyState>
      ) : (
        <section aria-labelledby="notes-title" className="space-y-3">
          <h2 id="notes-title" className="font-bold">
            Mis notas
          </h2>
          <ul className="space-y-3">
            {data.notes.map((note) => (
              <li key={note.id}>
                <Card className="p-4">
                  <p className="whitespace-pre-wrap text-ink-900">{note.text}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <time dateTime={note.createdAt} className="text-xs text-ink-500">
                      {formatNoteDate(note.createdAt)}
                    </time>
                    {pendingDelete === note.id ? (
                      <span className="flex items-center gap-1" role="group" aria-label="Confirmar borrado">
                        <button
                          type="button"
                          onClick={() => setPendingDelete(null)}
                          className="min-h-10 rounded-full px-3 text-sm font-semibold text-ink-700 hover:bg-ink-100"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteNote(note.id)
                            setPendingDelete(null)
                          }}
                          className="min-h-10 rounded-full bg-rose-700 px-3 text-sm font-semibold text-white hover:bg-rose-500"
                        >
                          Sí, borrar
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPendingDelete(note.id)}
                        aria-label="Borrar nota"
                        className="inline-flex size-10 items-center justify-center rounded-full text-ink-500 transition hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Trash size={18} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
