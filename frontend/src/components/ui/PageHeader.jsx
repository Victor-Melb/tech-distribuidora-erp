import React from 'react'

export function PageHeader({ title, description, actions = null, eyebrow = null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold text-[var(--accent-text)] mb-1 flex items-center gap-1.5">
            {eyebrow}
          </p>
        )}
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  )
}
