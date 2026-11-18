import React from 'react'

const TONES = {
  brand: 'bg-[var(--accent-soft)] text-[var(--accent-text)] border-[var(--accent-border)]',
  sapphire: 'bg-[var(--status-info-bg)] text-[var(--status-info)] border-[var(--status-info-border)]',
  success: 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success-border)]',
  warning: 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]',
  danger: 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger-border)]',
  neutral: 'bg-[var(--bg-inset)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
}

export function Badge({ children, tone = 'neutral', icon = null, mono = false, className = '' }) {
  const resolvedTone = TONES[tone] || TONES.neutral
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${
        mono ? 'font-mono tabular-nums' : ''
      } ${resolvedTone} ${className}`}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
