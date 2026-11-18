import React, { useState } from 'react'
import { ShieldAlert, Play } from 'lucide-react'
import api from '../../services/api'
import { Card, CardBody } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export function RestrictedAccessCard({ usuario }) {
  const [respostaBloqueio, setRespostaBloqueio] = useState(null)
  const [testando, setTestando] = useState(false)

  const testarAcessoIndevido = async () => {
    setTestando(true)
    try {
      await api.get('/usuarios/')
    } catch (error) {
      setRespostaBloqueio({
        status: error.response?.status || 403,
        metodo: 'GET /usuarios/',
        detalhe: error.mensagemAmigavel || 'Acesso negado pelo controle de perfis.',
      })
    } finally {
      setTestando(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-4">
      <Card>
        <CardBody className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] flex items-center justify-center text-[var(--status-danger)]">
                <ShieldAlert size={20} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                  Área restrita à Gerência e Administração
                </h1>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Controle de acesso RBAC ativo no servidor
                </p>
              </div>
            </div>
            <Badge tone="danger" mono>
              Perfil: {usuario?.perfil}
            </Badge>
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Olá, <strong className="text-[var(--text-primary)] font-medium">{usuario?.nome}</strong>. A gestão de contas e o histórico de auditoria exigem perfil{' '}
            <strong className="text-[var(--text-primary)] font-medium">Gerente</strong> ou{' '}
            <strong className="text-[var(--text-primary)] font-medium">Administrador</strong>. Mesmo tentando chamar a rota diretamente, o servidor bloqueia a ação com{' '}
            <code className="font-mono text-[var(--status-danger)]">HTTP 403 Forbidden</code>.
          </p>

          <div>
            <Button variant="danger" onClick={testarAcessoIndevido} disabled={testando}>
              <Play size={15} strokeWidth={1.75} aria-hidden="true" />
              <span>{testando ? 'Testando API...' : 'Simular chamada direta (GET /usuarios/)'}</span>
            </Button>
          </div>

          {respostaBloqueio && (
            <div
              role="status"
              className="p-4 rounded-lg surface-inset font-mono text-xs space-y-1.5 border border-[var(--status-danger-border)]"
            >
              <div className="flex items-center justify-between text-[var(--status-danger)] font-medium">
                <span>{respostaBloqueio.metodo}</span>
                <span>HTTP {respostaBloqueio.status} Forbidden</span>
              </div>
              <p className="text-[var(--text-primary)]">{respostaBloqueio.detalhe}</p>
              <p className="text-[var(--status-success)] pt-1">
                ✓ Tentativa registrada automaticamente na auditoria (ACESSO_NEGADO_RBAC).
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
