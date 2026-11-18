import React from 'react'

export function EmptyState({ icon = null, title, description, action = null }) {
  return (
    <div role="status" className="py-12 px-6 text-center flex flex-col items-center">
      {icon && (
        <div
          className="w-11 h-11 rounded-xl surface-inset flex items-center justify-center text-[var(--text-muted)] mb-3"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3 p-5" role="status" aria-busy="true" aria-label="Carregando dados">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-11 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)] animate-pulse"
        />
      ))}
    </div>
  )
}
