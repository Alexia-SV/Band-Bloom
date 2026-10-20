import { ShieldCheck } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { BAND_SAFETY_TIPS, BANDS } from '../../data/bands'

/** Dibujo simple de una liga cerrada, con su color real. */
function BandLoop({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 96 64" className="h-16 w-24 shrink-0" aria-hidden="true">
      <ellipse cx="48" cy="32" rx="40" ry="20" fill="none" stroke={color} strokeWidth="10" />
      <ellipse cx="48" cy="32" rx="40" ry="20" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="2" />
    </svg>
  )
}

export function BandsScreen() {
  return (
    <div className="space-y-5">
      <ScreenHeader title="Mis ligas" subtitle="Tu equipo para entrenar en casa." backTo={{ name: 'more' }} />

      <ul className="space-y-4">
        {BANDS.map((band) => (
          <li key={band.id}>
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <BandLoop color={band.color} />
                <div>
                  <h2 className="text-lg font-bold">{band.name}</h2>
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2.5 py-0.5 text-sm font-semibold text-ink-700">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: band.color }} aria-hidden="true" />
                    Resistencia: {band.resistance}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-ink-700">{band.summary}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-700">
                {band.useFor.map((use) => (
                  <li key={use}>{use}</li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ul>

      <Card tone="sage" as="section" className="p-5" aria-labelledby="band-safety-title">
        <h2 id="band-safety-title" className="flex items-center gap-2 font-bold">
          <ShieldCheck size={20} className="text-sage-700" aria-hidden="true" />
          Usa tus ligas con seguridad
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-700">
          {BAND_SAFETY_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
