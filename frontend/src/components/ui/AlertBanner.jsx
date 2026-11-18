import React from 'react'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'

export function AlertBanner({ type = 'info', message, onClose }) {
  if (!message) return null

  const isSuccess = type === 'sucesso' || type === 'success'
  const styles = isSuccess
    ? 'bg-[var(--status-success-bg)] border-[var(--status-success-border)] text-[var(--status-success)]'
    : 'bg-[var(--status-danger-bg)] border-[var(--status-danger-border)] text-[var(--status-danger)]'

  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      aria-live="polite"
      className={`px-4 py-3 rounded-lg border flex items-center justify-between gap-3 text-xs sm:text-sm ${styles}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {isSuccess ? (
          <CheckCircle2 size={18} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
        ) : (
          <AlertTriangle size={18} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
        )}
        <span className="leading-relaxed">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar notificação"
          className="p-1 rounded-md opacity-80 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        >
          <X size={16} strokeWidth={1.75} />
        </button>
      )}
    </div>
  )
}
