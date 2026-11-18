import React, { useState } from 'react'
import { Play, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react'
import { executarSuiteDast } from '../../services/dastRunner'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export function DastConsole({ onCompleted }) {
  const [resultados, setResultados] = useState([])
  const [executando, setExecutando] = useState(false)

  const aprovados = resultados.filter((r) => r.aprovado).length
  const total = resultados.length || 5
  const pct = resultados.length > 0 ? (aprovados / total) * 100 : 0
  const circumference = 2 * Math.PI * 26
  const strokeDashoffset = circumference - (pct / 100) * circumference

  const handleExecutar = async () => {
    setExecutando(true)
    const lista = await executarSuiteDast()
    setResultados(lista)
    setExecutando(false)
    onCompleted?.()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg width="56" height="56" viewBox="0 0 60 60" className="-rotate-90" aria-hidden="true">
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth="4.5"
              />
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke={resultados.length > 0 && aprovados === 5 ? 'var(--status-success)' : 'var(--accent)'}
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 450ms ease' }}
              />
            </svg>
            <span className="absolute font-mono text-xs font-semibold text-[var(--text-primary)] tabular-nums">
              {resultados.length > 0 ? `${aprovados}/5` : '0/5'}
            </span>
          </div>

          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck size={16} strokeWidth={1.75} className="text-[var(--accent-text)]" aria-hidden="true" />
              <span>Bateria de Testes de Segurança (DAST Ao Vivo)</span>
            </CardTitle>
            <CardDescription>
              Executa os 5 testes práticos contra o servidor FastAPI (uso normal, entrada inválida e uso indevido).
            </CardDescription>
          </div>
        </div>

        <Button variant="primary" onClick={handleExecutar} disabled={executando}>
          <Play size={15} strokeWidth={1.75} aria-hidden="true" />
          <span>{executando ? 'Executando bateria...' : 'Executar 5 testes agora'}</span>
        </Button>
      </CardHeader>

      <CardBody className="space-y-3">
        {resultados.length === 0 ? (
          <div className="p-8 text-center rounded-lg surface-inset text-xs sm:text-sm text-[var(--text-secondary)]">
            Clique em <strong className="text-[var(--text-primary)]">Executar 5 testes agora</strong> para validar em tempo real o comportamento da API e exibir os códigos HTTP retornados.
          </div>
        ) : (
          resultados.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-lg surface-inset border border-[var(--border-subtle)] space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="brand" mono>
                    {t.rota}
                  </Badge>
                  <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
                    {t.categoria} — {t.titulo}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="neutral" mono>
                    HTTP {t.statusHttp}
                  </Badge>
                  {t.aprovado ? (
                    <Badge tone="success" icon={<CheckCircle2 size={12} strokeWidth={2} aria-hidden="true" />}>
                      Aprovado
                    </Badge>
                  ) : (
                    <Badge tone="danger" icon={<XCircle size={12} strokeWidth={2} aria-hidden="true" />}>
                      Falhou
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[var(--border-subtle)] text-xs">
                <div>
                  <span className="text-[var(--text-muted)] block mb-0.5">Comportamento esperado</span>
                  <span className="text-[var(--text-secondary)]">{t.esperado}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block mb-0.5">Evidência recebida</span>
                  <code className="font-mono text-[var(--text-primary)] break-all">{t.obtido}</code>
                </div>
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  )
}
