import React from 'react'

const ACCENTS = {
  brand: 'text-[var(--accent-text)] bg-[var(--accent-soft)] border-[var(--accent-border)]',
  sapphire: 'text-[var(--status-info)] bg-[var(--status-info-bg)] border-[var(--status-info-border)]',
  success: 'text-[var(--status-success)] bg-[var(--status-success-bg)] border-[var(--status-success-border)]',
  warning: 'text-[var(--status-warning)] bg-[var(--status-warning-bg)] border-[var(--status-warning-border)]',
  danger: 'text-[var(--status-danger)] bg-[var(--status-danger-bg)] border-[var(--status-danger-border)]',
}

export function StatCard({
  label,
  value,
  subtext,
  icon = null,
  tone = 'brand',
  valueClassName = 'text-[var(--text-primary)]',
}) {
  const accentStyle = ACCENTS[tone] || ACCENTS.brand
  return (
    <div className="surface-card rounded-xl p-5 flex flex-col justify-between gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
        {icon && (
          <span
            className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${accentStyle}`}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>
      <div>
        <div className={`text-2xl font-semibold tracking-tight tabular-nums ${valueClassName}`}>
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-[var(--text-muted)] mt-1 tabular-nums">{subtext}</p>
        )}
      </div>
    </div>
  )
}
