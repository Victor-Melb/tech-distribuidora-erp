import React from 'react'
import { Save } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../ui/Card'
import { Button } from '../ui/Button'

export function CategoriaFormCard({ catFormData, onChange, onSubmit, onCancel }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Nova Categoria de Produto</CardTitle>
          <CardDescription>Agrupe hardware, periféricos ou equipamentos de rede</CardDescription>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="cat-nome" className="block text-xs font-medium text-[var(--text-secondary)]">
                Nome da categoria
              </label>
              <input
                id="cat-nome"
                type="text"
                value={catFormData.nome}
                onChange={(e) => onChange({ ...catFormData, nome: e.target.value })}
                required
                className="w-full h-10 px-3 field-control text-sm"
                placeholder="Periféricos Corporativos"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cat-desc" className="block text-xs font-medium text-[var(--text-secondary)]">
                Descrição
              </label>
              <input
                id="cat-desc"
                type="text"
                value={catFormData.descricao}
                onChange={(e) => onChange({ ...catFormData, descricao: e.target.value })}
                className="w-full h-10 px-3 field-control text-sm"
                placeholder="Opcional"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar categoria
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}

export function ProdutoFormCard({
  formData,
  categorias,
  isCatFormOpen,
  onOpenCatForm,
  onInputChange,
  onSubmit,
  onCancel,
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Adicionar Produto ao Estoque</CardTitle>
          <CardDescription>Preencha preço de venda, custo unitário e saldo inicial</CardDescription>
        </div>
        {!isCatFormOpen && (
          <Button variant="ghost" size="sm" onClick={onOpenCatForm}>
            + Nova categoria
          </Button>
        )}
      </CardHeader>
      <CardBody>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 space-y-1.5">
              <label htmlFor="prod-nome" className="block text-xs font-medium text-[var(--text-secondary)]">
                Nome do produto
              </label>
              <input
                id="prod-nome"
                type="text"
                name="nome"
                value={formData.nome}
                onChange={onInputChange}
                required
                className="w-full h-10 px-3 field-control text-sm"
                placeholder="Mouse Óptico Wireless 16000 DPI"
              />
            </div>

            <div className="lg:col-span-2 space-y-1.5">
              <label htmlFor="prod-cat" className="block text-xs font-medium text-[var(--text-secondary)]">
                Categoria
              </label>
              <select
                id="prod-cat"
                name="idCategoria"
                value={formData.idCategoria}
                onChange={onInputChange}
                required
                className="w-full h-10 px-3 field-control text-sm [&>option]:bg-[var(--bg-surface)]"
              >
                <option value="" disabled>
                  Selecione a categoria
                </option>
                {categorias.map((c) => (
                  <option key={c.idCategoria} value={c.idCategoria}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prod-preco" className="block text-xs font-medium text-[var(--text-secondary)]">
                Preço de venda (R$)
              </label>
              <input
                id="prod-preco"
                type="number"
                step="0.01"
                min="0.01"
                name="preco"
                value={formData.preco}
                onChange={onInputChange}
                required
                className="w-full h-10 px-3 field-control text-sm font-mono"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prod-custo" className="block text-xs font-medium text-[var(--text-secondary)]">
                Custo unitário (R$)
              </label>
              <input
                id="prod-custo"
                type="number"
                step="0.01"
                min="0"
                name="custo"
                value={formData.custo}
                onChange={onInputChange}
                className="w-full h-10 px-3 field-control text-sm font-mono"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prod-estoque" className="block text-xs font-medium text-[var(--text-secondary)]">
                Quantidade inicial
              </label>
              <input
                id="prod-estoque"
                type="number"
                min="0"
                name="estoque"
                value={formData.estoque}
                onChange={onInputChange}
                required
                className="w-full h-10 px-3 field-control text-sm font-mono"
                placeholder="0"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prod-desc" className="block text-xs font-medium text-[var(--text-secondary)]">
                Descrição técnica
              </label>
              <input
                id="prod-desc"
                type="text"
                name="descricao"
                value={formData.descricao}
                onChange={onInputChange}
                className="w-full h-10 px-3 field-control text-sm"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              <Save size={16} strokeWidth={1.75} aria-hidden="true" />
              <span>Salvar produto</span>
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
