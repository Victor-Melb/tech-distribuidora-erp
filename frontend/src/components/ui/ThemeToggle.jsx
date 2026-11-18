import React, { useId } from 'react'
import { useTheme } from '../../context/useTheme'

export function ThemeToggle({ showLabel = true, className = '' }) {
  const { isDark, toggleTheme } = useTheme()
  const maskId = useId()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
      aria-pressed={isDark}
      title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className={`h-9 px-2.5 rounded-lg border border-[var(--border-medium)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150 inline-flex items-center gap-2 cursor-pointer group ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0 overflow-visible"
      >
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="24" height="24" fill="white" />
            <circle
              cx={isDark ? 16.5 : 26}
              cy={isDark ? 7.5 : 2}
              r="6.2"
              fill="black"
              style={{
                transition: 'cx 420ms cubic-bezier(0.34, 1.56, 0.64, 1), cy 420ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          </mask>
        </defs>

        {/* Orbe central: Sol no claro -> Lua crescente no escuro */}
        <circle
          cx="12"
          cy="12"
          r={isDark ? 7.2 : 4.6}
          fill={isDark ? '#60A5FA' : '#F59E0B'}
          mask={`url(#${maskId})`}
          className="theme-toggle-orb"
          style={{
            transform: isDark ? 'rotate(-15deg)' : 'rotate(0deg)',
            transformOrigin: '12px 12px',
          }}
        />

        {/* Raios solares que giram e recolhem */}
        <g
          stroke="#F59E0B"
          strokeWidth="1.9"
          strokeLinecap="round"
          className="theme-toggle-rays"
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? 'rotate(65deg) scale(0.35)' : 'rotate(0deg) scale(1)',
            transformOrigin: '12px 12px',
          }}
        >
          <line x1="12" y1="2.2" x2="12" y2="4.2" />
          <line x1="12" y1="19.8" x2="12" y2="21.8" />
          <line x1="2.2" y1="12" x2="4.2" y2="12" />
          <line x1="19.8" y1="12" x2="21.8" y2="12" />
          <line x1="5.07" y1="5.07" x2="6.49" y2="6.49" />
          <line x1="17.51" y1="17.51" x2="18.93" y2="18.93" />
          <line x1="5.07" y1="18.93" x2="6.49" y2="17.51" />
          <line x1="17.51" y1="6.49" x2="18.93" y2="5.07" />
        </g>

        {/* Estrelas que surgem com mola no modo escuro */}
        <g fill="#93C5FD">
          <path
            d="M18.5 3.5L19.05 5.05L20.6 5.6L19.05 6.15L18.5 7.7L17.95 6.15L16.4 5.6L17.95 5.05Z"
            className="theme-toggle-star"
            style={{
              opacity: isDark ? 1 : 0,
              transform: isDark ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-45deg)',
              transformOrigin: '18.5px 5.6px',
              transitionDelay: isDark ? '110ms' : '0ms',
            }}
          />
          <circle
            cx="20.5"
            cy="10.2"
            r="1.05"
            className="theme-toggle-star"
            style={{
              opacity: isDark ? 0.9 : 0,
              transform: isDark ? 'scale(1)' : 'scale(0)',
              transformOrigin: '20.5px 10.2px',
              transitionDelay: isDark ? '180ms' : '0ms',
            }}
          />
        </g>
      </svg>

      {showLabel && (
        <span className="hidden sm:inline text-xs font-medium tabular-nums">
          {isDark ? 'Escuro' : 'Claro'}
        </span>
      )}
    </button>
  )
}
