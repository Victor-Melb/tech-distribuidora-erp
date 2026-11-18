import React from 'react'
import {
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  Trash2,
  Users,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { EmptyState, ListSkeleton } from '../ui/EmptyState'

function PerfilBadge({ perfil }) {
  const tone =
    perfil === 'Administrador' ? 'brand' : perfil === 'Gerente' ? 'sapphire' : 'success'
  return (
    <Badge tone={tone} icon={<Shield size={12} strokeWidth={1.75} aria-hidden="true" />}>
      {perfil}
    </Badge>
  )
}

export function UserManagementTab({
  usuarios,
  usuarioAtual,
  carregando,
  isAdmin,
  onAlterarPerfil,
  onAlternarAtivo,
  onExcluir,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-8 overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Operadores e níveis de acesso</CardTitle>
            <CardDescription>
              Contas protegidas por hash PBKDF2-SHA256 e verificação de perfil no servidor.
            </CardDescription>
          </div>
          <Badge tone="neutral" mono>
            {usuarios.length} contas
          </Badge>
        </CardHeader>

        {carregando && usuarios.length === 0 ? (
          <ListSkeleton rows={4} />
        ) : usuarios.length === 0 ? (
          <EmptyState
            icon={<Users size={20} strokeWidth={1.75} />}
            title="Nenhum operador cadastrado"
            description="Cadastre o primeiro operador utilizando o botão Novo Colaborador."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[var(--bg-inset)] text-[var(--text-muted)] text-xs border-b border-[var(--border-subtle)]">
                  <th className="py-3 px-4 font-medium">ID</th>
                  <th className="py-3 px-4 font-medium">Colaborador</th>
                  <th className="py-3 px-4 font-medium">Login</th>
                  <th className="py-3 px-4 font-medium">Perfil RBAC</th>
                  <th className="py-3 px-4 font-medium">Credencial</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-xs sm:text-sm">
                {usuarios.map((u) => {
                  const ehProprioUsuario = u.idUsuario === usuarioAtual?.idUsuario
                  return (
                    <tr key={u.idUsuario} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-muted)] tabular-nums">
                        #{u.idUsuario}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                          <span>{u.nome}</span>
                          {ehProprioUsuario && <Badge tone="brand">Você</Badge>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-secondary)]">
                        {u.login}
                      </td>
                      <td className="py-3.5 px-4">
                        {isAdmin && !ehProprioUsuario ? (
                          <select
                            aria-label={`Alterar perfil de ${u.nome}`}
                            value={u.perfil}
                            onChange={(e) => onAlterarPerfil(u, e.target.value)}
                            className="h-8 px-2.5 field-control text-xs [&>option]:bg-[var(--bg-surface)] cursor-pointer"
                          >
                            <option value="Vendedor">Vendedor</option>
                            <option value="Gerente">Gerente</option>
                            <option value="Administrador">Administrador</option>
                          </select>
                        ) : (
                          <PerfilBadge perfil={u.perfil} />
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-secondary)]">
                          <KeyRound size={13} strokeWidth={1.75} className="text-[var(--status-success)]" aria-hidden="true" />
                          <span>PBKDF2 (Oculto)</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.ativo ? (
                          <Badge tone="success" icon={<CheckCircle2 size={12} strokeWidth={2} aria-hidden="true" />}>
                            Ativo
                          </Badge>
                        ) : (
                          <Badge tone="danger" icon={<XCircle size={12} strokeWidth={2} aria-hidden="true" />}>
                            Bloqueado
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isAdmin ? (
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="icon"
                              disabled={ehProprioUsuario}
                              onClick={() => onAlternarAtivo(u)}
                              aria-label={u.ativo ? `Bloquear conta de ${u.nome}` : `Reativar conta de ${u.nome}`}
                              title={u.ativo ? 'Desativar conta' : 'Reativar conta'}
                            >
                              {u.ativo ? (
                                <UserX size={15} strokeWidth={1.75} aria-hidden="true" />
                              ) : (
                                <UserCheck size={15} strokeWidth={1.75} aria-hidden="true" />
                              )}
                            </Button>
                            <Button
                              variant="danger"
                              size="icon"
                              disabled={ehProprioUsuario}
                              onClick={() => onExcluir(u)}
                              aria-label={`Excluir usuário ${u.nome}`}
                              title="Excluir usuário"
                            >
                              <Trash2 size={15} strokeWidth={1.75} aria-hidden="true" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">Somente leitura</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader>
          <div>
            <CardTitle>Matriz de Permissões (RBAC)</CardTitle>
            <CardDescription>Regras aplicadas nas rotas do servidor</CardDescription>
          </div>
        </CardHeader>
        <CardBody className="space-y-3 text-xs">
          <div className="p-3.5 rounded-lg surface-inset space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--accent-text)]">Administrador</span>
              <span className="font-mono text-[11px] text-[var(--text-muted)]">Nível 3</span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Acesso total: cria e exclui usuários, altera perfis, cadastra produtos, aprova baixa financeira e consulta logs.
            </p>
          </div>

          <div className="p-3.5 rounded-lg surface-inset space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--status-info)]">Gerente</span>
              <span className="font-mono text-[11px] text-[var(--text-muted)]">Nível 2</span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Supervisão: consulta lista de usuários e histórico de acessos, cadastra produtos/categorias e liquida transações.
            </p>
          </div>

          <div className="p-3.5 rounded-lg surface-inset space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--status-success)]">Vendedor</span>
              <span className="font-mono text-[11px] text-[var(--text-muted)]">Nível 1</span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Perfil padrão do auto-cadastro: opera PDV de vendas, clientes e consulta estoque. Recebe 403 ao tentar listar usuários.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
