import React from 'react'

export function Card({ children, className = '', interactive = false }) {
  return (
    <div
      className={`rounded-xl ${
        interactive ? 'surface-card surface-card-interactive' : 'surface-panel'
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div
      className={`px-5 py-4 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h2 className={`text-sm font-semibold text-[var(--text-primary)] tracking-tight ${className}`}>
      {children}
    </h2>
  )
}

export function CardDescription({ children, className = '' }) {
  return <p className={`text-xs text-[var(--text-muted)] mt-0.5 ${className}`}>{children}</p>
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>
}
