import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, ArrowRight, UserPlus, ShieldCheck, Eye, EyeOff, KeyRound } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { BrandLogo } from '../components/ui/BrandLogo'
import { Button } from '../components/ui/Button'
import { AlertBanner } from '../components/ui/AlertBanner'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { LoginShowcase } from '../components/auth/LoginShowcase'

const DEMO_ACCOUNTS = [
  { role: 'Administrador', login: 'admin', pass: 'Admin123', desc: 'Acesso total', dot: 'bg-[#2563EB]' },
  { role: 'Gerente', login: 'gerente', pass: 'Gerente123', desc: 'Gestão e leitura', dot: 'bg-[#0EA5E9]' },
  { role: 'Vendedor', login: 'vendedor', pass: 'Vendedor123', desc: 'Operação restrita', dot: 'bg-[#10B981]' },
]

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erroMsg, setErroMsg] = useState('')
  const [sucessoMsg, setSucessoMsg] = useState('')
  const [formData, setFormData] = useState({ nome: '', login: '', senha: '' })

  const navigate = useNavigate()
  const { login, registrar } = useAuth()

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (erroMsg) setErroMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErroMsg('')
    setSucessoMsg('')
    setEnviando(true)
    try {
      if (isRegistering) {
        const novo = await registrar(formData.nome, formData.login, formData.senha)
        setSucessoMsg(`Conta "${novo.login}" criada com perfil ${novo.perfil}. Faça login abaixo.`)
        setIsRegistering(false)
        setFormData((prev) => ({ ...prev, senha: '' }))
      } else {
        await login(formData.login, formData.senha)
        navigate('/menu')
      }
    } catch (error) {
      setErroMsg(error.mensagemAmigavel || 'Não foi possível autenticar. Confira usuário e senha.')
    } finally {
      setEnviando(false)
    }
  }

  const acessoRapidoDemo = async (loginDemo, senhaDemo) => {
    setErroMsg('')
    setSucessoMsg('')
    setIsRegistering(false)
    setEnviando(true)
    try {
      await login(loginDemo, senhaDemo)
      navigate('/menu')
    } catch (error) {
      setErroMsg(error.mensagemAmigavel || 'Falha ao conectar com o servidor da API.')
    } finally {
      setEnviando(false)
    }
  }

  const alternarModo = (modoCadastro) => {
    setIsRegistering(modoCadastro)
    setErroMsg('')
    setSucessoMsg('')
    setFormData({ nome: '', login: '', senha: '' })
  }

  const loginValido = /^[a-zA-Z0-9._-]{3,50}$/.test(formData.login.trim())
  const senhaTemTamanho = formData.senha.length >= 6
  const senhaComplexa = /[a-zA-Z]/.test(formData.senha) && /\d/.test(formData.senha)

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 surface-panel rounded-2xl overflow-hidden">
        <LoginShowcase />

        <main className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="lg:hidden">
              <BrandLogo size="md" showTagline />
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>

          <div role="tablist" aria-label="Modo de acesso" className="grid grid-cols-2 p-1 rounded-lg surface-inset mb-6">
            {[{ label: 'Entrar no sistema', reg: false }, { label: 'Criar conta', reg: true }].map((tab) => (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={isRegistering === tab.reg}
                onClick={() => alternarModo(tab.reg)}
                className={`h-9 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${isRegistering === tab.reg
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              {isRegistering ? 'Solicitar acesso inicial' : 'Autenticação de operador'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              {isRegistering ? 'Novos cadastros recebem o perfil padrão de Vendedor.' : 'Informe suas credenciais corporativas.'}
            </p>
          </div>

          <div className="space-y-3 mb-5">
            <AlertBanner type="erro" message={erroMsg} onClose={() => setErroMsg('')} />
            <AlertBanner type="sucesso" message={sucessoMsg} onClose={() => setSucessoMsg('')} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-1.5">
                <label htmlFor="auth-nome" className="block text-xs font-medium text-[var(--text-secondary)]">Nome completo</label>
                <div className="relative">
                  <User size={16} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" aria-hidden="true" />
                  <input id="auth-nome" type="text" name="nome" minLength={3} maxLength={100} className="pl-10 pr-3.5 h-10 w-full field-control text-sm" placeholder="Ana Beatriz Souza" value={formData.nome} onChange={handleInputChange} required />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="auth-login" className="block text-xs font-medium text-[var(--text-secondary)]">Login do operador</label>
              <div className="relative">
                <KeyRound size={16} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" aria-hidden="true" />
                <input id="auth-login" type="text" name="login" minLength={3} maxLength={50} autoComplete="username" className="pl-10 pr-3.5 h-10 w-full field-control text-sm font-mono" placeholder="admin, gerente ou vendedor" value={formData.login} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="auth-senha" className="block text-xs font-medium text-[var(--text-secondary)]">Senha de acesso</label>
              <div className="relative">
                <Lock size={16} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" aria-hidden="true" />
                <input id="auth-senha" type={mostrarSenha ? 'text' : 'password'} name="senha" minLength={isRegistering ? 6 : 1} maxLength={72} autoComplete={isRegistering ? 'new-password' : 'current-password'} className="pl-10 pr-10 h-10 w-full field-control text-sm" placeholder="Digite sua senha" value={formData.senha} onChange={handleInputChange} required />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                  {mostrarSenha ? <EyeOff size={16} strokeWidth={1.75} aria-hidden="true" /> : <Eye size={16} strokeWidth={1.75} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {isRegistering && (
              <div className="p-3.5 rounded-lg surface-inset space-y-2 text-xs">
                <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                  <ShieldCheck size={15} strokeWidth={1.75} className="text-[var(--accent-text)]" aria-hidden="true" />
                  <span>Validação no servidor</span>
                </div>
                <ul className="space-y-1 text-[var(--text-secondary)]">
                  <li className={loginValido ? 'text-[var(--status-success)] font-medium' : ''}>{loginValido ? '✓' : '•'} Login entre 3 e 50 caracteres (letras, números, . _ -)</li>
                  <li className={senhaTemTamanho ? 'text-[var(--status-success)] font-medium' : ''}>{senhaTemTamanho ? '✓' : '•'} Senha com mínimo de 6 caracteres</li>
                  <li className={senhaComplexa ? 'text-[var(--status-success)] font-medium' : ''}>{senhaComplexa ? '✓' : '•'} Combinação de letras e números</li>
                </ul>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" disabled={enviando} className="w-full mt-2">
              {enviando ? 'Validando credenciais...' : isRegistering ? <><UserPlus size={17} strokeWidth={1.75} aria-hidden="true" /><span>Concluir cadastro</span></> : <><span>Acessar plataforma</span><ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" /></>}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Contas de demonstração (RBAC)</span>
              <span className="font-mono text-[11px] text-[var(--text-muted)]">1 clique</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button key={acc.login} type="button" onClick={() => acessoRapidoDemo(acc.login, acc.pass)} className="p-2.5 rounded-lg surface-card surface-card-interactive text-left cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">{acc.role}</span>
                    <span className={`w-2 h-2 rounded-full ${acc.dot}`} aria-hidden="true" />
                  </div>
                  <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">{acc.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
