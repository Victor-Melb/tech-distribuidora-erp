import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de Requisição: injeta automaticamente o Token JWT Bearer
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('techerp_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de Resposta: padroniza mensagens de erro vindas do backend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data
    let mensagemAmigavel = 'Erro de conexão com o servidor da API.'

    if (data) {
      if (Array.isArray(data.erros) && data.erros.length > 0) {
        mensagemAmigavel = data.erros.join(' • ')
      } else if (typeof data.detail === 'string') {
        mensagemAmigavel = data.detail
      }
    }

    error.mensagemAmigavel = mensagemAmigavel
    return Promise.reject(error)
  }
)

export default api
export { API_BASE_URL }
