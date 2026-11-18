import React from 'react'
import { Plus, Minus, Trash2, CheckCircle2, ShoppingCart } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { EmptyState } from '../ui/EmptyState'
import { formatarMoeda } from '../../utils/formatters'

export function OrderSummary({
  clientes,
  clienteSelecionado,
  onSelectCliente,
  formaPagamento,
  onSelectPagamento,
  carrinho,
  onAlterarQtd,
  onRemoverItem,
  totalVenda,
  isFinalizando,
  onFinalizar,
}) {
  return (
    <Card className="lg:col-span-5 flex flex-col justify-between">
      <div>
        <CardHeader>
          <div>
            <CardTitle>Resumo do Pedido</CardTitle>
            <CardDescription>Configuração de cliente e pagamento</CardDescription>
          </div>
          <Badge tone="brand" mono>
            {carrinho.reduce((acc, i) => acc + i.quantidade, 0)} itens
          </Badge>
        </CardHeader>

        <CardBody className="space-y-5">
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label htmlFor="venda-cliente" className="block text-xs font-medium text-[var(--text-secondary)]">
                Cliente comprador
              </label>
              <select
                id="venda-cliente"
                className="w-full h-10 px-3 field-control text-sm [&>option]:bg-[var(--bg-surface)]"
                value={clienteSelecionado}
                onChange={(e) => onSelectCliente(e.target.value)}
              >
                <option value="" disabled>
                  Selecione o cliente...
                </option>
                {clientes.map((c) => (
                  <option key={c.idCliente} value={c.idCliente}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="venda-pagamento" className="block text-xs font-medium text-[var(--text-secondary)]">
                Forma de pagamento
              </label>
              <select
                id="venda-pagamento"
                className="w-full h-10 px-3 field-control text-sm [&>option]:bg-[var(--bg-surface)]"
                value={formaPagamento}
                onChange={(e) => onSelectPagamento(e.target.value)}
              >
                <option value="PIX">PIX (À Vista)</option>
                <option value="Dinheiro">Dinheiro (À Vista)</option>
                <option value="Débito">Cartão de Débito (À Vista)</option>
                <option value="Cartão de Crédito">Cartão de Crédito (Prazo)</option>
                <option value="Boleto">Boleto (Prazo)</option>
              </select>
            </div>
          </div>

          <div className="min-h-[180px] max-h-72 overflow-y-auto divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {carrinho.length === 0 ? (
              <EmptyState
                icon={<ShoppingCart size={20} strokeWidth={1.75} />}
                title="Carrinho vazio"
                description="Selecione produtos do catálogo ao lado para compor o pedido."
              />
            ) : (
              carrinho.map((item) => (
                <div key={item.idProduto} className="py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)] truncate">
                      {item.nome}
                    </p>
                    <p className="font-mono text-xs text-[var(--status-success)] tabular-nums mt-0.5">
                      {formatarMoeda(item.preco * item.quantidade)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => onAlterarQtd(item.idProduto, -1)}
                      aria-label={`Diminuir quantidade de ${item.nome}`}
                    >
                      <Minus size={14} strokeWidth={1.75} aria-hidden="true" />
                    </Button>
                    <span className="font-mono text-xs font-semibold w-6 text-center text-[var(--text-primary)] tabular-nums">
                      {item.quantidade}
                    </span>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => onAlterarQtd(item.idProduto, 1)}
                      aria-label={`Aumentar quantidade de ${item.nome}`}
                    >
                      <Plus size={14} strokeWidth={1.75} aria-hidden="true" />
                    </Button>
                    <Button
                      variant="danger"
                      size="icon"
                      onClick={() => onRemoverItem(item.idProduto)}
                      aria-label={`Remover ${item.nome} do pedido`}
                      className="ml-1"
                    >
                      <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </div>

      <div className="p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-inset)] space-y-4 rounded-b-xl">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-medium text-[var(--text-secondary)]">Total do Pedido</span>
          <span className="font-mono text-2xl font-semibold text-[var(--text-primary)] tabular-nums">
            {formatarMoeda(totalVenda)}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={onFinalizar}
          disabled={isFinalizando || carrinho.length === 0 || !clienteSelecionado}
          className="w-full"
        >
          <CheckCircle2 size={17} strokeWidth={1.75} aria-hidden="true" />
          <span>{isFinalizando ? 'Processando venda...' : 'Finalizar Venda'}</span>
        </Button>
      </div>
    </Card>
  )
}
