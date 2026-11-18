import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Save, X } from 'lucide-react'
import { AlertBanner } from '../ui/AlertBanner'
import { Button } from '../ui/Button'

function formatarDocumentoInput(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 14)
  if (digitos.length <= 11) {
    return digitos
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2')
  }
  return digitos
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function formatarTelefoneInput(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  if (digitos.length <= 10) {
    return digitos
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return digitos
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export function ClienteFormCard({
  formData,
  formError,
  submitting = false,
  onChange,
  onSubmit,
  onCancel,
  onClearError,
}) {
  const [closing, setClosing] = useState(false)
  const nomeInputRef = useRef(null)
  const closeTimerRef = useRef(null)
  const closingRef = useRef(false)
  const submittingRef = useRef(submitting)
  const onCancelRef = useRef(onCancel)

  useEffect(() => {
    submittingRef.current = submitting
    onCancelRef.current = onCancel
  }, [submitting, onCancel])

  const iniciarFechamento = useCallback(() => {
    if (closingRef.current || submittingRef.current) return
    closingRef.current = true
    setClosing(true)
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 150
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      onCancelRef.current()
    }, delay)
  }, [])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = setTimeout(() => {
      nomeInputRef.current?.focus()
    }, 40)

    const onKeyDown = (event) => {
      if (event.key === 'Escape') iniciarFechamento()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      clearTimeout(focusTimer)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [iniciarFechamento])

  const handleMaskedChange = (event) => {
    const { name, value } = event.target
    let nextValue = value
    if (name === 'cpf_cnpj') nextValue = formatarDocumentoInput(value)
    if (name === 'telefone') nextValue = formatarTelefoneInput(value)

    onChange({
      target: { name, value: nextValue },
    })
  }

  return (
    <div
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) iniciarFechamento()
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md ${
        closing
          ? 'pointer-events-none animate-modal-backdrop-exit'
          : 'animate-modal-backdrop-enter'
      }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-cliente-titulo"
        aria-describedby="modal-cliente-desc"
        className={`w-full max-w-xl max-h-[calc(100vh-2rem)] flex flex-col rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-surface-elevated)] shadow-2xl overflow-hidden ${
          closing ? 'animate-modal-panel-exit' : 'animate-modal-panel-enter'
        }`}
      >
        <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-start justify-between gap-4 shrink-0">
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-text)]">
              Carteira B2B
            </span>
            <h2
              id="modal-cliente-titulo"
              className="text-lg font-semibold text-[var(--text-primary)] mt-1"
            >
              Cadastrar Novo Cliente
            </h2>
            <p id="modal-cliente-desc" className="text-xs text-[var(--text-muted)] mt-0.5">
              Informe razão social, CPF/CNPJ válido e dados de contato únicos.
            </p>
          </div>

          <button
            type="button"
            onClick={iniciarFechamento}
            disabled={submitting}
            aria-label="Fechar janela de cadastro"
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-5 overflow-y-auto space-y-5">
          {formError && (
            <AlertBanner
              type="erro"
              message={formError}
              onClose={onClearError}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="cli-nome" className="block text-xs font-medium text-[var(--text-secondary)]">
                Nome completo / Razão social
              </label>
              <input
                ref={nomeInputRef}
                id="cli-nome"
                type="text"
                name="nome"
                minLength={3}
                maxLength={100}
                value={formData.nome}
                onChange={handleMaskedChange}
                required
                className="w-full h-10 px-3 field-control text-sm"
                placeholder="Horizonte Tecnologia LTDA"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cli-doc" className="block text-xs font-medium text-[var(--text-secondary)]">
                CPF / CNPJ
              </label>
              <input
                id="cli-doc"
                type="text"
                name="cpf_cnpj"
                inputMode="numeric"
                minLength={11}
                maxLength={18}
                value={formData.cpf_cnpj}
                onChange={handleMaskedChange}
                required
                className="w-full h-10 px-3 field-control text-sm font-mono"
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cli-tel" className="block text-xs font-medium text-[var(--text-secondary)]">
                Telefone
              </label>
              <input
                id="cli-tel"
                type="text"
                name="telefone"
                inputMode="tel"
                maxLength={20}
                value={formData.telefone}
                onChange={handleMaskedChange}
                className="w-full h-10 px-3 field-control text-sm font-mono"
                placeholder="(11) 94002-8922"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cli-email" className="block text-xs font-medium text-[var(--text-secondary)]">
                E-mail
              </label>
              <input
                id="cli-email"
                type="email"
                name="email"
                maxLength={100}
                value={formData.email}
                onChange={handleMaskedChange}
                className="w-full h-10 px-3 field-control text-sm"
                placeholder="compras@empresa.com.br"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cli-end" className="block text-xs font-medium text-[var(--text-secondary)]">
                Endereço completo
              </label>
              <input
                id="cli-end"
                type="text"
                name="endereco"
                maxLength={150}
                value={formData.endereco}
                onChange={handleMaskedChange}
                className="w-full h-10 px-3 field-control text-sm"
                placeholder="Rua, Número, Bairro, Cidade - UF"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2.5">
            <Button variant="secondary" onClick={iniciarFechamento} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              <Save size={16} strokeWidth={1.75} aria-hidden="true" />
              <span>{submitting ? 'Salvando...' : 'Cadastrar cliente'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
