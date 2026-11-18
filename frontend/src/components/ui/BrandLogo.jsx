import React from 'react'

export function BrandLogo({
  size = 'md',
  showTagline = false,
  inverted = false,
  compactMobile = false,
}) {
  const iconSize = size === 'lg' ? 40 : size === 'sm' ? 30 : 34

  return (
    <div className="flex items-center gap-3">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="36" height="36" rx="8" fill="#1E3A8A" />
        <rect
          x="0.75"
          y="0.75"
          width="34.5"
          height="34.5"
          rx="7.25"
          stroke="#60A5FA"
          strokeOpacity="0.45"
          strokeWidth="1.25"
        />
        <path
          d="M18 7.5L27 12.75V23.25L18 28.5L9 23.25V12.75L18 7.5Z"
          stroke="#FFFFFF"
          strokeWidth="1.65"
          strokeLinejoin="round"
        />
        <path
          d="M18 18L27 12.75M18 18V28.5M18 18L9 12.75"
          stroke="#93C5FD"
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="18" r="2.2" fill="#60A5FA" />
      </svg>
      <div className={`min-w-0 ${compactMobile ? 'hidden min-[420px]:block' : ''}`}>
        <span
          className={`block font-semibold tracking-tight leading-none ${
            size === 'lg' ? 'text-xl' : 'text-base'
          } ${inverted ? 'text-white' : 'text-[var(--text-primary)]'}`}
        >
          TechDistribuidora
        </span>
        {showTagline && (
          <span
            className={`block text-xs mt-1 ${
              inverted ? 'text-slate-300' : 'text-[var(--text-muted)]'
            }`}
          >
            Distribuição Corporativa B2B
          </span>
        )}
      </div>
    </div>
  )
}
