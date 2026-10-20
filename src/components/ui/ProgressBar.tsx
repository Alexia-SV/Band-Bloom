interface ProgressBarProps {
  value: number
  max: number
  label: string
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100"
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-sage-500 to-sage-600 transition-[width] duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
