import React, { useState, useEffect, useCallback } from 'react'
import { Truck, Package, CheckCircle2, Search, Clock } from 'lucide-react'
import api from '../services/api'
import { formatarDataBR } from '../utils/formatters'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState, ListSkeleton } from '../components/ui/EmptyState'

function gerarCodigoRastreio(idEntrega) {
  const sufixo = String((Date.now() + idEntrega * 7919) % 100000000).padStart(8, '0')
  return `BR${sufixo}SP`
}

function StatusEntregaBadge({ status }) {
  if (status === 'Preparando') {
    return <Badge tone="warning" icon={<Clock size={12} strokeWidth={2} aria-hidden="true" />}>Preparando</Badge>
  }
  if (status === 'Em Trânsito') {
    return <Badge tone="sapphire" icon={<Truck size={12} strokeWidth={2} aria-hidden="true" />}>Em Trânsito</Badge>
  }
  return <Badge tone="success" icon={<CheckCircle2 size={12} strokeWidth={2} aria-hidden="true" />}>Entregue</Badge>
}

export default function Logistica() {
  const [carregando, setCarregando] = useState(true)
  const [entregas, setEntregas] = useState([])
  const [busca, setBusca] = useState('')

  const carregarEntregas = useCallback(async () => {
    setCarregando(true)
    try {
      const resEntregas = await api.get('/entregas/')
      setEntregas(resEntregas.data)
    } catch {
      setEntregas([])
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    let ativo = true
    async function init() {
      try {
        const resEntregas = await api.get('/entregas/')
        if (ativo) setEntregas(resEntregas.data)
      } catch {
        if (ativo) setEntregas([])
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    init()
    return () => {
      ativo = false
    }
  }, [])

  const despachar = async (idEntrega) => {
    const rastreio = gerarCodigoRastreio(idEntrega)
    try {
      await api.put(`/entregas/${idEntrega}/status?status=${encodeURIComponent('Em Trânsito')}&codigoRastreio=${rastreio}`)
      carregarEntregas()
    } catch {
      // Silencioso
    }
  }

  const marcarEntregue = async (idEntrega) => {
    try {
      await api.put(`/entregas/${idEntrega}/status?status=Entregue`)
      carregarEntregas()
    } catch {
      // Silencioso
    }
  }

  const prepCount = entregas.filter((e) => e.status === 'Preparando').length
  const transCount = entregas.filter((e) => e.status === 'Em Trânsito').length
  const delCount = entregas.filter((e) => e.status === 'Entregue').length

  const entregasFiltradas = entregas.filter(
    (e) =>
      String(e.idVenda).includes(busca) ||
      (e.codigoRastreio || '').toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        eyebrow="Expedição e Transporte"
        title="Logística e Entregas"
        description="Acompanhe a separação de pedidos, gere códigos de rastreio e confirme entregas."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Em Separação (Preparando)" value={prepCount} subtext="Aguardando despacho" icon={<Package size={16} strokeWidth={1.75} />} tone="warning" />
        <StatCard label="Em Trânsito" value={transCount} subtext="Com código de rastreio emitido" icon={<Truck size={16} strokeWidth={1.75} />} tone="sapphire" />
        <StatCard label="Entregas Concluídas" value={delCount} subtext="Recebimento confirmado" icon={<CheckCircle2 size={16} strokeWidth={1.75} />} tone="success" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Rastreamento de Pacotes</CardTitle>
            <CardDescription>Remessas geradas automaticamente a cada venda</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={16} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              aria-label="Buscar por código de rastreio ou venda"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar rastreio ou venda"
              className="pl-10 pr-3 h-9 field-control w-full text-xs sm:text-sm"
            />
          </div>
        </CardHeader>

        {carregando ? (
          <ListSkeleton rows={3} />
        ) : entregasFiltradas.length === 0 ? (
          <EmptyState icon={<Truck size={20} strokeWidth={1.75} />} title="Nenhuma entrega registrada" description="As entregas são criadas automaticamente ao concluir uma venda." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[var(--bg-inset)] text-[var(--text-muted)] text-xs border-b border-[var(--border-subtle)]">
                  <th className="py-3 px-4 font-medium">Venda</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Código de Rastreio</th>
                  <th className="py-3 px-4 font-medium">Previsão</th>
                  <th className="py-3 px-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-xs sm:text-sm">
                {entregasFiltradas.map((e) => (
                  <tr key={e.idEntrega} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-secondary)]">#{e.idVenda}</td>
                    <td className="py-3.5 px-4"><StatusEntregaBadge status={e.status} /></td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[var(--accent-text)] font-medium">{e.codigoRastreio || '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-secondary)] tabular-nums">{formatarDataBR(e.dataPrevisao)}</td>
                    <td className="py-3.5 px-4 text-right">
                      {e.status === 'Preparando' && <Button variant="primary" size="sm" onClick={() => despachar(e.idEntrega)}>Despachar</Button>}
                      {e.status === 'Em Trânsito' && <Button variant="secondary" size="sm" onClick={() => marcarEntregue(e.idEntrega)}>Confirmar Entrega</Button>}
                      {e.status === 'Entregue' && <span className="text-xs text-[var(--text-muted)]">Finalizada</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
