import { useResidentProfile } from '@deptocorp/shared/hooks/useResidentProfile'
import { Home, MapPin, Crown, User, Bell, CreditCard, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface DashboardPageProps {
  userId: string | undefined
}

export function DashboardPage({ userId }: DashboardPageProps) {
  const { data: profile, isLoading, error } = useResidentProfile(userId)
  const navigate = useNavigate()


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
        <p className="text-red-600 text-sm font-medium">
          Error: Usuario no vinculado a departamento
        </p>
        <p className="text-red-500 text-xs mt-2">
          Contacta a tu administración
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">
          ¡Hola, {profile.nombre.split(' ')[0]}! 👋
        </h2>
        <p className="text-blue-100 text-sm">
          Bienvenido a tu portal
        </p>
      </div>

      {/* Card Info Departamento */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-3 rounded-xl mr-3">
            <Home className="text-blue-600" size={22} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-lg">Mi Departamento</h3>
            <p className="text-gray-500 text-sm">Información básica</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 text-sm">Número</span>
            <span className="font-bold text-gray-800 text-lg">{profile.departamento.numero}</span>
          </div>

          {profile.departamento.piso !== null && (
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-gray-600 text-sm">Piso</span>
              <span className="font-semibold text-gray-800">{profile.departamento.piso}</span>
            </div>
          )}

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <span className="text-gray-600 text-sm">Tipo</span>
            <div className="flex items-center">
              {profile.es_propietario ? (
                <>
                  <Crown className="text-purple-600 mr-1" size={16} />
                  <span className="font-semibold text-purple-600 text-sm">Propietario</span>
                </>
              ) : (
                <>
                  <User className="text-blue-600 mr-1" size={16} />
                  <span className="font-semibold text-blue-600 text-sm">Arrendatario</span>
                </>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-start">
              <MapPin className="text-gray-400 mr-2 mt-1 flex-shrink-0" size={16} />
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  {profile.departamento.edificio.nombre}
                </p>
                {profile.departamento.edificio.direccion && (
                  <p className="text-gray-500 text-xs mt-1">
                    {profile.departamento.edificio.direccion}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
     <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => navigate('/gastos')}
          className="bg-white rounded-2xl shadow-sm p-4 active:scale-95 transition"
        >
          <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CreditCard className="text-green-600" size={24} />
          </div>
          <p className="text-gray-800 font-semibold text-sm">Mis Gastos</p>
          <p className="text-gray-400 text-xs mt-1">Ver pagos</p>
        </button>

        <button 
          onClick={() => navigate('/reservas')}
          className="bg-white rounded-2xl shadow-sm p-4 active:scale-95 transition"
        >
          <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Calendar className="text-orange-600" size={24} />
          </div>
          <p className="text-gray-800 font-semibold text-sm">Reservas</p>
          <p className="text-gray-400 text-xs mt-1">Espacios comunes</p>
        </button>
      </div>

      {/* Estado del Proyecto */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-center mb-3">
          <Bell className="text-blue-600 mr-2" size={18} />
          <h3 className="text-blue-800 font-bold text-sm">Estado del Proyecto</h3>
        </div>
        <ul className="space-y-2 text-xs text-blue-700">
          <li>✅ Dashboard funcional</li>
          <li>⏳ Gastos comunes (próximamente)</li>
          <li>⏳ Sistema de pagos</li>
          <li>⏳ Avisos en tiempo real</li>
        </ul>
      </div>
    </div>
  )
}