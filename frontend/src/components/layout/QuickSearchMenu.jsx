import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Search, X } from 'lucide-react'
import { FLAT_NAV_ITEMS } from '../../config/navigation'

export function QuickSearchMenu({ isScrolled }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const filteredItems = useMemo(() => {
    const termo = query.trim().toLowerCase()
    if (!termo) return FLAT_NAV_ITEMS
    return FLAT_NAV_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(termo) ||
        item.description.toLowerCase().includes(termo) ||
        item.groupLabel.toLowerCase().includes(termo)
    )
  }, [query])

  useEffect(() => {
    const handleGlobalShortcut = (event) => {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return
      const tag = event.target?.tagName
      const isEditable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        event.target?.isContentEditable
      if (isEditable) return

      event.preventDefault()
      setOpen(true)
    }

    window.addEventListener('keydown', handleGlobalShortcut)
    return () => window.removeEventListener('keydown', handleGlobalShortcut)
  }, [])

  useEffect(() => {
    if (!open) return

    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 20)

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
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleSelect = (path) => {
    setOpen(false)
    setQuery('')
    navigate(path)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (filteredItems.length > 0) {
      handleSelect(filteredItems[0].to)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Busca rápida de módulos (Atalho /)"
        title="Busca rápida (Atalho /)"
        className="inline-flex items-center justify-center gap-1.5 h-10 px-3 sm:px-3.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-inset)]/85 hover:border-[var(--border-medium)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]/80 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
      >
        <Search size={16} aria-hidden="true" />
        {!isScrolled && (
          <kbd className="hidden xl:inline-flex items-center justify-center text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5 leading-none">
            /
          </kbd>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Busca rápida de módulos"
          className="animate-popover-enter absolute -right-20 sm:right-0 top-full mt-3 w-[min(22rem,calc(100vw-1.5rem))] sm:w-88 rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-surface-elevated)] shadow-2xl overflow-hidden z-50"
        >
          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3.5 py-2.5 border-b border-[var(--border-subtle)]">
            <Search size={15} className="text-[var(--text-muted)] shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ir para módulo ou rotina..."
              aria-label="Filtrar módulos"
              className="w-full bg-transparent text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpar busca"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-md cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </form>

          <div className="max-h-72 overflow-y-auto p-1.5 divide-y divide-[var(--border-subtle)]/60">
            {filteredItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                Nenhum módulo encontrado para “{query}”.
              </div>
            ) : (
              filteredItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => handleSelect(item.to)}
                    className="w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl text-left hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        aria-hidden="true"
                        className="w-7 h-7 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] shrink-0"
                      >
                        <Icon size={14} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">
                          {item.groupLabel} · {item.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
