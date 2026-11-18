import React from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_GROUPS } from '../../config/navigation'

export function SidebarNav({ onNavigate }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Navegação mobile">
      {NAV_GROUPS.map((group) => (
        <div key={group.id}>
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--accent-border)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={17}
                          strokeWidth={1.85}
                          aria-hidden="true"
                          className={
                            isActive
                              ? 'text-[var(--accent-text)]'
                              : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                          }
                        />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
