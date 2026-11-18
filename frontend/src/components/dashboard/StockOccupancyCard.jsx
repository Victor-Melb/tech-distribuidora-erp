import React from 'react'
import { ArrowRight, Package } from 'lucide-react'
import { formatarMoeda } from '../../utils/formatters'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { EmptyState, ListSkeleton } from '../ui/EmptyState'

export function StockOccupancyCard({ produtos, carregando, onNavigateEstoque }) {
  const maxEstoque = Math.max(...produtos.map((p) => p.estoque), 25)

  return (
    <Card className="lg:col-span-7">
      <CardHeader>
        <div>
          <CardTitle>Ocupação Física por Produto (SKU)</CardTitle>
          <CardDescription>
            Itens abaixo de 10 unidades são destacados para reposição imediata
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onNavigateEstoque}>
          <span>Gerenciar estoque</span>
          <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" />
        </Button>
      </CardHeader>
      <CardBody>
        {carregando ? (
          <ListSkeleton rows={4} />
        ) : produtos.length === 0 ? (
          <EmptyState
            icon={<Package size={20} strokeWidth={1.75} />}
            title="Sem produtos no estoque"
            description="Cadastre itens no módulo de Estoque para acompanhar os níveis aqui."
          />
        ) : (
          <div className="space-y-4">
            {produtos.map((prod) => {
              const critico = prod.estoque < 10
              const pct = Math.min(100, Math.max(5, (prod.estoque / maxEstoque) * 100))
              return (
                <div key={prod.idProduto} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs text-[var(--text-muted)] shrink-0">
                        #{String(prod.idProduto).padStart(3, '0')}
                      </span>
                      <span className="font-medium text-[var(--text-primary)] truncate">
                        {prod.nome}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 font-mono text-xs tabular-nums">
                      <span className="text-[var(--text-muted)]">{formatarMoeda(prod.preco)}</span>
                      <Badge tone={critico ? 'warning' : 'success'} mono>
                        {prod.estoque} un
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-inset)] border border-[var(--border-subtle)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: critico ? '#F59E0B' : 'var(--accent)',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
