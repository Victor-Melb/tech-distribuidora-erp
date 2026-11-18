import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const salvo = localStorage.getItem('techerp_user')
      return salvo ? JSON.parse(salvo) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('techerp_token') || null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const validarSessao = async () => {
      const tokenSalvo = localStorage.getItem('techerp_token')
      if (!tokenSalvo) {
        setCarregando(false)
        return
      }
      try {
        const res = await api.get('/auth/me')
        setUsuario(res.data)
        localStorage.setItem('techerp_user', JSON.stringify(res.data))
      } catch {
        localStorage.removeItem('techerp_token')
        localStorage.removeItem('techerp_user')
        setToken(null)
        setUsuario(null)
      } finally {
        setCarregando(false)
      }
    }
    validarSessao()
  }, [])

  const login = async (loginInput, senhaInput) => {
    const res = await api.post('/auth/login', {
      login: loginInput,
      senha: senhaInput,
    })
    const { access_token, usuario: userData } = res.data
    localStorage.setItem('techerp_token', access_token)
    localStorage.setItem('techerp_user', JSON.stringify(userData))
    setToken(access_token)
    setUsuario(userData)
    return userData
  }

  const registrar = async (nome, loginInput, senhaInput) => {
    const res = await api.post('/auth/register', {
      nome,
      login: loginInput,
      senha: senhaInput,
    })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('techerp_token')
    localStorage.removeItem('techerp_user')
    setToken(null)
    setUsuario(null)
  }

  const temPermissao = (perfisPermitidos = []) => {
    if (!usuario) return false
    if (perfisPermitidos.length === 0) return true
    return perfisPermitidos.includes(usuario.perfil)
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        autenticado: !!usuario && !!token,
        carregando,
        login,
        registrar,
        logout,
        temPermissao,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
