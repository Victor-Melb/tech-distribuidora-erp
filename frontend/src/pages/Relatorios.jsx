import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Users, Target, Layers } from 'lucide-react'
import api from '../services/api'
import { formatarMoeda } from '../utils/formatters'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { EmptyState, ListSkeleton } from '../components/ui/EmptyState'

export default function Relatorios() {
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState({ vendas: [], produtos: [], clientes: [], transacoes: [] })

  useEffect(() => {
    let ativo = true
    async function fetchAll() {
      try {
        const [resV, resP, resC, resT] = await Promise.all([
          api.get('/vendas/'),
          api.get('/produtos/'),
          api.get('/clientes/'),
          api.get('/transacoes/'),
        ])
        if (ativo) {
          setDados({ vendas: resV.data, produtos: resP.data, clientes: resC.data, transacoes: resT.data })
        }
      } catch {
        // Silencioso caso API esteja offline
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    fetchAll()
    return () => {
      ativo = false
    }
  }, [])

  const faturamentoTotal = dados.vendas.reduce((acc, v) => acc + parseFloat(v.valorTotal), 0)
  const ticketMedio = dados.vendas.length > 0 ? faturamentoTotal / dados.vendas.length : 0
  const totalClientes = dados.clientes.length

  const contasPagas = dados.transacoes.filter((t) => t.status === 'Pago' && t.tipo === 'Receber').length
  const contasPendentes = dados.transacoes.filter((t) => t.status === 'Pendente' && t.tipo === 'Receber').length
  const taxaInadimplencia =
    contasPagas + contasPendentes > 0 ? (contasPendentes / (contasPagas + contasPendentes)) * 100 : 0

  const saudeEstoquePct =
    dados.produtos.length > 0
      ? (dados.produtos.filter((p) => p.estoque > 0).length / dados.produtos.length) * 100
      : 0

  const estoqueAdequadoPct =
    dados.produtos.length > 0
      ? (dados.produtos.filter((p) => p.estoque >= 10).length / dados.produtos.length) * 100
      : 0

  const valorVendaCatalogo = dados.produtos.reduce((acc, p) => acc + parseFloat(p.preco) * p.estoque, 0)

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        eyebrow="Inteligência Comercial e Estoque"
        title="Relatórios e Indicadores Gerenciais"
        description="Métricas consolidadas a partir dos pedidos, títulos a receber e margem unitária de cada SKU."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Faturamento Bruto" value={formatarMoeda(faturamentoTotal)} subtext={`${dados.vendas.length} pedidos emitidos`} icon={<DollarSign size={16} strokeWidth={1.75} />} tone="brand" />
        <StatCard label="Ticket Médio por Venda" value={formatarMoeda(ticketMedio)} subtext="Média por pedido B2B" icon={<TrendingUp size={16} strokeWidth={1.75} />} tone="sapphire" />
        <StatCard label="Base de Clientes" value={`${totalClientes} empresas`} subtext="Cadastros ativos no sistema" icon={<Users size={16} strokeWidth={1.75} />} tone="success" />
        <StatCard label="Pendência a Receber" value={`${taxaInadimplencia.toFixed(1)}%`} subtext={`${contasPendentes} de ${contasPagas + contasPendentes} títulos`} icon={<Target size={16} strokeWidth={1.75} />} tone={taxaInadimplencia > 30 ? 'warning' : 'success'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7">
          <CardHeader>
            <div>
              <CardTitle>Margem Unitária e Valor em Estoque por Produto</CardTitle>
              <CardDescription>Relação real entre custo de aquisição e preço de venda praticado</CardDescription>
            </div>
            <Badge tone="brand" mono>
              Potencial: {formatarMoeda(valorVendaCatalogo)}
            </Badge>
          </CardHeader>
          <CardBody>
            {carregando ? (
              <ListSkeleton rows={4} />
            ) : dados.produtos.length === 0 ? (
              <EmptyState icon={<Layers size={20} strokeWidth={1.75} />} title="Sem dados de produtos" description="Cadastre produtos com preço e custo para visualizar a análise de margem." />
            ) : (
              <div className="space-y-4">
                {dados.produtos.map((p) => {
                  const preco = parseFloat(p.preco) || 1
                  const custo = parseFloat(p.custo || 0)
                  const margemPct = Math.max(0, ((preco - custo) / preco) * 100)
                  return (
                    <div key={p.idProduto} className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                        <span className="font-medium text-[var(--text-primary)] truncate">{p.nome}</span>
                        <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
                          <span className="text-[var(--text-muted)]">Custo {formatarMoeda(custo)}</span>
                          <span className="text-[var(--text-secondary)]">Venda {formatarMoeda(preco)}</span>
                          <Badge tone="brand" mono>+{margemPct.toFixed(1)}%</Badge>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-inset)] border border-[var(--border-subtle)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500"
                          style={{ width: `${Math.min(100, margemPct)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <CardHeader>
              <div>
                <CardTitle>Saúde do Catálogo e Caixa</CardTitle>
                <CardDescription>Indicadores calculados em tempo real</CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span className="text-[var(--text-secondary)]">Disponibilidade em estoque (&gt; 0 un)</span>
                  <span className="font-mono font-semibold text-[var(--status-success)] tabular-nums">
                    {saudeEstoquePct.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-inset)] rounded-full h-2.5 border border-[var(--border-subtle)] overflow-hidden">
                  <div className="bg-[var(--status-success)] h-full rounded-full" style={{ width: `${saudeEstoquePct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span className="text-[var(--text-secondary)]">Itens em nível confortável (≥ 10 un)</span>
                  <span className="font-mono font-semibold text-[var(--accent-text)] tabular-nums">
                    {estoqueAdequadoPct.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-inset)] rounded-full h-2.5 border border-[var(--border-subtle)] overflow-hidden">
                  <div className="bg-[var(--accent)] h-full rounded-full" style={{ width: `${estoqueAdequadoPct}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-lg surface-inset text-xs text-[var(--text-secondary)] leading-relaxed">
                Os valores exibidos refletem diretamente os registros gravados no banco SQLite da TechDistribuidora, integrando vendas, baixas de estoque e contas financeiras.
              </div>
            </CardBody>
          </div>
        </Card>
      </div>
    </div>
  )
}
