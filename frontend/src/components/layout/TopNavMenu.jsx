import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { NAV_GROUPS } from '../../config/navigation'

export function TopNavMenu() {
  const location = useLocation()
  const [hoverGroup, setHoverGroup] = useState(null)
  const [pinnedGroup, setPinnedGroup] = useState(null)
  const navRef = useRef(null)
  const closeTimerRef = useRef(null)

  const activeOpenGroup = pinnedGroup || hoverGroup

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const scheduleHoverClose = () => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setHoverGroup(null)
    }, 120)
  }

  const handleGroupEnter = (groupId) => {
    clearCloseTimer()
    setHoverGroup(groupId)
  }

  const handleGroupClick = (groupId) => {
    clearCloseTimer()
    if (pinnedGroup === groupId) {
      setPinnedGroup(null)
      setHoverGroup(null)
    } else {
      setPinnedGroup(groupId)
    }
  }

  const closeAll = () => {
    clearCloseTimer()
    setPinnedGroup(null)
    setHoverGroup(null)
  }

  useEffect(() => {
    return () => clearCloseTimer()
  }, [])

  useEffect(() => {
    if (!activeOpenGroup) return

    const handleOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setPinnedGroup(null)
        setHoverGroup(null)
      }
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setPinnedGroup(null)
        setHoverGroup(null)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [activeOpenGroup])

  return (
    <nav
      ref={navRef}
      aria-label="Navegação principal"
      className="hidden lg:flex items-center gap-2 lg:gap-4 xl:gap-7"
    >
      {NAV_GROUPS.map((group) => {
        const isGroupActive = group.items.some((item) => item.to === location.pathname)
        const isOpen = activeOpenGroup === group.id

        return (
          <div
            key={group.id}
            className="relative"
            onMouseEnter={() => handleGroupEnter(group.id)}
            onMouseLeave={scheduleHoverClose}
          >
            <button
              type="button"
              onClick={() => handleGroupClick(group.id)}
              aria-expanded={isOpen}
              aria-haspopup="menu"
              aria-controls={`topnav-group-${group.id}`}
              className={`group inline-flex items-center gap-1.5 rounded-full px-3.5 xl:px-4 py-2.5 text-sm xl:text-[15px] font-medium transition-colors duration-150 cursor-pointer ${
                isOpen || isGroupActive
                  ? 'text-[var(--text-primary)] bg-[var(--bg-surface-hover)]/75'
                  : 'text-[var(--text-primary)]/85 hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]/60'
              }`}
            >
              <span>{group.label}</span>
              {isGroupActive && (
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                />
              )}
              <ChevronDown
                size={15}
                aria-hidden="true"
                className={`text-[var(--text-muted)] transition-transform duration-200 ${
                  isOpen
                    ? 'rotate-180 text-[var(--accent-text)]'
                    : 'group-hover:text-[var(--text-secondary)]'
                }`}
              />
            </button>

            {isOpen && (
              <div
                id={`topnav-group-${group.id}`}
                role="menu"
                aria-label={`Módulos de ${group.label}`}
                className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50"
              >
                <div className="animate-popover-enter w-72 rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-surface-elevated)] p-2 shadow-xl">
                  <div className="px-2.5 pt-1 pb-2 border-b border-[var(--border-subtle)] mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      {group.summary}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const isActive = location.pathname === item.to

                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          role="menuitem"
                          onClick={closeAll}
                          className={`group/item flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-colors ${
                            isActive
                              ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                              isActive
                                ? 'bg-[var(--accent)] text-white border-transparent'
                                : 'bg-[var(--bg-inset)] text-[var(--text-muted)] border-[var(--border-subtle)] group-hover/item:text-[var(--accent-text)] group-hover/item:border-[var(--accent-border)]'
                            }`}
                            aria-hidden="true"
                          >
                            <Icon size={15} strokeWidth={1.9} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold leading-tight truncate">
                              {item.label}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                              {item.description}
                            </p>
                          </div>
                          <ChevronRight
                            size={14}
                            aria-hidden="true"
                            className={`shrink-0 transition-transform duration-150 ${
                              isActive
                                ? 'text-[var(--accent-text)] opacity-100'
                                : 'text-[var(--text-muted)] opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0'
                            }`}
                          />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
