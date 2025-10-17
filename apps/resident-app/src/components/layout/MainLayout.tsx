import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, DollarSign, Bell, Calendar, User } from 'lucide-react'
import { useResidentProfile } from '@deptocorp/shared/hooks/useResidentProfile'
import { useResidentGastos } from '@deptocorp/shared/hooks/useResidentGastos'

interface MainLayoutProps {
  children: ReactNode
  userId: string | undefined
}

export function MainLayout({ children, userId }: MainLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: profile } = useResidentProfile(userId)
  const { data: gastos } = useResidentGastos(profile?.departamento.id)

  const gastosPendientes = gastos?.filter(g => g.estado !== 'pagado').length || 0

  const tabs = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/gastos', icon: DollarSign, label: 'Gastos', badge: gastosPendientes },
    { path: '/avisos', icon: Bell, label: 'Avisos' },
    { path: '/reservas', icon: Calendar, label: 'Reservas' },
    { path: '/mi-cuenta', icon: User, label: 'Cuenta' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {profile?.departamento.edificio.nombre || 'DeptoCorp'}
              </h1>
              <p className="text-sm text-gray-500">
                Depto {profile?.departamento.numero || '...'}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {profile?.nombre.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="px-4 py-6">
        {children}
      </main>

      {/* Tab Bar con 5 tabs */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = location.pathname === tab.path
            
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`relative flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive ? 'text-blue-500' : 'text-gray-400'
                }`}
              >
                <div className="relative">
                  <Icon size={22} className={isActive ? 'text-blue-500' : 'text-gray-400'} />
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${
                  isActive ? 'text-blue-500' : 'text-gray-500'
                }`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}