import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login from './pages/Login'
import MenuPrincipal from './pages/MenuPrincipal'
import Usuarios from './pages/Usuarios'
import CadastroClientes from './pages/CadastroClientes'
import Estoque from './pages/Estoque'
import Vendas from './pages/Vendas'
import Financeiro from './pages/Financeiro'
import Logistica from './pages/Logistica'
import Relatorios from './pages/Relatorios'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/menu" replace />} />
              <Route path="menu" element={<MenuPrincipal />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="clientes" element={<CadastroClientes />} />
              <Route path="estoque" element={<Estoque />} />
              <Route path="vendas" element={<Vendas />} />
              <Route path="financeiro" element={<Financeiro />} />
              <Route path="logistica" element={<Logistica />} />
              <Route path="relatorios" element={<Relatorios />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
