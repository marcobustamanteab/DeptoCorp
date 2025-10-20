import { useAuth } from '../../../packages/shared/hooks/useAuth'
import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { Dashboard } from './pages/Dashboard'
import { Edificios } from './pages/Edificios'
import { Departamentos } from './pages/Departamentos'
import { Residentes } from './pages/Residentes'
import { Gastos } from './pages/Gastos'
import { Toaster } from 'react-hot-toast'
import { Avisos } from './pages/Avisos'
import { Pagos } from './pages/Pagos'
import { Reservas } from './pages/Reservas'
import { Reportes } from './pages/Reportes'
import { ValidarComprobantes } from './pages/ValidarComprobantes'
import { BuildingLoader } from './components/BuildingLoader'

function App() {
  const { user, loading, signIn, signOut, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    }
  }

  if (loading) {
    return <BuildingLoader />
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">DeptoCorp</h1>
            <p className="text-gray-600">Sistema de Gestión de Edificios</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition font-medium"
            >
              Iniciar Sesión
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Sistema de prueba - Fase MVP
          </p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <DashboardLayout user={user} onLogout={signOut}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/edificios" element={<Edificios />} />
          <Route path="/departamentos" element={<Departamentos />} />
          <Route path="/residentes" element={<Residentes />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/avisos" element={<Avisos />} />
          <Route path="/pagos" element={<Pagos />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/validar-comprobantes" element={<ValidarComprobantes />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  )
}

export default App