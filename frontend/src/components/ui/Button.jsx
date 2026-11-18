import React from 'react'

const VARIANTS = {
  primary: 'btn-corporate-primary font-semibold',
  secondary:
    'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-medium)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-strong)] font-medium',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] font-medium',
  danger:
    'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger-border)] hover:opacity-90 font-medium',
}

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-lg',
  icon: 'h-8 w-8 p-0 rounded-lg justify-center',
}

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  type = 'button',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-colors duration-150 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
