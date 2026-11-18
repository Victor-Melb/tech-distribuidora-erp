import React, { useState, useEffect, useCallback } from 'react'
import { Shield, Users, UserPlus, Lock, Activity, RefreshCw, FileCode2 } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/useAuth'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { StatCard } from '../components/ui/StatCard'
import { AlertBanner } from '../components/ui/AlertBanner'
import { RestrictedAccessCard } from '../components/usuarios/RestrictedAccessCard'
import { UserCreateFormCard } from '../components/usuarios/UserCreateFormCard'
import { UserManagementTab } from '../components/usuarios/UserManagementTab'
import { AuditLogsPanel } from '../components/usuarios/AuditLogsPanel'
import { DastConsole } from '../components/usuarios/DastConsole'

export default function Usuarios() {
  const { usuario, temPermissao } = useAuth()
  const isAdmin = temPermissao(['Administrador'])
  const podeVisualizar = temPermissao(['Administrador', 'Gerente'])

  const [abaAtiva, setAbaAtiva] = useState('usuarios')
  const [usuarios, setUsuarios] = useState([])
  const [logs, setLogs] = useState([])
  const [filtroLogStatus, setFiltroLogStatus] = useState('TODOS')
  const [carregando, setCarregando] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', login: '', senha: '', perfil: 'Vendedor' })

  const carregarDadosSeguranca = useCallback(async () => {
    setCarregando(true)
    try {
      const [resUsers, resLogs] = await Promise.all([
        api.get('/usuarios/'),
        api.get('/usuarios/auditoria/logs?limit=60'),
      ])
      setUsuarios(resUsers.data)
      setLogs(resLogs.data)
    } catch (error) {
      setFeedback({ tipo: 'erro', texto: error.mensagemAmigavel || 'Erro ao carregar dados.' })
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    if (!podeVisualizar) return
    let ativo = true
    async function init() {
      try {
        const [resUsers, resLogs] = await Promise.all([
          api.get('/usuarios/'),
          api.get('/usuarios/auditoria/logs?limit=60'),
        ])
        if (ativo) {
          setUsuarios(resUsers.data)
          setLogs(resLogs.data)
        }
      } catch (error) {
        if (ativo) setFeedback({ tipo: 'erro', texto: error.mensagemAmigavel || 'Erro ao carregar dados.' })
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    init()
    return () => {
      ativo = false
    }
  }, [podeVisualizar])

  const handleCriarUsuarioAdmin = async (e) => {
    e.preventDefault()
    setFeedback(null)
    try {
      const res = await api.post('/usuarios/', novoUsuario)
      setFeedback({ tipo: 'sucesso', texto: `Colaborador "${res.data.nome}" criado com perfil ${res.data.perfil}.` })
      setNovoUsuario({ nome: '', login: '', senha: '', perfil: 'Vendedor' })
      setIsFormOpen(false)
      carregarDadosSeguranca()
    } catch (error) {
      setFeedback({ tipo: 'erro', texto: error.mensagemAmigavel || 'Não foi possível criar o usuário.' })
    }
  }

  const handleAlterarPerfil = async (u, novoPerfil) => {
    setFeedback(null)
    try {
      await api.put(`/usuarios/${u.idUsuario}`, { perfil: novoPerfil })
      setFeedback({ tipo: 'sucesso', texto: `Perfil de "${u.login}" atualizado para ${novoPerfil}.` })
      carregarDadosSeguranca()
    } catch (error) {
      setFeedback({ tipo: 'erro', texto: error.mensagemAmigavel })
    }
  }

  const handleAlternarAtivo = async (u) => {
    setFeedback(null)
    try {
      await api.put(`/usuarios/${u.idUsuario}`, { ativo: !u.ativo })
      setFeedback({ tipo: 'sucesso', texto: `Conta "${u.login}" ${!u.ativo ? 'reativada' : 'desativada'}.` })
      carregarDadosSeguranca()
    } catch (error) {
      setFeedback({ tipo: 'erro', texto: error.mensagemAmigavel })
    }
  }

  const handleExcluirUsuario = async (u) => {
    setFeedback(null)
    try {
      await api.delete(`/usuarios/${u.idUsuario}`)
      setFeedback({ tipo: 'sucesso', texto: `Usuário "${u.login}" removido.` })
      carregarDadosSeguranca()
    } catch (error) {
      setFeedback({ tipo: 'erro', texto: error.mensagemAmigavel })
    }
  }

  if (!podeVisualizar) return <RestrictedAccessCard usuario={usuario} />

  const tabs = [
    { id: 'usuarios', label: 'Lista de Usuários', icon: Users, activeClass: 'bg-[var(--accent-soft)] text-[var(--accent-text)] border-[var(--accent-border)]' },
    { id: 'auditoria', label: 'Histórico de Acessos', icon: Activity, activeClass: 'bg-[var(--accent-soft)] text-[var(--accent-text)] border-[var(--accent-border)]' },
    { id: 'dast', label: 'Testes de Segurança (DAST)', icon: FileCode2, activeClass: 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success-border)]' },
  ]

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        eyebrow="Módulo de Governança e Identidade"
        title="Usuários e Controle de Acesso"
        description="Gerenciamento de colaboradores, perfis RBAC, auditoria e verificação dinâmica da API."
        actions={
          <>
            <Button variant="secondary" onClick={carregarDadosSeguranca}>
              <RefreshCw size={15} strokeWidth={1.75} className={carregando ? 'animate-spin' : ''} aria-hidden="true" />
              <span>Atualizar</span>
            </Button>
            {isAdmin && (
              <Button variant="primary" onClick={() => setIsFormOpen(!isFormOpen)}>
                <UserPlus size={16} strokeWidth={1.75} aria-hidden="true" />
                <span>Novo Colaborador</span>
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total de Usuários" value={usuarios.length} subtext={`${usuarios.filter((u) => u.ativo).length} contas ativas`} icon={<Users size={16} strokeWidth={1.75} />} tone="sapphire" />
        <StatCard label="Senhas Protegidas" value="100%" subtext="Hash PBKDF2-HMAC-SHA256" icon={<Lock size={16} strokeWidth={1.75} />} tone="success" valueClassName="text-[var(--status-success)]" />
        <StatCard label="Contas Privilegiadas" value={usuarios.filter((u) => u.perfil !== 'Vendedor').length} subtext="Administradores e Gerentes" icon={<Shield size={16} strokeWidth={1.75} />} tone="brand" />
        <StatCard label="Eventos Auditados" value={logs.length} subtext="Logs sem dados sensíveis" icon={<Activity size={16} strokeWidth={1.75} />} tone="warning" />
      </div>

      {feedback && <AlertBanner type={feedback.tipo} message={feedback.texto} onClose={() => setFeedback(null)} />}

      {isFormOpen && isAdmin && (
        <UserCreateFormCard
          novoUsuario={novoUsuario}
          onChange={setNovoUsuario}
          onSubmit={handleCriarUsuarioAdmin}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      <div role="tablist" aria-label="Seções do módulo de usuários e segurança" className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const selected = abaAtiva === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setAbaAtiva(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer border ${
                selected ? tab.activeClass : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border-transparent'
              }`}
            >
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div role="tabpanel">
        {abaAtiva === 'usuarios' && (
          <UserManagementTab
            usuarios={usuarios}
            usuarioAtual={usuario}
            carregando={carregando}
            isAdmin={isAdmin}
            onAlterarPerfil={handleAlterarPerfil}
            onAlternarAtivo={handleAlternarAtivo}
            onExcluir={handleExcluirUsuario}
          />
        )}
        {abaAtiva === 'auditoria' && (
          <AuditLogsPanel logs={logs} carregando={carregando} filtroStatus={filtroLogStatus} onChangeFiltro={setFiltroLogStatus} />
        )}
        {abaAtiva === 'dast' && <DastConsole onCompleted={carregarDadosSeguranca} />}
      </div>
    </div>
  )
}
