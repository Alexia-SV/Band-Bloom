import { HeartPulse, Moon, Repeat, Target, type LucideIcon } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { IconBubble } from '../../components/ui/IconBubble'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import type { Tone } from '../../types'

const TIPS: Array<{ title: string; icon: LucideIcon; tone: Tone; points: string[] }> = [
  {
    title: 'Técnica',
    icon: Target,
    tone: 'lavender',
    points: [
      'Muévete despacio y con control, sobre todo al regresar a la posición inicial.',
      'Respira normal; no aguantes el aire.',
      'Usa un rango de movimiento cómodo. La profundidad llega con la práctica.',
      'Una serie bien hecha vale más que muchas repeticiones con prisa.',
    ],
  },
  {
    title: 'Descanso',
    icon: Moon,
    tone: 'sky',
    points: [
      'Deja al menos un día entre sesiones que trabajen los mismos músculos.',
      'Dormir bien es parte del entrenamiento: ahí se recupera el músculo.',
      'Sentir un poco de agujetas 1 o 2 días después es normal al empezar.',
    ],
  },
  {
    title: 'Progreso',
    icon: Repeat,
    tone: 'sage',
    points: [
      'Las primeras dos semanas son para aprender los movimientos. No hace falta subir la dificultad.',
      'Cuando llegues cómodamente al número más alto de repeticiones, sube primero las repeticiones o agrega una serie.',
      'Cambia solo una cosa a la vez: repeticiones, series o liga.',
      'La liga morada (X-Heavy) es para más adelante y sobre todo para piernas y glúteos.',
    ],
  },
  {
    title: 'Cuándo parar',
    icon: HeartPulse,
    tone: 'rose',
    points: [
      'Detente si sientes dolor agudo o punzante, mareo, falta de aire inusual, dolor en el pecho o un cansancio extraño.',
      'Parar a tiempo no es fallar: es cuidarte.',
      'Si algún síntoma no se quita o te preocupa, consulta a un médico antes de volver a entrenar.',
    ],
  },
]

export function TipsScreen() {
  return (
    <div className="space-y-5">
      <ScreenHeader title="Consejos" subtitle="Lo básico para entrenar bien y sin lastimarte." backTo={{ name: 'more' }} />
      {TIPS.map((tip) => (
        <Card key={tip.title} as="section" className="p-5" aria-labelledby={`tip-${tip.title}`}>
          <h2 id={`tip-${tip.title}`} className="flex items-center gap-3 text-lg font-bold">
            <IconBubble icon={tip.icon} tone={tip.tone} size="sm" />
            {tip.title}
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-700">
            {tip.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  )
}
