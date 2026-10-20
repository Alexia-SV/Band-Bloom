import { useId, useRef, type KeyboardEvent } from 'react'
import { cn } from '../../lib/tones'

interface SegmentedTabsProps<T extends string> {
  label: string
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
  /** id del elemento role="tabpanel" que muestra el contenido. */
  panelId: string
}

/**
 * Pestañas tipo "píldora" del mockup, con el patrón ARIA de tabs:
 * flechas izquierda/derecha para moverse, Inicio/Fin para ir a los extremos.
 */
export function SegmentedTabs<T extends string>({ label, options, value, onChange, panelId }: SegmentedTabsProps<T>) {
  const baseId = useId()
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  function onKeyDown(event: KeyboardEvent, index: number) {
    let next = -1
    if (event.key === 'ArrowRight') next = (index + 1) % options.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + options.length) % options.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = options.length - 1
    if (next < 0) return
    event.preventDefault()
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} className="grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-white/70 p-1 ring-1 ring-ink-200/60">
      {options.map((option, index) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            ref={(element) => {
              refs.current[index] = element
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${option.value}`}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              'min-h-10 rounded-full px-3 text-sm font-semibold transition-colors',
              selected ? 'bg-bloom-600 text-white shadow-soft' : 'text-ink-700 hover:bg-bloom-50',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
