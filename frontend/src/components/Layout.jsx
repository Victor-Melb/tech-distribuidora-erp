import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/useAuth'
import { formatarMoeda } from '../utils/formatters'
import { BrandLogo } from './ui/BrandLogo'
import { SidebarNav } from './layout/SidebarNav'
import { TopBar } from './layout/TopBar'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [notificacoes, setNotificacoes] = useState([])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setIsScrolled((prev) => {
        if (!prev && y > 28) return true
        if (prev && y < 10) return false
        return prev
      })
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let ativo = true
    async function loadNotificacoes() {
      try {
        const [resP, resT] = await Promise.all([api.get('/produtos/'), api.get('/transacoes/')])
        if (!ativo) return
        const alertas = []
        resP.data.forEach((p) => {
          if (p.estoque < 10) {
            alertas.push({
              id: `prod-${p.idProduto}`,
              tipo: 'estoque',
              titulo: 'Estoque abaixo do mínimo',
              mensagem: `${p.nome} está com ${p.estoque} un disponíveis.`,
            })
          }
        })
        resT.data.forEach((t) => {
          if (t.tipo === 'Pagar' && t.status === 'Pendente') {
            alertas.push({
              id: `trans-${t.idTransacao}`,
              tipo: 'financeiro',
              titulo: 'Título a pagar pendente',
              mensagem: `${t.descricao} — ${formatarMoeda(t.valor)}.`,
            })
          }
        })
        setNotificacoes(alertas)
      } catch {
        // Silencioso caso API não responda
      }
    }
    loadNotificacoes()
    return () => {
      ativo = false
    }
  }, [location.pathname])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside
            aria-label="Menu móvel"
            className="relative w-72 max-w-[85vw] bg-[var(--bg-sidebar)] border-r border-[var(--border-medium)] flex flex-col h-full z-10"
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-subtle)]">
              <BrandLogo size="sm" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fechar menu de navegação"
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileMenuOpen(false)} />
            <div className="p-3 border-t border-[var(--border-subtle)] space-y-2">
              <div className="px-3 py-2 rounded-lg surface-inset text-xs">
                <p className="font-semibold text-[var(--text-primary)] truncate">
                  {usuario?.nome || 'Operador'}
                </p>
                <p className="font-mono text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                  @{usuario?.login || 'operador'} · {usuario?.perfil || 'Colaborador'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-[var(--status-danger)] bg-[var(--status-danger-bg)] cursor-pointer"
              >
                <LogOut size={17} strokeWidth={1.75} aria-hidden="true" />
                <span>Encerrar sessão</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      <TopBar
        isScrolled={isScrolled}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        notificacoes={notificacoes}
        usuario={usuario}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
