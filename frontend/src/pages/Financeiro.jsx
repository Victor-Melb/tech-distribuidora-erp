import React, { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Wallet, CheckCircle2, Clock } from 'lucide-react'
import api from '../services/api'
import { formatarDataBR, formatarMoeda } from '../utils/formatters'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { AlertBanner } from '../components/ui/AlertBanner'
import { EmptyState, ListSkeleton } from '../components/ui/EmptyState'

export default function Financeiro() {
  const [carregando, setCarregando] = useState(true)
  const [transacoes, setTransacoes] = useState([])
  const [filtroStatus, setFiltroStatus] = useState('Todas')
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [feedback, setFeedback] = useState(null)

  const carregarTransacoes = useCallback(async () => {
    setCarregando(true)
    try {
      const response = await api.get('/transacoes/')
      setTransacoes(response.data)
    } catch {
      setTransacoes([])
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    let ativo = true
    async function init() {
      try {
        const response = await api.get('/transacoes/')
        if (ativo) setTransacoes(response.data)
      } catch {
        if (ativo) setTransacoes([])
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    init()
    return () => {
      ativo = false
    }
  }, [])

  const darBaixa = async (id) => {
    setFeedback(null)
    try {
      await api.put(`/transacoes/${id}/pagar`)
      carregarTransacoes()
      setFeedback({ tipo: 'sucesso', texto: `Transação #${id} liquidada com sucesso.` })
    } catch (error) {
      setFeedback({ tipo: 'erro', texto: error.mensagemAmigavel })
    }
  }

  let receber = 0
  let pagar = 0
  let saldo = 0

  transacoes.forEach((t) => {
    const val = parseFloat(t.valor)
    if (t.tipo === 'Receber') {
      if (t.status === 'Pendente') receber += val
      if (t.status === 'Pago') saldo += val
    } else if (t.tipo === 'Pagar') {
      if (t.status === 'Pendente') pagar += val
      if (t.status === 'Pago') saldo -= val
    }
  })

  const transacoesFiltradas = transacoes
    .filter((t) => {
      if (filtroStatus !== 'Todas' && t.status !== filtroStatus) return false
      if (filtroTipo !== 'Todos' && t.tipo !== filtroTipo) return false
      return true
    })
    .sort((a, b) => new Date(b.dataVencimento) - new Date(a.dataVencimento))

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        eyebrow="Tesouraria e Fluxo de Caixa"
        title="Financeiro"
        description="Acompanhe contas a receber de pedidos, obrigações a pagar e liquidação de títulos."
      />

      {feedback && (
        <AlertBanner type={feedback.tipo} message={feedback.texto} onClose={() => setFeedback(null)} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="A Receber (Pendente)" value={formatarMoeda(receber)} subtext="Vendas a prazo em aberto" icon={<TrendingUp size={16} strokeWidth={1.75} />} tone="sapphire" />
        <StatCard label="A Pagar (Pendente)" value={formatarMoeda(pagar)} subtext="Fornecedores e importação" icon={<TrendingDown size={16} strokeWidth={1.75} />} tone="danger" />
        <StatCard
          label="Saldo Atual em Caixa"
          value={formatarMoeda(saldo)}
          subtext="Recebimentos menos pagamentos"
          icon={<Wallet size={16} strokeWidth={1.75} />}
          tone={saldo >= 0 ? 'success' : 'danger'}
          valueClassName={saldo >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'}
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Extrato Financeiro</CardTitle>
            <CardDescription>Lançamentos integrados automaticamente ao PDV</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <label htmlFor="fin-tipo" className="sr-only">Filtrar por tipo de transação</label>
            <select
              id="fin-tipo"
              className="h-9 px-3 field-control text-xs [&>option]:bg-[var(--bg-surface)]"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="Todos">Todos os tipos</option>
              <option value="Receber">Contas a Receber</option>
              <option value="Pagar">Contas a Pagar</option>
            </select>

            <label htmlFor="fin-status" className="sr-only">Filtrar por status</label>
            <select
              id="fin-status"
              className="h-9 px-3 field-control text-xs [&>option]:bg-[var(--bg-surface)]"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="Todas">Status: Todos</option>
              <option value="Pendente">Status: Pendente</option>
              <option value="Pago">Status: Pago</option>
            </select>
          </div>
        </CardHeader>

        {carregando ? (
          <ListSkeleton rows={4} />
        ) : transacoesFiltradas.length === 0 ? (
          <EmptyState icon={<Wallet size={20} strokeWidth={1.75} />} title="Nenhuma transação encontrada" description="Ajuste os filtros ou finalize uma venda no PDV para gerar lançamentos." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[var(--bg-inset)] text-[var(--text-muted)] text-xs border-b border-[var(--border-subtle)]">
                  <th className="py-3 px-4 font-medium">Código</th>
                  <th className="py-3 px-4 font-medium">Vencimento</th>
                  <th className="py-3 px-4 font-medium">Descrição</th>
                  <th className="py-3 px-4 font-medium">Tipo</th>
                  <th className="py-3 px-4 font-medium text-right">Valor</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Liquidação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-xs sm:text-sm">
                {transacoesFiltradas.map((t) => {
                  const isReceber = t.tipo === 'Receber'
                  const isPago = t.status === 'Pago'

                  return (
                    <tr key={t.idTransacao} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-muted)]">#{t.idTransacao}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-secondary)] tabular-nums">
                        {formatarDataBR(t.dataVencimento)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">{t.descricao}</td>
                      <td className="py-3.5 px-4"><Badge tone={isReceber ? 'sapphire' : 'danger'}>{t.tipo}</Badge></td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[var(--text-primary)] tabular-nums">
                        {formatarMoeda(t.valor)}
                      </td>
                      <td className="py-3.5 px-4">
                        {isPago ? (
                          <Badge tone="success" icon={<CheckCircle2 size={12} strokeWidth={2} aria-hidden="true" />}>Pago</Badge>
                        ) : (
                          <Badge tone="warning" icon={<Clock size={12} strokeWidth={2} aria-hidden="true" />}>Pendente</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isPago ? (
                          <Button variant="secondary" size="sm" onClick={() => darBaixa(t.idTransacao)}>Dar Baixa</Button>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">Concluído</span>
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
    </div>
  )
}
