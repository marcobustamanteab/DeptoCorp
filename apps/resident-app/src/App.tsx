import { useAuth } from '@deptocorp/shared/hooks/useAuth'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { LoginScreen } from './pages/LoginScreen'
import { MainLayout } from './components/layout/MainLayout'
import { DashboardPage } from './pages/DashboardPage'
import { GastosPage } from './pages/GastosPage'
import { AvisosPage } from './pages/AvisosPage'
import { ReservasPage } from './pages/ReservasPage'
import { MiCuentaPage } from './pages/MiCuentaPage'

function App() {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" />
        <LoginScreen />
      </>
    )
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <MainLayout userId={user?.id}>
        <Routes>
          <Route path="/" element={<DashboardPage userId={user?.id} />} />
          <Route path="/gastos" element={<GastosPage userId={user?.id} />} />
          <Route path="/avisos" element={<AvisosPage userId={user?.id} />} />
          <Route path="/reservas" element={<ReservasPage userId={user?.id} />} />
          <Route path="/mi-cuenta" element={<MiCuentaPage userId={user?.id} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App