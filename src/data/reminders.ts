import type { ReminderMessageId, ReminderSettings } from '../types'

export const REMINDER_MESSAGES: Array<{ id: Exclude<ReminderMessageId, 'custom'>; text: string }> = [
  { id: 'care', text: 'Es hora de cuidar tu fuerza 💜 ¿Movilidad, rutina corta o descanso?' },
  { id: 'small-step', text: 'Un ratito para ti 🌱 Aunque sea movilidad de 7 minutos, cuenta.' },
  { id: 'energy', text: '¿Cómo está tu energía hoy? Elige lo que te haga sentir bien 💜' },
]

export const CUSTOM_MESSAGE_MAX_LENGTH = 120

export const DEFAULT_REMINDERS: ReminderSettings = {
  enabled: true,
  time: '21:00',
  messageId: 'care',
  customMessage: '',
  days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
}

/** Texto final del recordatorio; si el personalizado está vacío, usa el predeterminado. */
export function reminderText(settings: Pick<ReminderSettings, 'messageId' | 'customMessage'>): string {
  if (settings.messageId === 'custom' && settings.customMessage.trim()) return settings.customMessage.trim()
  return (REMINDER_MESSAGES.find((message) => message.id === settings.messageId) ?? REMINDER_MESSAGES[0]).text
}
