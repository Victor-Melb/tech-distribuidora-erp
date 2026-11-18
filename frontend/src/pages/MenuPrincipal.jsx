import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  Package,
  Truck,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Users,
  ShoppingCart,
  Activity,
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/useAuth'
import { formatarMoeda } from '../utils/formatters'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState, ListSkeleton } from '../components/ui/EmptyState'
import { StockOccupancyCard } from '../components/dashboard/StockOccupancyCard'

export default function MenuPrincipal() {
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState({
    totalVendas: 0,
    estoqueBaixo: 0,
    totalUnidades: 0,
    entregasPendentes: 0,
    entregasTotal: 0,
    clientesAtivos: 0,
    faturamentoMensal: 0,
    margemEstoque: 0,
    produtos: [],
    transacoesRecentes: [],
  })

  useEffect(() => {
    let ativo = true
    async function fetchDashboard() {
      try {
        const [resV, resP, resE, resC, resT] = await Promise.all([
          api.get('/vendas/'),
          api.get('/produtos/'),
          api.get('/entregas/'),
          api.get('/clientes/'),
          api.get('/transacoes/'),
        ])
        if (!ativo) return

        const faturamento = resV.data.reduce((acc, v) => acc + parseFloat(v.valorTotal), 0)
        const totalUnidades = resP.data.reduce((acc, p) => acc + p.estoque, 0)
        const margem = resP.data.reduce(
          (acc, p) => acc + (parseFloat(p.preco) - parseFloat(p.custo || 0)) * p.estoque,
          0
        )

        setDados({
          totalVendas: resV.data.length,
          estoqueBaixo: resP.data.filter((p) => p.estoque < 10).length,
          totalUnidades,
          entregasPendentes: resE.data.filter((e) => e.status !== 'Entregue').length,
          entregasTotal: resE.data.length,
          clientesAtivos: resC.data.length,
          faturamentoMensal: faturamento,
          margemEstoque: margem,
          produtos: resP.data,
          transacoesRecentes: resT.data.slice(-5).reverse(),
        })
      } catch {
        // Silencioso caso API esteja reiniciando
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    fetchDashboard()
    return () => {
      ativo = false
    }
  }, [])

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        eyebrow={`Operação Ativa · Perfil ${usuario?.perfil || 'Colaborador'}`}
        title={`Painel Executivo — ${usuario?.nome || 'Distribuidora'}`}
        description="Acompanhe em tempo real o faturamento, os lotes críticos em estoque e o status das expedições."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/usuarios')}>
              <ShieldCheck size={16} strokeWidth={1.75} className="text-[var(--accent-text)]" aria-hidden="true" />
              <span>Usuários e Auditoria</span>
            </Button>
            <Button variant="primary" onClick={() => navigate('/vendas')}>
              <ShoppingCart size={16} strokeWidth={1.75} aria-hidden="true" />
              <span>Nova Venda (PDV)</span>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Faturamento Acumulado"
          value={formatarMoeda(dados.faturamentoMensal)}
          subtext={`${dados.totalVendas} pedidos faturados`}
          icon={<TrendingUp size={16} strokeWidth={1.75} />}
          tone="brand"
        />
        <StatCard
          label="Margem Bruta em Estoque"
          value={formatarMoeda(dados.margemEstoque)}
          subtext={`${dados.totalUnidades} unidades físicas disponíveis`}
          icon={<CreditCard size={16} strokeWidth={1.75} />}
          tone="sapphire"
        />
        <StatCard
          label="Alertas de Reposição"
          value={`${dados.estoqueBaixo} itens`}
          subtext={`De ${dados.produtos.length} SKUs cadastrados (< 10 un)`}
          icon={<Package size={16} strokeWidth={1.75} />}
          tone={dados.estoqueBaixo > 0 ? 'warning' : 'success'}
          valueClassName={dados.estoqueBaixo > 0 ? 'text-[var(--status-warning)]' : 'text-[var(--status-success)]'}
        />
        <StatCard
          label="Entregas em Aberto"
          value={`${dados.entregasPendentes} remessas`}
          subtext={`De ${dados.entregasTotal} expedições registradas`}
          icon={<Truck size={16} strokeWidth={1.75} />}
          tone="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <StockOccupancyCard
          produtos={dados.produtos}
          carregando={carregando}
          onNavigateEstoque={() => navigate('/estoque')}
        />

        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={16} strokeWidth={1.75} className="text-[var(--accent-text)]" aria-hidden="true" />
                  <span>Movimentação Financeira Recente</span>
                </CardTitle>
                <CardDescription>Últimos títulos lançados no caixa</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/financeiro')}>
                <span>Ver extrato</span>
                <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" />
              </Button>
            </CardHeader>

            <CardBody className="divide-y divide-[var(--border-subtle)] py-2">
              {carregando ? (
                <ListSkeleton rows={3} />
              ) : dados.transacoesRecentes.length === 0 ? (
                <EmptyState
                  icon={<CreditCard size={20} strokeWidth={1.75} />}
                  title="Sem lançamentos financeiros"
                  description="As vendas e contas a pagar aparecerão aqui automaticamente."
                />
              ) : (
                dados.transacoesRecentes.map((t) => {
                  const isReceber = t.tipo === 'Receber'
                  return (
                    <div key={t.idTransacao} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)] truncate">
                          {t.descricao}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge tone={isReceber ? 'sapphire' : 'danger'}>{t.tipo}</Badge>
                          <span className="text-xs text-[var(--text-muted)]">{t.status}</span>
                        </div>
                      </div>
                      <span
                        className={`font-mono text-xs sm:text-sm font-semibold tabular-nums shrink-0 ${
                          isReceber ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'
                        }`}
                      >
                        {isReceber ? '+' : '-'} {formatarMoeda(t.valor)}
                      </span>
                    </div>
                  )
                })
              )}
            </CardBody>
          </div>

          <div className="px-5 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-inset)] flex items-center justify-between rounded-b-xl">
            <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
              <Users size={16} strokeWidth={1.75} className="text-[var(--accent-text)]" aria-hidden="true" />
              <span>Clientes B2B ativos no ERP</span>
            </div>
            <Badge tone="brand" mono>{dados.clientesAtivos} empresas</Badge>
          </div>
        </Card>
      </div>
    </div>
  )
}
