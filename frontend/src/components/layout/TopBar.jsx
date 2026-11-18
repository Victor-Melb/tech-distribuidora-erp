import React from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { BrandLogo } from '../ui/BrandLogo'
import { TopNavMenu } from './TopNavMenu'
import { QuickSearchMenu } from './QuickSearchMenu'
import { NotificationsMenu } from './NotificationsMenu'
import { ProfilePopover } from './ProfilePopover'

export function TopBar({
  isScrolled,
  onOpenMobileMenu,
  notificacoes,
  usuario,
  onLogout,
}) {
  return (
    <header
      className={`sticky top-0 z-40 w-full transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isScrolled ? 'pt-3.5 px-3 sm:px-6' : 'pt-0 px-0'
      }`}
    >
      <div
        className={`mx-auto w-full transition-[max-width,height,padding,border-radius,box-shadow,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isScrolled
            ? 'max-w-[1240px] h-20 px-5 sm:px-8 rounded-[40px] border topbar-floating'
            : 'max-w-[100vw] h-[88px] px-4 sm:px-6 lg:px-8 rounded-none border-b border-[var(--border-subtle)] topbar-docked'
        }`}
      >
        <div className="relative z-10 mx-auto w-full h-full max-w-[1180px] flex items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Abrir menu de navegação"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-inset)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
            >
              <Menu size={20} aria-hidden="true" />
            </button>

            <Link
              to="/menu"
              aria-label="Ir para Visão Executiva — TechDistribuidora"
              className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <BrandLogo size="md" compactMobile />
            </Link>
          </div>

          <TopNavMenu />

          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <QuickSearchMenu isScrolled={isScrolled} />
            <NotificationsMenu notificacoes={notificacoes} />
            <div className="hidden sm:block w-px h-6 bg-[var(--border-subtle)] mx-0.5" aria-hidden="true" />
            <ProfilePopover usuario={usuario} onLogout={onLogout} />
          </div>
        </div>
      </div>
    </header>
  )
}
