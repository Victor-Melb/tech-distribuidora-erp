import React from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Shield } from 'lucide-react'
import { formatarDataHoraBR } from '../../utils/formatters'
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { EmptyState, ListSkeleton } from '../ui/EmptyState'

function StatusLogBadge({ status }) {
  if (status === 'SUCESSO') {
    return (
      <Badge tone="success" icon={<CheckCircle2 size={12} strokeWidth={2} aria-hidden="true" />}>
        Sucesso
      </Badge>
    )
  }
  if (status === 'BLOQUEADO') {
    return (
      <Badge tone="danger" icon={<XCircle size={12} strokeWidth={2} aria-hidden="true" />}>
        Bloqueado
      </Badge>
    )
  }
  return (
    <Badge tone="warning" icon={<AlertTriangle size={12} strokeWidth={2} aria-hidden="true" />}>
      Falha
    </Badge>
  )
}

export function AuditLogsPanel({ logs, carregando, filtroStatus, onChangeFiltro }) {
  const logsFiltrados =
    filtroStatus === 'TODOS' ? logs : logs.filter((l) => l.status === filtroStatus)

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Histórico de acessos e auditoria</CardTitle>
          <CardDescription>
            Senhas, chaves e tokens são mascarados automaticamente como{' '}
            <code className="font-mono text-[var(--accent-text)]">[REDACTED]</code> antes da gravação.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filtro-auditoria" className="sr-only">
            Filtrar eventos por status
          </label>
          <select
            id="filtro-auditoria"
            value={filtroStatus}
            onChange={(e) => onChangeFiltro(e.target.value)}
            className="h-9 px-3 field-control text-xs [&>option]:bg-[var(--bg-surface)]"
          >
            <option value="TODOS">Todos os eventos</option>
            <option value="SUCESSO">Status: Sucesso</option>
            <option value="FALHA">Status: Falha</option>
            <option value="BLOQUEADO">Status: Bloqueado (RBAC)</option>
          </select>
        </div>
      </CardHeader>

      {carregando && logs.length === 0 ? (
        <ListSkeleton rows={5} />
      ) : logsFiltrados.length === 0 ? (
        <EmptyState
          icon={<Shield size={20} strokeWidth={1.75} />}
          title="Nenhum evento registrado"
          description="Não há registros de auditoria correspondentes ao filtro atual."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[var(--bg-inset)] text-[var(--text-muted)] text-xs border-b border-[var(--border-subtle)]">
                <th className="py-3 px-4 font-medium">Data / Hora</th>
                <th className="py-3 px-4 font-medium">Usuário</th>
                <th className="py-3 px-4 font-medium">Perfil</th>
                <th className="py-3 px-4 font-medium">Ação</th>
                <th className="py-3 px-4 font-medium">Rota</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Detalhe registrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
              {logsFiltrados.map((log) => (
                <tr key={log.idLog} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                  <td className="py-3 px-4 text-[var(--text-secondary)] font-mono tabular-nums">
                    {formatarDataHoraBR(log.dataHora)}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
                    {log.usuarioLogin}
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{log.perfil || '—'}</td>
                  <td className="py-3 px-4 font-mono text-[var(--accent-text)]">{log.acao}</td>
                  <td className="py-3 px-4 font-mono text-[var(--text-muted)]">{log.recurso}</td>
                  <td className="py-3 px-4">
                    <StatusLogBadge status={log.status} />
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)] max-w-md truncate">
                    {log.detalhe}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
