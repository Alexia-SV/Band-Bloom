/**
 * Sonidos cortos del temporizador con Web Audio (sin archivos externos).
 * En iPhone el audio solo se habilita después de un toque, por eso `unlockSound`
 * se llama al presionar "Iniciar".
 */
let context: AudioContext | null = null

export function unlockSound(): void {
  try {
    const AudioCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return
    context ??= new AudioCtor()
    if (context.state === 'suspended') void context.resume()
  } catch {
    context = null
  }
}

function tone(frequency: number, startOffset: number, duration: number): void {
  if (!context) return
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const start = context.currentTime + startOffset
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.05)
}

/** Un tono: empieza una fase. */
export function playPhaseSound(): void {
  try {
    tone(880, 0, 0.18)
  } catch {
    // Si el navegador no permite sonido, seguimos sin él.
  }
}

/** Tres tonos: terminó el tiempo. También vibra donde se pueda (Android; iPhone no lo permite). */
export function playDoneSound(): void {
  try {
    tone(660, 0, 0.16)
    tone(880, 0.2, 0.16)
    tone(1100, 0.4, 0.3)
  } catch {
    // Sin sonido disponible.
  }
  try {
    navigator.vibrate?.([120, 80, 120])
  } catch {
    // Sin vibración disponible.
  }
}
