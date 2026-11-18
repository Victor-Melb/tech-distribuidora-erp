import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { BrandLogo } from './ui/BrandLogo'

export default function ProtectedRoute({ children }) {
  const { autenticado, carregando } = useAuth()
  const location = useLocation()

  if (carregando) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)] text-[var(--text-secondary)] px-4"
      >
        <div className="surface-panel rounded-xl p-6 flex flex-col items-center gap-4">
          <BrandLogo size="md" />
          <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" aria-hidden="true" />
            <span>Validando sessão corporativa...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!autenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
