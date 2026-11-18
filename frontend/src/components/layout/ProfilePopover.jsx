import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Building2,
  ChevronDown,
  Home,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react'
import { useTheme } from '../../context/useTheme'

function getInitials(nome) {
  const parts = String(nome || 'Op')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return parts[0].slice(0, 2).toUpperCase()
}

function getCompactName(nome) {
  const parts = String(nome || 'Operador')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length <= 2) return parts.join(' ')
  return `${parts[0]} ${parts[1]}`
}

export function ProfilePopover({ usuario, onLogout }) {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [hoverOpen, setHoverOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const containerRef = useRef(null)
  const closeTimerRef = useRef(null)

  const isOpen = pinned || hoverOpen
  const initials = getInitials(usuario?.nome)
  const compactName = getCompactName(usuario?.nome)

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const handleMouseEnter = () => {
    clearCloseTimer()
    setHoverOpen(true)
  }

  const handleMouseLeave = () => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setHoverOpen(false)
    }, 150)
  }

  const handleToggleClick = () => {
    clearCloseTimer()
    if (pinned) {
      setPinned(false)
      setHoverOpen(false)
    } else {
      setPinned(true)
    }
  }

  const closeMenu = () => {
    clearCloseTimer()
    setPinned(false)
    setHoverOpen(false)
  }

  useEffect(() => {
    return () => clearCloseTimer()
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setPinned(false)
        setHoverOpen(false)
      }
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setPinned(false)
        setHoverOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleGoHome = () => {
    closeMenu()
    navigate('/menu')
  }

  const handleSignOut = () => {
    closeMenu()
    onLogout()
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleToggleClick}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Menu do usuário ${usuario?.nome || 'Operador'}`}
        className={`inline-flex items-center gap-2.5 sm:gap-3 rounded-full border pl-2 pr-3 sm:pr-4 py-2 transition-colors cursor-pointer ${
          isOpen
            ? 'border-[var(--accent-border)] bg-[var(--bg-surface-hover)]'
            : 'border-[var(--border-subtle)] bg-[var(--bg-inset)]/85 hover:border-[var(--border-medium)] hover:bg-[var(--bg-surface-hover)]'
        }`}
      >
        <span
          aria-hidden="true"
          className="w-8 h-8 rounded-full bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center shrink-0 tracking-tight"
        >
          {initials}
        </span>
        <span className="hidden sm:block text-sm font-medium text-[var(--text-primary)] max-w-[115px] xl:max-w-[155px] truncate">
          {compactName}
        </span>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[var(--accent-text)]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Informações do operador e preferências"
          className="absolute right-0 top-full pt-3 z-50"
        >
          <div className="animate-popover-enter w-[min(19rem,calc(100vw-1.5rem))] sm:w-80 rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-surface-elevated)] p-3.5 shadow-2xl">
            <div className="flex flex-col items-center text-center pb-3 border-b border-[var(--border-subtle)]">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-[var(--bg-inset)] border border-[var(--border-medium)] flex items-center justify-center text-base font-bold text-[var(--text-primary)] tracking-tight">
                  {initials}
                </div>
                <span
                  title="Sessão autenticada"
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center ring-2 ring-[var(--bg-surface-elevated)]"
                >
                  <BadgeCheck size={12} strokeWidth={2.4} aria-hidden="true" />
                </span>
              </div>

              <p className="mt-2.5 text-sm font-semibold text-[var(--text-primary)] leading-snug max-w-full truncate">
                {usuario?.nome || 'Operador'}
              </p>
              <p className="mt-0.5 text-xs font-mono text-[var(--text-muted)] truncate max-w-full">
                @{usuario?.login || 'operador'} · {usuario?.perfil || 'Colaborador'}
              </p>
            </div>

            <div className="py-3 border-b border-[var(--border-subtle)]">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Empresa
              </span>
              <div className="mt-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inset)] px-3 py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 size={14} className="text-[var(--accent-text)] shrink-0" aria-hidden="true" />
                  <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                    TECHDISTRIBUIDORA B2B
                  </span>
                </div>
                <span
                  aria-label="Unidade ativa"
                  className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
                />
              </div>
            </div>

            <div className="py-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Versão
                </span>
                <span className="font-mono text-[11px] font-semibold text-[var(--text-primary)]">
                  v2.0.0
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isDark}
                onClick={(event) => toggleTheme(event)}
                className="w-full rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-medium)] bg-[var(--bg-inset)] hover:bg-[var(--bg-surface-hover)] px-3 py-2.5 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)]">
                  {isDark ? (
                    <Moon size={15} className="text-[var(--accent-text)]" aria-hidden="true" />
                  ) : (
                    <Sun size={15} className="text-amber-500" aria-hidden="true" />
                  )}
                  <span>Tema Escuro</span>
                </span>

                <span
                  aria-hidden="true"
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
                    isDark ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                      isDark ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </span>
              </button>
            </div>

            <div className="pt-3 space-y-1.5">
              <button
                type="button"
                onClick={handleGoHome}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-medium)] bg-[var(--bg-inset)] hover:bg-[var(--bg-surface-hover)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <Home size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
                <span>Voltar para tela inicial</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--status-danger-border)] bg-[var(--bg-inset)] hover:bg-[var(--status-danger-bg)] px-3 py-2 text-xs font-medium text-[var(--status-danger)] transition-colors cursor-pointer"
              >
                <LogOut size={14} aria-hidden="true" />
                <span>Encerrar sessão</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
