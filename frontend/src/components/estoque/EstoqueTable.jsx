import React from 'react'
import { Plus, Minus, Search, Package, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { formatarMoeda } from '../../utils/formatters'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { EmptyState, ListSkeleton } from '../ui/EmptyState'

export function EstoqueTable({
  produtos,
  categorias,
  busca,
  onChangeBusca,
  carregando,
  estoqueMinimo,
  onAjustarEstoque,
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            strokeWidth={1.75}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Buscar produtos no estoque"
            value={busca}
            onChange={(e) => onChangeBusca(e.target.value)}
            placeholder="Buscar produto"
            className="pl-10 pr-3 h-9 field-control w-full text-xs sm:text-sm"
          />
        </div>
        <Badge tone="neutral" mono>
          {produtos.length} exibidos
        </Badge>
      </CardHeader>

      {carregando ? (
        <ListSkeleton rows={4} />
      ) : produtos.length === 0 ? (
        <EmptyState
          icon={<Package size={20} strokeWidth={1.75} />}
          title="Nenhum produto encontrado"
          description="Cadastre produtos ou ajuste o filtro de busca."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[var(--bg-inset)] text-[var(--text-muted)] text-xs border-b border-[var(--border-subtle)]">
                <th className="py-3 px-4 font-medium">SKU</th>
                <th className="py-3 px-4 font-medium">Produto</th>
                <th className="py-3 px-4 font-medium">Categoria</th>
                <th className="py-3 px-4 font-medium text-right">Custo</th>
                <th className="py-3 px-4 font-medium text-right">Preço Venda</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Saldo (Entrada/Saída)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-xs sm:text-sm">
              {produtos.map((produto) => {
                const isBaixo = produto.estoque < estoqueMinimo
                const catName =
                  categorias.find((c) => c.idCategoria === produto.idCategoria)?.nome || 'Geral'

                return (
                  <tr key={produto.idProduto} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-muted)]">
                      #{produto.idProduto}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">{produto.nome}</td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{catName}</td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[var(--text-muted)]">
                      {formatarMoeda(produto.custo)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-medium text-[var(--text-primary)]">
                      {formatarMoeda(produto.preco)}
                    </td>
                    <td className="py-3.5 px-4">
                      {isBaixo ? (
                        <Badge tone="warning" icon={<AlertTriangle size={12} strokeWidth={2} aria-hidden="true" />}>
                          Estoque Baixo
                        </Badge>
                      ) : (
                        <Badge tone="success" icon={<CheckCircle2 size={12} strokeWidth={2} aria-hidden="true" />}>
                          Normal
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => onAjustarEstoque(produto, -1)}
                          disabled={produto.estoque === 0}
                          aria-label={`Diminuir estoque de ${produto.nome}`}
                          title="Registrar saída (-1)"
                        >
                          <Minus size={14} strokeWidth={1.75} aria-hidden="true" />
                        </Button>
                        <span
                          className={`font-mono font-semibold w-10 text-center tabular-nums ${
                            isBaixo ? 'text-[var(--status-warning)]' : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {produto.estoque}
                        </span>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => onAjustarEstoque(produto, 1)}
                          aria-label={`Aumentar estoque de ${produto.nome}`}
                          title="Registrar entrada (+1)"
                        >
                          <Plus size={14} strokeWidth={1.75} aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
