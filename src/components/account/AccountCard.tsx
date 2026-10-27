import { CircleCheck, CloudOff, LogIn, LogOut, RefreshCw } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAppData } from '../../state/useAppData'
import { Card } from '../ui/Card'

const INPUT = 'min-h-12 w-full rounded-xl bg-bloom-50 px-4 text-base ring-1 ring-bloom-200 placeholder:text-ink-400'
const PRIMARY =
  'inline-flex min-h-12 items-center gap-2 rounded-full bg-bloom-600 px-5 font-semibold text-white shadow-lift transition hover:bg-bloom-700 disabled:bg-ink-200 disabled:text-ink-500 disabled:shadow-none'
const GHOST =
  'inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 font-semibold text-ink-700 ring-1 ring-ink-200 transition hover:bg-ink-100'

function formatSyncTime(iso?: string): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit' }).format(new Date(iso))
}

/**
 * Cuenta compartida con Mi Semana: mismo correo y contraseña.
 * Con cuenta, los datos se guardan en la nube y "Hacer ejercicio" se palomea solo en Mi Semana.
 */
export function AccountCard() {
  const { account, signIn, signOut, syncNow } = useAppData()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(await signIn(email, password))
    setBusy(false)
    setPassword('')
  }

  if (account.email) {
    return (
      <Card as="section" className="p-5" aria-labelledby="account-title">
        <h2 id="account-title" className="font-bold">
          Cuenta de Mi Semana
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Conectada como <strong className="text-ink-700">{account.email}</strong>. Tus entrenamientos, notas y ajustes
          se guardan en la nube y los ves en todos tus dispositivos.
        </p>
        <p role="status" className="mt-3 flex items-center gap-1.5 text-sm font-semibold">
          {account.status === 'synced' && (
            <span className="inline-flex items-center gap-1.5 text-sage-700">
              <CircleCheck size={16} aria-hidden="true" /> Sincronizado
              {account.lastSyncedAt ? ` · ${formatSyncTime(account.lastSyncedAt)}` : ''}
            </span>
          )}
          {account.status === 'syncing' && (
            <span className="inline-flex items-center gap-1.5 text-ink-500">
              <RefreshCw size={16} className="motion-safe:animate-spin" aria-hidden="true" /> Sincronizando…
            </span>
          )}
          {account.status === 'offline' && (
            <span className="inline-flex items-center gap-1.5 text-rose-700">
              <CloudOff size={16} aria-hidden="true" /> Sin conexión: tus cambios se suben cuando vuelva el internet.
            </span>
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={syncNow} className={GHOST}>
            <RefreshCw size={18} aria-hidden="true" /> Sincronizar ahora
          </button>
          <button type="button" onClick={() => void signOut()} className={GHOST}>
            <LogOut size={18} aria-hidden="true" /> Salir de la cuenta
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-500">
          Al salir, tus datos se quedan en este dispositivo. También se cierra la sesión de Mi Semana en este navegador.
        </p>
      </Card>
    )
  }

  return (
    <Card as="section" className="p-5" aria-labelledby="account-title">
      <h2 id="account-title" className="font-bold">
        Conectar con Mi Semana
      </h2>
      <p className="mt-1 text-sm text-ink-500">
        Entra con el mismo correo y contraseña de Mi Semana. Tus datos se guardan en la nube, los ves en todos tus
        dispositivos y al terminar una rutina se palomea solo "Hacer ejercicio".
      </p>
      <form onSubmit={(event) => void submit(event)} className="mt-4 space-y-3">
        <label htmlFor="account-email" className="sr-only">
          Correo
        </label>
        <input
          id="account-email"
          type="email"
          required
          value={email}
          autoComplete="username"
          placeholder="tu@correo.com"
          onChange={(event) => setEmail(event.target.value)}
          className={INPUT}
        />
        <label htmlFor="account-password" className="sr-only">
          Contraseña
        </label>
        <input
          id="account-password"
          type="password"
          required
          value={password}
          autoComplete="current-password"
          placeholder="Contraseña"
          onChange={(event) => setPassword(event.target.value)}
          className={INPUT}
        />
        <button type="submit" disabled={busy} className={PRIMARY}>
          <LogIn size={18} aria-hidden="true" /> {busy ? 'Entrando…' : 'Entrar'}
        </button>
        <p role="alert" className="text-sm text-rose-700">
          {error}
        </p>
      </form>
    </Card>
  )
}
