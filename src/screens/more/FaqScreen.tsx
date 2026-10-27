import { ChevronDown } from 'lucide-react'
import { ScreenHeader } from '../../components/ui/ScreenHeader'

/**
 * Solo respuestas que son ciertas hoy. Las preguntas sobre instalación
 * y modo sin conexión se agregan cuando esas funciones existan.
 */
const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: '¿Necesito crear una cuenta?',
    answer: 'No. La app funciona sin cuenta, sin registro y sin pagos.',
  },
  {
    question: '¿Dónde se guardan mis datos?',
    answer:
      'Sin cuenta, solo en este dispositivo, dentro del navegador: si borras los datos del navegador, se borran también. Si entras con tu cuenta de Mi Semana (Más → Mis datos), se guardan también en la nube y los ves en todos tus dispositivos. En ambos casos puedes exportar un respaldo desde Más → Mis datos.',
  },
  {
    question: '¿Qué pasa si me salto un día?',
    answer:
      'Nada. No se acumulan pendientes ni hay rachas que se rompan. Inicio simplemente te sugiere lo que toca hoy.',
  },
  {
    question: '¿La rutina corta cuenta para mi meta?',
    answer: 'Sí. Cuenta como sesión de fuerza en tu progreso semanal.',
  },
  {
    question: '¿Abrir una rutina cuenta como hecha?',
    answer: 'No. Solo cuentan las rutinas que terminas.',
  },
  {
    question: '¿Qué liga uso?',
    answer:
      'Empieza con la rosa (Light) en todo. La morada (X-Heavy) es muy fuerte: déjala para piernas y glúteos cuando la rosa ya se sienta fácil con buena técnica.',
  },
  {
    question: '¿La app me manda notificaciones?',
    answer:
      'Todavía no. Si la abres después de tu hora de recordatorio, verás un aviso dentro de la app. Para que tu teléfono te avise aunque la app esté cerrada, agrega el recordatorio a tu calendario desde Más → Recordatorios, o crea una automatización en la app Atajos.',
  },
  {
    question: '¿Puedo cambiar mis días de entrenamiento?',
    answer: 'Sí, en Más → Horario de entrenamiento. Tu historial no se modifica.',
  },
]

export function FaqScreen() {
  return (
    <div className="space-y-5">
      <ScreenHeader title="Preguntas frecuentes" backTo={{ name: 'more' }} />
      <div className="space-y-3">
        {FAQ.map((item) => (
          <details
            key={item.question}
            className="group rounded-card bg-white/85 shadow-soft ring-1 ring-ink-200/60 open:bg-white"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-semibold [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown size={20} className="shrink-0 text-ink-400 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="px-5 pb-4 text-sm text-ink-700">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
