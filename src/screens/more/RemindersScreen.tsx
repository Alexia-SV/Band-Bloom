import { Bell, Smartphone } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { IconBubble } from '../../components/ui/IconBubble'
import { ScreenHeader } from '../../components/ui/ScreenHeader'

/**
 * Los recordatorios se implementan en la Etapa 7. Mientras tanto, esta pantalla
 * no promete nada que la app no haga y ofrece una alternativa que sí funciona hoy.
 */
export function RemindersScreen() {
  return (
    <div className="space-y-5">
      <ScreenHeader title="Recordatorios" backTo={{ name: 'more' }} />

      <Card tone="lavender" className="flex items-start gap-4 p-5">
        <IconBubble icon={Bell} tone="lavender" />
        <div>
          <h2 className="font-bold">Todavía no disponibles</h2>
          <p className="mt-1 text-sm text-ink-700">
            La app aún no envía recordatorios. Cuando se agreguen, te explicaremos qué funciona en tu iPhone y qué no,
            sin promesas falsas.
          </p>
        </div>
      </Card>

      <Card as="section" className="p-5" aria-labelledby="ios-reminder-title">
        <h2 id="ios-reminder-title" className="flex items-center gap-2 font-bold">
          <Smartphone size={20} className="text-bloom-600" aria-hidden="true" />
          Mientras tanto, en tu iPhone
        </h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink-700">
          <li>Abre la app Recordatorios.</li>
          <li>Crea uno nuevo: “Es hora de cuidar tu fuerza 💜 ¿Movilidad, rutina corta o descanso?”.</li>
          <li>Activa la fecha y la hora, elige 9:00 p. m. y haz que se repita todos los días.</li>
        </ol>
      </Card>
    </div>
  )
}
