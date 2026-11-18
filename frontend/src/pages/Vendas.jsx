import React, { useState, useEffect, useCallback } from 'react'
import { Package } from 'lucide-react'
import api from '../services/api'
import { formatarMoeda } from '../utils/formatters'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { AlertBanner } from '../components/ui/AlertBanner'
import { EmptyState, ListSkeleton } from '../components/ui/EmptyState'
import { OrderSummary } from '../components/vendas/OrderSummary'

export default function Vendas() {
  const [carregando, setCarregando] = useState(true)
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])

  const [carrinho, setCarrinho] = useState([])
  const [clienteSelecionado, setClienteSelecionado] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('PIX')
  const [isFinalizando, setIsFinalizando] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const carregarPDV = useCallback(async () => {
    setCarregando(true)
    try {
      const [resCli, resProd] = await Promise.all([api.get('/clientes/'), api.get('/produtos/')])
      setClientes(resCli.data)
      setProdutos(resProd.data.filter((p) => p.estoque > 0))
    } catch {
      setClientes([])
      setProdutos([])
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    let ativo = true
    async function init() {
      try {
        const [resCli, resProd] = await Promise.all([api.get('/clientes/'), api.get('/produtos/')])
        if (ativo) {
          setClientes(resCli.data)
          setProdutos(resProd.data.filter((p) => p.estoque > 0))
        }
      } catch {
        if (ativo) {
          setClientes([])
          setProdutos([])
        }
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    init()
    return () => {
      ativo = false
    }
  }, [])

  const adicionarAoCarrinho = (produto) => {
    setFeedback(null)
    const itemNoCarrinho = carrinho.find((i) => i.idProduto === produto.idProduto)

    if (itemNoCarrinho) {
      if (itemNoCarrinho.quantidade < produto.estoque) {
        setCarrinho(
          carrinho.map((i) =>
            i.idProduto === produto.idProduto ? { ...i, quantidade: i.quantidade + 1 } : i
          )
        )
      } else {
        setFeedback({ tipo: 'erro', texto: 'Estoque insuficiente para adicionar mais deste item.' })
      }
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }])
    }
  }

  const alterarQuantidade = (id, delta) => {
    setCarrinho(
      carrinho
        .map((i) => {
          if (i.idProduto === id) {
            const novaQtd = i.quantidade + delta
            if (novaQtd < 1) return null
            if (novaQtd > produtos.find((p) => p.idProduto === id)?.estoque) return i
            return { ...i, quantidade: novaQtd }
          }
          return i
        })
        .filter(Boolean)
    )
  }

  const removerDoCarrinho = (id) => {
    setCarrinho(carrinho.filter((i) => i.idProduto !== id))
  }

  const totalVenda = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0)

  const finalizarVenda = async () => {
    if (!clienteSelecionado || carrinho.length === 0) return
    setIsFinalizando(true)
    setFeedback(null)
    try {
      const res = await api.post('/vendas/realizar', {
        idCliente: parseInt(clienteSelecionado, 10),
        formaPagamento,
        itens: carrinho.map((i) => ({ idProduto: i.idProduto, quantidade: i.quantidade })),
      })
      setFeedback({
        tipo: 'sucesso',
        texto: `Venda #${res.data.idVenda} realizada com sucesso. Estoque, Financeiro e Logística atualizados.`,
      })
      setCarrinho([])
      setClienteSelecionado('')
      carregarPDV()
    } catch (error) {
      setFeedback({ tipo: 'erro', texto: error.mensagemAmigavel || 'Erro ao finalizar venda.' })
    } finally {
      setIsFinalizando(false)
    }
  }

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        eyebrow="Frente de Caixa B2B"
        title="Ponto de Venda (PDV)"
        description="Selecione produtos disponíveis em estoque, vincule ao cliente e gere faturamento automático."
      />

      {feedback && (
        <AlertBanner
          type={feedback.tipo}
          message={feedback.texto}
          onClose={() => setFeedback(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7">
          <CardHeader>
            <div>
              <CardTitle>Catálogo Disponível para Venda</CardTitle>
              <CardDescription>Clique ou pressione Enter para incluir no pedido</CardDescription>
            </div>
            <Badge tone="neutral" mono>
              {produtos.length} disponíveis
            </Badge>
          </CardHeader>
          <CardBody>
            {carregando ? (
              <ListSkeleton rows={4} />
            ) : produtos.length === 0 ? (
              <EmptyState
                icon={<Package size={20} strokeWidth={1.75} />}
                title="Sem produtos disponíveis"
                description="Não há itens com saldo positivo em estoque no momento."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {produtos.map((produto) => (
                  <button
                    type="button"
                    key={produto.idProduto}
                    onClick={() => adicionarAoCarrinho(produto)}
                    className="surface-card surface-card-interactive rounded-xl p-4 text-left flex flex-col justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)] leading-snug">
                        {produto.nome}
                      </span>
                      <Badge tone={produto.estoque < 10 ? 'warning' : 'success'} mono>
                        {produto.estoque} un
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-[var(--border-subtle)]">
                      <span className="text-xs text-[var(--text-muted)]">Adicionar ao pedido</span>
                      <span className="font-mono text-sm font-semibold text-[var(--accent-text)] tabular-nums">
                        {formatarMoeda(produto.preco)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <OrderSummary
          clientes={clientes}
          clienteSelecionado={clienteSelecionado}
          onSelectCliente={setClienteSelecionado}
          formaPagamento={formaPagamento}
          onSelectPagamento={setFormaPagamento}
          carrinho={carrinho}
          onAlterarQtd={alterarQuantidade}
          onRemoverItem={removerDoCarrinho}
          totalVenda={totalVenda}
          isFinalizando={isFinalizando}
          onFinalizar={finalizarVenda}
        />
      </div>
    </div>
  )
}
