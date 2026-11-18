import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Trash2, Users } from 'lucide-react'
import api from '../services/api'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { AlertBanner } from '../components/ui/AlertBanner'
import { EmptyState, ListSkeleton } from '../components/ui/EmptyState'
import { ClienteFormCard } from '../components/clientes/ClienteFormCard'

const INITIAL_FORM = {
  nome: '',
  cpf_cnpj: '',
  telefone: '',
  email: '',
  endereco: '',
}

export default function CadastroClientes() {
  const [carregando, setCarregando] = useState(true)
  const [clientes, setClientes] = useState([])
  const [busca, setBusca] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [formError, setFormError] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM)

  const carregarClientes = useCallback(async () => {
    setCarregando(true)
    try {
      const response = await api.get('/clientes/')
      setClientes(response.data)
    } catch (error) {
      setFeedback({
        tipo: 'erro',
        texto: error.mensagemAmigavel || 'Erro ao carregar a lista de clientes.',
      })
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    let ativo = true
    async function init() {
      try {
        const response = await api.get('/clientes/')
        if (ativo) setClientes(response.data)
      } catch (error) {
        if (ativo) {
          setFeedback({
            tipo: 'erro',
            texto: error.mensagemAmigavel || 'Erro ao carregar a lista de clientes.',
          })
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

  const abrirModalCadastro = () => {
    setFormError(null)
    setFeedback(null)
    setIsFormOpen(true)
  }

  const fecharModalCadastro = () => {
    setIsFormOpen(false)
    setFormError(null)
  }

  const handleFieldChange = (e) => {
    if (formError) setFormError(null)
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setFormError(null)
    setSubmitting(true)
    try {
      await api.post('/clientes/', formData)
      await carregarClientes()
      setIsFormOpen(false)
      setFormData(INITIAL_FORM)
      setFeedback({ tipo: 'sucesso', texto: 'Cliente cadastrado com sucesso.' })
    } catch (error) {
      setFormError(error.mensagemAmigavel || 'Erro ao salvar cliente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (idCliente) => {
    setFeedback(null)
    try {
      await api.delete(`/clientes/${idCliente}`)
      await carregarClientes()
      setFeedback({ tipo: 'sucesso', texto: 'Cliente removido com sucesso.' })
    } catch (error) {
      setFeedback({ tipo: 'erro', texto: error.mensagemAmigavel })
    }
  }

  const clientesFiltrados = clientes.filter(
    (c) =>
      (c.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
      (c.cpf_cnpj || '').toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        eyebrow="Carteira Corporativa"
        title="Clientes B2B"
        description="Empresas compradoras, documentos fiscais e endereços de entrega."
        actions={
          <Button variant="primary" onClick={abrirModalCadastro}>
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            <span>Novo Cliente</span>
          </Button>
        }
      />

      {feedback && (
        <AlertBanner
          type={feedback.tipo}
          message={feedback.texto}
          onClose={() => setFeedback(null)}
        />
      )}

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
              aria-label="Buscar clientes por nome ou documento"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar clientes ou CNPJ"
              className="pl-10 pr-3 h-9 field-control w-full text-xs sm:text-sm"
            />
          </div>
          <Badge tone="neutral" mono>
            {clientesFiltrados.length} clientes
          </Badge>
        </CardHeader>

        {carregando ? (
          <ListSkeleton rows={3} />
        ) : clientesFiltrados.length === 0 ? (
          <EmptyState
            icon={<Users size={20} strokeWidth={1.75} />}
            title="Nenhum cliente encontrado"
            description="Cadastre sua primeira empresa cliente para iniciar o faturamento."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[var(--bg-inset)] text-[var(--text-muted)] text-xs border-b border-[var(--border-subtle)]">
                  <th className="py-3 px-4 font-medium">ID</th>
                  <th className="py-3 px-4 font-medium">Cliente</th>
                  <th className="py-3 px-4 font-medium">Documento</th>
                  <th className="py-3 px-4 font-medium">Contato</th>
                  <th className="py-3 px-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-xs sm:text-sm">
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.idCliente} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-muted)]">
                      #{cliente.idCliente}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">{cliente.nome}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-secondary)] tabular-nums">
                      {cliente.cpf_cnpj}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs sm:text-sm text-[var(--text-primary)] font-mono">
                        {cliente.telefone || '—'}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">{cliente.email || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="danger"
                        size="icon"
                        onClick={() => handleDelete(cliente.idCliente)}
                        aria-label={`Excluir cliente ${cliente.nome}`}
                        title="Excluir cliente"
                      >
                        <Trash2 size={15} strokeWidth={1.75} aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {isFormOpen && (
        <ClienteFormCard
          formData={formData}
          formError={formError}
          submitting={submitting}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={fecharModalCadastro}
          onClearError={() => setFormError(null)}
        />
      )}
    </div>
  )
}
