import axios from 'axios'
import api, { API_BASE_URL } from './api'

export async function executarSuiteDast() {
  const lista = []

  // 1. Uso Normal
  try {
    const res1 = await api.get('/auth/me')
    const semSenha = !('senha' in res1.data)
    lista.push({
      id: 1,
      categoria: '1. Uso Normal',
      rota: 'GET /auth/me',
      statusHttp: res1.status,
      titulo: 'Autenticação JWT e omissão de hash de senha',
      esperado: 'HTTP 200 OK sem retornar o campo senha no JSON',
      obtido: `Login: ${res1.data.login} (${res1.data.perfil}) · Senha oculta: ${semSenha ? 'Sim' : 'Não'}`,
      aprovado: res1.status === 200 && semSenha,
    })
  } catch (err) {
    lista.push({
      id: 1,
      categoria: '1. Uso Normal',
      rota: 'GET /auth/me',
      statusHttp: err.response?.status || 500,
      titulo: 'Autenticação JWT e omissão de hash de senha',
      esperado: 'HTTP 200 OK',
      obtido: err.mensagemAmigavel || 'Erro ao consultar sessão',
      aprovado: false,
    })
  }

  // 2. Entrada Inválida
  try {
    await api.post('/auth/register', {
      nome: 'Ab',
      login: "admin' OR '1'='1",
      senha: '123',
    })
    lista.push({
      id: 2,
      categoria: '2. Entrada Inválida',
      rota: 'POST /auth/register',
      statusHttp: 200,
      titulo: 'Rejeição de formato inválido e senha curta no servidor',
      esperado: 'HTTP 422 Unprocessable Content',
      obtido: 'Falha: o servidor aceitou dados inválidos',
      aprovado: false,
    })
  } catch (err) {
    const status = err.response?.status
    lista.push({
      id: 2,
      categoria: '2. Entrada Inválida',
      rota: 'POST /auth/register',
      statusHttp: status,
      titulo: 'Rejeição de formato inválido e senha curta no servidor',
      esperado: 'HTTP 422 rejeitando caracteres especiais e senha < 6 caracteres',
      obtido: err.mensagemAmigavel,
      aprovado: status === 422,
    })
  }

  // 3. Uso Indevido — Escalação de Privilégio
  try {
    const sufixo = Math.floor(1000 + (Date.now() % 9000))
    const res3 = await api.post('/auth/register', {
      nome: `Teste Auditoria ${sufixo}`,
      login: `auditoria.${sufixo}`,
      senha: 'TesteSeguro123',
      perfil: 'Administrador',
    })
    lista.push({
      id: 3,
      categoria: '3. Uso Indevido (Privilégio)',
      rota: 'POST /auth/register',
      statusHttp: res3.status,
      titulo: 'Bloqueio de auto-promoção para Administrador no cadastro público',
      esperado: 'HTTP 201 forçando perfil restrito "Vendedor"',
      obtido: `Enviado "Administrador" → Servidor gravou "${res3.data.perfil}"`,
      aprovado: res3.status === 201 && res3.data.perfil === 'Vendedor',
    })
  } catch (err) {
    lista.push({
      id: 3,
      categoria: '3. Uso Indevido (Privilégio)',
      rota: 'POST /auth/register',
      statusHttp: err.response?.status || 500,
      titulo: 'Bloqueio de auto-promoção para Administrador no cadastro público',
      esperado: 'HTTP 201 com perfil Vendedor',
      obtido: err.mensagemAmigavel,
      aprovado: false,
    })
  }

  // 4. Uso Indevido — Quebra de RBAC
  try {
    const loginVend = await axios.post(`${API_BASE_URL}/auth/login`, {
      login: 'vendedor',
      senha: 'Vendedor123',
    })
    await axios.get(`${API_BASE_URL}/usuarios/`, {
      headers: { Authorization: `Bearer ${loginVend.data.access_token}` },
    })
    lista.push({
      id: 4,
      categoria: '4. Uso Indevido (RBAC)',
      rota: 'GET /usuarios/',
      statusHttp: 200,
      titulo: 'Bloqueio de Vendedor à gestão de usuários',
      esperado: 'HTTP 403 Forbidden',
      obtido: 'Falha: Vendedor acessou rota administrativa',
      aprovado: false,
    })
  } catch (err) {
    const status = err.response?.status
    lista.push({
      id: 4,
      categoria: '4. Uso Indevido (RBAC)',
      rota: 'GET /usuarios/',
      statusHttp: status,
      titulo: 'Bloqueio de Vendedor à gestão de usuários',
      esperado: 'HTTP 403 Forbidden',
      obtido: err.response?.data?.detail || 'Bloqueado pelo controle RBAC',
      aprovado: status === 403,
    })
  }

  // 5. Uso Indevido — Sem Token
  try {
    await axios.get(`${API_BASE_URL}/usuarios/`)
    lista.push({
      id: 5,
      categoria: '5. Uso Indevido (Sem Token)',
      rota: 'GET /usuarios/',
      statusHttp: 200,
      titulo: 'Rejeição de chamada sem cabeçalho Authorization Bearer',
      esperado: 'HTTP 401 Unauthorized',
      obtido: 'Falha: rota respondeu sem autenticação',
      aprovado: false,
    })
  } catch (err) {
    const status = err.response?.status
    lista.push({
      id: 5,
      categoria: '5. Uso Indevido (Sem Token)',
      rota: 'GET /usuarios/',
      statusHttp: status,
      titulo: 'Rejeição de chamada sem cabeçalho Authorization Bearer',
      esperado: 'HTTP 401 Unauthorized',
      obtido: err.response?.data?.detail || 'Autenticação necessária',
      aprovado: status === 401,
    })
  }

  return lista
}
