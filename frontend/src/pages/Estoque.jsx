import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/useAuth'
import { formatarMoeda } from '../utils/formatters'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { Button } from '../components/ui/Button'
import { AlertBanner } from '../components/ui/AlertBanner'
import { CategoriaFormCard, ProdutoFormCard } from '../components/estoque/ProdutoForms'
import { EstoqueTable } from '../components/estoque/EstoqueTable'

const ESTOQUE_MINIMO = 10

export default function Estoque() {
  const { temPermissao } = useAuth()
  const podeCadastrar = temPermissao(['Administrador', 'Gerente'])

  const [carregando, setCarregando] = useState(true)
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [busca, setBusca] = useState('')
  const [feedback, setFeedback] = useState(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isCatFormOpen, setIsCatFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    idCategoria: '',
    nome: '',
    descricao: '',
    preco: '',
    custo: '',
    estoque: '',
  })
  const [catFormData, setCatFormData] = useState({ nome: '', descricao: '' })

  const carregarEstoque = useCallback(async () => {
    setCarregando(true)
    try {
      const [resCat, resProd] = await Promise.all([api.get('/categorias/'), api.get('/produtos/')])
      setCategorias(resCat.data)
      setProdutos(resProd.data)
    } catch {
      setCategorias([])
      setProdutos([])
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    let ativo = true
    async function init() {
      try {
        const [resCat, resProd] = await Promise.all([api.get('/categorias/'), api.get('/produtos/')])
        if (ativo) {
          setCategorias(resCat.data)
          setProdutos(resProd.data)
        }
      } catch {
        if (ativo) {
          setCategorias([])
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFeedback(null)
    try {
      await api.post('/produtos/', {
        ...formData,
        idCategoria: parseInt(formData.idCategoria, 10),
        preco: parseFloat(formData.preco),
        custo: parseFloat(formData.custo || 0),
        estoque: parseInt(formData.estoque, 10),
      })
      await carregarEstoque()
      setIsFormOpen(false)
      setFormData({ idCategoria: '', nome: '', descricao: '', preco: '', custo: '', estoque: '' })
      setFeedback({ tipo: 'sucesso', texto: 'Produto cadastrado no estoque com sucesso.' })
    } catch (error) {
      setFeedback({ tipo: 'erro', texto: error.mensagemAmigavel || 'Erro ao salvar produto.' })
    }
  }

  const handleCatSubmit = async (e) => {
    e.preventDefault()
    setFeedback(null)
    try {
      await api.post('/categorias/', catFormData)
      await carregarEstoque()
      setIsCatFormOpen(false)
      setCatFormData({ nome: '', descricao: '' })
      setFeedback({ tipo: 'sucesso', texto: 'Nova categoria criada com sucesso.' })
    } catch (error) {
      setFeedback({ tipo: 'erro', texto: error.mensagemAmigavel || 'Erro ao salvar categoria.' })
    }
  }

  const ajustarEstoque = async (produto, ajuste) => {
    const novoEstoque = produto.estoque + ajuste
    if (novoEstoque < 0) return
    try {
      await api.put(`/produtos/${produto.idProduto}`, {
        idCategoria: produto.idCategoria,
        nome: produto.nome,
        descricao: produto.descricao,
        preco: parseFloat(produto.preco),
        custo: parseFloat(produto.custo || 0),
        estoque: novoEstoque,
      })
      carregarEstoque()
    } catch (error) {
      setFeedback({ tipo: 'erro', texto: error.mensagemAmigavel })
    }
  }

  const totalItens = produtos.reduce((acc, p) => acc + p.estoque, 0)
  const capitalInvestido = produtos.reduce((acc, p) => acc + parseFloat(p.custo || 0) * p.estoque, 0)
  const lucroProjetado = produtos.reduce((acc, p) => acc + (parseFloat(p.preco) - parseFloat(p.custo || 0)) * p.estoque, 0)
  const itensEmAlerta = produtos.filter((p) => p.estoque < ESTOQUE_MINIMO).length
  const produtosFiltrados = produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()))

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        eyebrow="Inventário e Lotes"
        title="Controle de Estoque"
        description="Gerencie o catálogo de hardware, custos unitários e entradas/saídas físicas."
        actions={
          podeCadastrar && !isFormOpen && (
            <Button variant="primary" onClick={() => setIsFormOpen(true)}>
              <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
              <span>Cadastrar Produto</span>
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total de Itens Físicos" value={totalItens} subtext={`${produtos.length} SKUs em catálogo`} icon={<Package size={16} strokeWidth={1.75} />} tone="sapphire" />
        <StatCard label="Capital Investido (Custo)" value={formatarMoeda(capitalInvestido)} subtext="Valor de aquisição do estoque" icon={<DollarSign size={16} strokeWidth={1.75} />} tone="brand" />
        <StatCard label="Lucro Projetado" value={formatarMoeda(lucroProjetado)} subtext="Margem potencial de venda" icon={<TrendingUp size={16} strokeWidth={1.75} />} tone="success" />
        <StatCard
          label={`Alertas (< ${ESTOQUE_MINIMO} un)`}
          value={itensEmAlerta}
          subtext="Itens em ponto de reposição"
          icon={<AlertTriangle size={16} strokeWidth={1.75} />}
          tone={itensEmAlerta > 0 ? 'warning' : 'success'}
          valueClassName={itensEmAlerta > 0 ? 'text-[var(--status-warning)]' : 'text-[var(--status-success)]'}
        />
      </div>

      {feedback && <AlertBanner type={feedback.tipo} message={feedback.texto} onClose={() => setFeedback(null)} />}

      {isCatFormOpen && (
        <CategoriaFormCard
          catFormData={catFormData}
          onChange={setCatFormData}
          onSubmit={handleCatSubmit}
          onCancel={() => setIsCatFormOpen(false)}
        />
      )}

      {isFormOpen ? (
        <ProdutoFormCard
          formData={formData}
          categorias={categorias}
          isCatFormOpen={isCatFormOpen}
          onOpenCatForm={() => setIsCatFormOpen(true)}
          onInputChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      ) : (
        <EstoqueTable
          produtos={produtosFiltrados}
          categorias={categorias}
          busca={busca}
          onChangeBusca={setBusca}
          carregando={carregando}
          estoqueMinimo={ESTOQUE_MINIMO}
          onAjustarEstoque={ajustarEstoque}
        />
      )}
    </div>
  )
}
