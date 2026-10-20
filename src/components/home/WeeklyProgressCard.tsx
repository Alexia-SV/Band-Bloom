import { Sprout } from 'lucide-react'
import { Card } from '../ui/Card'
import { IconBubble } from '../ui/IconBubble'
import { ProgressBar } from '../ui/ProgressBar'

function encouragement(done: number, goal: number): string {
  if (done === 0) return 'Tu semana empieza cuando tú decidas.'
  if (done >= goal) return '¡Meta de la semana cumplida! 💜'
  return 'Vas muy bien, sin prisa.'
}

export function WeeklyProgressCard({ done, goal }: { done: number; goal: number }) {
  return (
    <Card as="section" className="p-5" aria-labelledby="weekly-progress-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="weekly-progress-title" className="font-bold">
            Mi progreso esta semana
          </h2>
          <p className="mt-2">
            <span className="text-3xl font-bold tracking-tight">
              {done}/{goal}
            </span>{' '}
            <span className="text-sm text-ink-500">sesiones de fuerza</span>
          </p>
        </div>
        <IconBubble icon={Sprout} tone="sage" />
      </div>
      <div className="mt-3">
        <ProgressBar value={done} max={goal} label={`${done} de ${goal} sesiones de fuerza esta semana`} />
      </div>
      <p className="mt-3 text-sm text-ink-500">{encouragement(done, goal)}</p>
    </Card>
  )
}
