import type { Tone } from '../types'

/** Clases completas (no concatenadas) para que Tailwind las detecte al compilar. */
export const TONE_STYLES: Record<Tone, { card: string; bubble: string; icon: string; text: string }> = {
  peach: {
    card: 'bg-peach-50 ring-peach-200/70',
    bubble: 'bg-peach-100',
    icon: 'text-peach-700',
    text: 'text-peach-700',
  },
  lavender: {
    card: 'bg-bloom-50 ring-bloom-200/70',
    bubble: 'bg-bloom-100',
    icon: 'text-bloom-700',
    text: 'text-bloom-700',
  },
  sky: {
    card: 'bg-sky-50 ring-sky-100',
    bubble: 'bg-sky-100',
    icon: 'text-sky-700',
    text: 'text-sky-700',
  },
  sage: {
    card: 'bg-sage-50 ring-sage-200/70',
    bubble: 'bg-sage-100',
    icon: 'text-sage-700',
    text: 'text-sage-700',
  },
  rose: {
    card: 'bg-rose-50 ring-rose-200/70',
    bubble: 'bg-rose-100',
    icon: 'text-rose-700',
    text: 'text-rose-700',
  },
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
