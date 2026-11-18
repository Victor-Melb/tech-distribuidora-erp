import React, { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Bell, Package } from 'lucide-react'

export function NotificationsMenu({ notificacoes }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const handleOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const count = notificacoes?.length || 0

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Notificações operacionais (${count})`}
        title={`Alertas (${count})`}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-inset)]/85 hover:border-[var(--border-medium)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]/80 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
      >
        <Bell size={16} aria-hidden="true" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--bg-topbar)] leading-none"
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Alertas operacionais"
          className="animate-popover-enter absolute -right-12 sm:right-0 top-full mt-3 w-[min(20rem,calc(100vw-1.5rem))] sm:w-84 rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-surface-elevated)] shadow-2xl overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              Alertas Operacionais
            </span>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              {count} {count === 1 ? 'pendência' : 'pendências'}
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border-subtle)]">
            {count === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                Tudo regularizado. Nenhuma pendência no momento.
              </div>
            ) : (
              notificacoes.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 hover:bg-[var(--bg-surface-hover)] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        n.tipo === 'estoque'
                          ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]'
                          : 'bg-[var(--status-danger-bg)] text-[var(--status-danger)]'
                      }`}
                      aria-hidden="true"
                    >
                      {n.tipo === 'estoque' ? <Package size={15} /> : <AlertTriangle size={15} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">
                        {n.titulo}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                        {n.mensagem}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
