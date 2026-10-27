import { CircleCheck, Monitor, RefreshCw, Share, Smartphone, SquarePlus, Wifi } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '../../components/ui/Card'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { cn } from '../../lib/tones'

const APP_URL = 'alexia-sv.github.io/Band-Bloom'

/** ¿Ya se abrió desde el ícono (instalada) y no desde el navegador? */
function isInstalled(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true || window.matchMedia('(display-mode: standalone)').matches
}

function Step({ number, children }: { number: number; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-bloom-100 text-sm font-bold text-bloom-700"
      >
        {number}
      </span>
      <span className="pt-0.5 text-ink-900">{children}</span>
    </li>
  )
}

function Platform({ icon: Icon, title, children, highlight }: { icon: typeof Smartphone; title: string; children: ReactNode; highlight?: boolean }) {
  return (
    <Card as="section" className={cn('p-5', highlight && 'ring-2 ring-bloom-300')}>
      <h2 className="flex items-center gap-2 font-bold">
        <Icon size={20} className="text-bloom-600" aria-hidden="true" /> {title}
      </h2>
      <ol className="mt-3 space-y-3">{children}</ol>
    </Card>
  )
}

/** Guía para tener Band & Bloom como app en el teléfono o la computadora. */
export function InstallScreen() {
  const installed = isInstalled()
  const iPhone = /iPhone|iPad|iPod/.test(navigator.userAgent)

  return (
    <div className="space-y-5">
      <ScreenHeader title="Instalar la app" subtitle="Tenla con su ícono, sin barras del navegador." backTo={{ name: 'more' }} />

      {installed && (
        <Card tone="sage" className="flex gap-3 p-4">
          <CircleCheck size={20} className="mt-0.5 shrink-0 text-sage-700" aria-hidden="true" />
          <p className="text-sm text-ink-700">
            <strong>Ya la tienes instalada.</strong> La estás usando desde su ícono, así que también funciona sin internet.
          </p>
        </Card>
      )}

      <Platform icon={Smartphone} title="iPhone o iPad" highlight={iPhone && !installed}>
        <Step number={1}>
          Abre <strong className="break-all">{APP_URL}</strong> en <strong>Safari</strong>.
        </Step>
        <Step number={2}>
          Toca <strong>Compartir</strong> <Share size={16} className="inline align-text-bottom" aria-label="(ícono de compartir)" /> en
          la barra de abajo.
        </Step>
        <Step number={3}>
          Elige <strong>Agregar a pantalla de inicio</strong>{' '}
          <SquarePlus size={16} className="inline align-text-bottom" aria-hidden="true" /> y luego <strong>Agregar</strong>.
        </Step>
        <Step number={4}>Ábrela desde el ícono nuevo: la flor que crece desde la liga.</Step>
      </Platform>

      <Platform icon={Smartphone} title="Android">
        <Step number={1}>
          Abre <strong className="break-all">{APP_URL}</strong> en <strong>Chrome</strong>.
        </Step>
        <Step number={2}>
          Toca el menú <strong>⋮</strong> y elige <strong>Instalar app</strong> (o <strong>Agregar a la pantalla principal</strong>).
        </Step>
      </Platform>

      <Platform icon={Monitor} title="Computadora (Chrome o Edge)">
        <Step number={1}>
          Abre <strong className="break-all">{APP_URL}</strong>.
        </Step>
        <Step number={2}>
          Toca el ícono de <strong>instalar</strong> al final de la barra de direcciones y confirma.
        </Step>
      </Platform>

      <Card tone="lavender" as="section" className="p-5" aria-labelledby="install-tips">
        <h2 id="install-tips" className="font-bold">
          Bueno saber
        </h2>
        <ul className="mt-3 space-y-3 text-sm text-ink-700">
          <li className="flex gap-2">
            <Wifi size={18} className="mt-0.5 shrink-0 text-bloom-600" aria-hidden="true" />
            Ábrela una vez con internet: después funciona sin conexión (rutinas, ilustraciones y temporizador).
          </li>
          <li className="flex gap-2">
            <SquarePlus size={18} className="mt-0.5 shrink-0 text-bloom-600" aria-hidden="true" />
            En el iPhone, la app instalada guarda sus datos aparte de Safari: entra con tu cuenta de Mi Semana (Más → Mis
            datos) para tener todo sincronizado.
          </li>
          <li className="flex gap-2">
            <RefreshCw size={18} className="mt-0.5 shrink-0 text-bloom-600" aria-hidden="true" />
            Cuando veas «Hay una versión nueva», toca Actualizar. Si el ícono no cambia, bórrala de la pantalla de inicio
            y vuelve a agregarla.
          </li>
        </ul>
      </Card>
    </div>
  )
}
