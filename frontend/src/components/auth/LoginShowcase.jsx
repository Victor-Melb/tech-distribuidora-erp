import React from 'react'
import { Lock, Layers, Activity } from 'lucide-react'
import { BrandLogo } from '../ui/BrandLogo'

export function LoginShowcase() {
  return (
    <section
      aria-label="Sobre a plataforma TechDistribuidora"
      className="hidden lg:flex lg:col-span-6 relative flex-col justify-between p-10 bg-[#0F172A] text-white border-r border-slate-800 architectural-grid"
    >
      <div>
        <BrandLogo size="lg" showTagline inverted />

        <div className="mt-10 space-y-4">
          <p className="text-xs font-semibold text-blue-400">
            ERP Corporativo de Distribuição
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white leading-snug">
            Gestão integrada de estoque, vendas B2B e controle de acessos.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Centralize pedidos, movimentação logística, fluxo financeiro e permissões da equipe em um ambiente auditável.
          </p>
        </div>
      </div>

      <div className="my-8 p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-white">Controles de Segurança Ativos</span>
          <span className="font-mono text-xs text-emerald-400">JWT · RBAC</span>
        </div>

        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
            <Lock size={14} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-medium text-white">Criptografia PBKDF2-HMAC-SHA256</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Senhas protegidas com salt aleatório e 100.000 iterações no servidor.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <Layers size={14} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-medium text-white">Autorização por Perfil (RBAC)</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Auto-cadastro restrito a Vendedor; gestão limitada a Gerência e Admin.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity size={14} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-medium text-white">Rastreabilidade e Auditoria</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Registro automático de acessos e bloqueios sem expor credenciais.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>TechDistribuidora ERP</span>
        <span className="font-mono">v2.0 · API FastAPI</span>
      </div>
    </section>
  )
}
