import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../ui/Card'
import { Button } from '../ui/Button'

export function UserCreateFormCard({ novoUsuario, onChange, onSubmit, onCancel }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Cadastrar Colaborador</CardTitle>
          <CardDescription>
            Validação de formato e complexidade aplicada no servidor (Pydantic)
          </CardDescription>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="novo-nome" className="block text-xs font-medium text-[var(--text-secondary)]">
                Nome completo
              </label>
              <input
                id="novo-nome"
                type="text"
                required
                minLength={3}
                maxLength={100}
                value={novoUsuario.nome}
                onChange={(e) => onChange({ ...novoUsuario, nome: e.target.value })}
                placeholder="Fernanda Lima"
                className="w-full h-10 px-3 field-control text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="novo-login" className="block text-xs font-medium text-[var(--text-secondary)]">
                Login único
              </label>
              <input
                id="novo-login"
                type="text"
                required
                minLength={3}
                maxLength={50}
                value={novoUsuario.login}
                onChange={(e) => onChange({ ...novoUsuario, login: e.target.value })}
                placeholder="fernanda.lima"
                className="w-full h-10 px-3 field-control text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="novo-senha" className="block text-xs font-medium text-[var(--text-secondary)]">
                Senha inicial (mín. 6, letras + núm)
              </label>
              <input
                id="novo-senha"
                type="password"
                required
                minLength={6}
                maxLength={72}
                value={novoUsuario.senha}
                onChange={(e) => onChange({ ...novoUsuario, senha: e.target.value })}
                placeholder="Senha123"
                className="w-full h-10 px-3 field-control text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="novo-perfil" className="block text-xs font-medium text-[var(--text-secondary)]">
                Perfil de acesso (RBAC)
              </label>
              <select
                id="novo-perfil"
                value={novoUsuario.perfil}
                onChange={(e) => onChange({ ...novoUsuario, perfil: e.target.value })}
                className="w-full h-10 px-3 field-control text-sm [&>option]:bg-[var(--bg-surface)]"
              >
                <option value="Vendedor">Vendedor (Operacional)</option>
                <option value="Gerente">Gerente (Supervisão)</option>
                <option value="Administrador">Administrador (Total)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Criar conta segura
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
