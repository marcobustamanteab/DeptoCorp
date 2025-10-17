import { useAuth } from '@deptocorp/shared/hooks/useAuth'
import { useResidentProfile } from '@deptocorp/shared/hooks/useResidentProfile'
import { User, Mail, Phone, LogOut, ChevronRight } from 'lucide-react'

interface MiCuentaPageProps {
  userId: string | undefined
}

export function MiCuentaPage({ userId }: MiCuentaPageProps) {
  const { signOut, user } = useAuth()
  const { data: profile, isLoading } = useResidentProfile(userId)

  const handleLogout = async () => {
    if (window.confirm('¿Seguro que deseas cerrar sesión?')) {
      await signOut()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Mi Cuenta</h2>

      {/* Perfil Card */}
      {profile && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-white font-bold text-2xl">
                {profile.nombre.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{profile.nombre}</h3>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            {profile.email && (
              <div className="flex items-center py-3 border-t border-gray-100">
                <Mail className="text-gray-400 mr-3" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-gray-800 text-sm font-medium">{profile.email}</p>
                </div>
              </div>
            )}

            {profile.telefono && (
              <div className="flex items-center py-3 border-t border-gray-100">
                <Phone className="text-gray-400 mr-3" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="text-gray-800 text-sm font-medium">{profile.telefono}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Opciones */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition border-b border-gray-100">
          <div className="flex items-center">
            <User className="text-gray-400 mr-3" size={20} />
            <span className="text-gray-800 font-medium text-sm">Editar Perfil</span>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 hover:bg-red-50 active:bg-red-100 transition"
        >
          <div className="flex items-center">
            <LogOut className="text-red-500 mr-3" size={20} />
            <span className="text-red-600 font-medium text-sm">Cerrar Sesión</span>
          </div>
          <ChevronRight className="text-red-400" size={20} />
        </button>
      </div>

      {/* Versión */}
      <div className="text-center py-4">
        <p className="text-gray-400 text-xs">Versión 1.0.0</p>
        <p className="text-gray-400 text-xs mt-1">DeptoCorp PWA © 2025</p>
      </div>
    </div>
  )
}