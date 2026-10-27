import { ShieldCheck, Sprout } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { APP_NAME, APP_VERSION } from '../../data/app'
import { ROUTINE_COVERS } from '../../data/covers'
import { ROUTINES, routineTitle } from '../../data/routines'

export function AboutScreen() {
  return (
    <div className="space-y-5">
      <ScreenHeader title="Sobre la app" backTo={{ name: 'more' }} />

      <Card tone="lavender" className="p-6 text-center">
        {/* BASE_URL es '/' en desarrollo y '/Band-Bloom/' en GitHub Pages. */}
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="mx-auto size-16" />
        <h2 className="mt-3 text-2xl font-bold">{APP_NAME}</h2>
        <p className="text-sm text-ink-500">Versión {APP_VERSION}</p>
        <p className="mx-auto mt-3 max-w-sm text-sm text-ink-700">
          Tu rutina de fuerza en casa con ligas: te dice qué toca hoy, cómo hacerlo y cuándo descansar. Sin presión.
        </p>
      </Card>

      <Card as="section" className="p-5" aria-labelledby="privacy-title">
        <h2 id="privacy-title" className="flex items-center gap-2 font-bold">
          <ShieldCheck size={20} className="text-sage-700" aria-hidden="true" />
          Privacidad
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-700">
          <li>Sin cuenta, tus entrenamientos, notas y ajustes se guardan solo en este dispositivo.</li>
          <li>
            Si entras con tu cuenta de Mi Semana, se guardan en tu base de datos de Supabase y solo tú puedes verlos.
          </li>
          <li>La app no usa analíticas ni comparte tus datos con nadie.</li>
        </ul>
      </Card>

      <Card as="section" className="p-5" aria-labelledby="credits-title">
        <h2 id="credits-title" className="flex items-center gap-2 font-bold">
          <Sprout size={20} className="text-sage-700" aria-hidden="true" />
          Créditos
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
          <li>Emoji 3D: Microsoft Fluent Emoji (licencia MIT, © Microsoft Corporation).</li>
          <li>Íconos de línea: Lucide (licencia ISC).</li>
          <li>Ilustraciones de ejercicios: dibujos originales de Band &amp; Bloom.</li>
          <li>Tipografía: Plus Jakarta Sans (SIL Open Font License), incluida en la app.</li>
          <li>Hecha con React, TypeScript, Vite y Tailwind CSS.</li>
        </ul>
        <h3 className="mt-4 text-sm font-semibold text-ink-900">Fotos de portada (Pexels)</h3>
        <ul className="mt-1.5 space-y-1 text-sm text-ink-700">
          {ROUTINES.map((routine) => {
            const cover = ROUTINE_COVERS[routine.id]
            return (
              <li key={routine.id}>
                {routineTitle(routine)}:{' '}
                <a href={cover.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-bloom-700 underline underline-offset-2">
                  {cover.photographer}
                </a>
              </li>
            )
          })}
        </ul>
      </Card>

      <Card tone="peach" className="p-4 text-sm text-ink-700">
        Esta app da orientación general de ejercicio y no sustituye la opinión de un profesional de la salud.
      </Card>
    </div>
  )
}
