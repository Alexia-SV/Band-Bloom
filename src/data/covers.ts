import routineA from '../assets/covers/routine-a.webp'
import routineB from '../assets/covers/routine-b.webp'
import routineC from '../assets/covers/routine-c.webp'
import routineMobility from '../assets/covers/routine-mobility.webp'
import routineShort from '../assets/covers/routine-short.webp'
import type { RoutineId } from '../types'

export interface CoverPhoto {
  src: string
  alt: string
  /** Punto de la foto que debe quedar visible al recortarla (CSS object-position). */
  position: string
  photographer: string
  sourceUrl: string
}

/**
 * Fotos de portada de Pexels (licencia de Pexels: uso gratuito, sin atribución obligatoria;
 * igual damos crédito en "Sobre la app"). Reducidas a WebP e incluidas en la app para que funcionen sin internet.
 */
export const ROUTINE_COVERS: Record<RoutineId, CoverPhoto> = {
  a: {
    src: routineA,
    alt: 'Mujer haciendo una sentadilla con una liga arriba de las rodillas sobre un tapete',
    position: '50% 70%',
    photographer: 'Pavel Danilyuk',
    sourceUrl: 'https://www.pexels.com/photo/woman-using-resistance-band-on-her-legs-6339637/',
  },
  b: {
    src: routineB,
    alt: 'Mujer sonriente estirando una liga con los brazos sobre la cabeza al aire libre',
    position: '50% 60%',
    photographer: 'Kaboompics.com',
    sourceUrl: 'https://www.pexels.com/photo/woman-in-activewear-using-a-resistance-band-4378995/',
  },
  c: {
    src: routineC,
    alt: 'Mujer entrenando con una liga pisada con los pies y sujeta con las manos',
    position: '50% 45%',
    photographer: 'RDNE Stock project',
    sourceUrl: 'https://www.pexels.com/photo/woman-working-out-8401806/',
  },
  short: {
    src: routineShort,
    alt: 'Piernas con una liga rosa arriba de los tobillos en una sala',
    position: '45% 50%',
    photographer: 'MART PRODUCTION',
    sourceUrl: 'https://www.pexels.com/photo/a-woman-waring-a-feet-band-in-exercising-8846567/',
  },
  mobility: {
    src: routineMobility,
    alt: 'Mujer sentada en el piso estirando los brazos hacia arriba en casa',
    position: '50% 55%',
    photographer: 'Katrin Bolovtsova',
    sourceUrl: 'https://www.pexels.com/photo/photo-of-woman-stretching-4051518/',
  },
}
