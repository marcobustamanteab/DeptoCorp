// apps/resident-app/src/components/NotificationBell.tsx
import { useState } from 'react'
import { Bell, X, Trash2 } from 'lucide-react'
import { useNotificaciones } from '../../../../packages/shared/hooks/useNotificaciones'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  
  const {
    notificaciones,
    unreadCount,
    markAsRead,
    deleteNotification,
  } = useNotificaciones()

  const handleNotificationClick = (notif: any) => {
    if (!notif.leida) {
      markAsRead(notif.id)
    }
    if (notif.url) {
      navigate(notif.url)
      setIsOpen(false)
    }
  }

  const getIconAndColor = (tipo: string) => {
    const config: Record<string, { icon: string; bg: string; color: string }> = {
      reserva_aprobada: { icon: '✅', bg: 'bg-green-50', color: 'text-green-700' },
      reserva_rechazada: { icon: '❌', bg: 'bg-red-50', color: 'text-red-700' },
      pago_confirmado: { icon: '✅', bg: 'bg-green-50', color: 'text-green-700' },
      pago_rechazado: { icon: '❌', bg: 'bg-red-50', color: 'text-red-700' },
      gasto_generado: { icon: '💰', bg: 'bg-blue-50', color: 'text-blue-700' },
      aviso_nuevo: { icon: '📢', bg: 'bg-purple-50', color: 'text-purple-700' },
    }
    return config[tipo] || { icon: '🔔', bg: 'bg-gray-50', color: 'text-gray-700' }
  }

  return (
    <>
      {/* Botón de campana */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-600 hover:text-gray-800 active:bg-gray-100 rounded-lg transition"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Modal Full Screen - Optimizado para móvil */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Header Sticky */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={22} className="text-gray-700" />
                <h2 className="text-lg font-bold text-gray-800">
                  Notificaciones
                </h2>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones con scroll */}
          <div className="flex-1 overflow-y-auto">
            {notificaciones.length === 0 ? (
              // Estado vacío
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                  <Bell size={40} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  No hay notificaciones
                </h3>
                <p className="text-sm text-gray-500">
                  Te avisaremos cuando haya algo nuevo
                </p>
              </div>
            ) : (
              // Lista de notificaciones
              <div className="divide-y divide-gray-100">
                {notificaciones.map((notif: any) => {
                  const { icon, bg, color } = getIconAndColor(notif.tipo)
                  
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 active:bg-gray-50 transition-colors ${
                        !notif.leida ? 'bg-blue-50' : 'bg-white'
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icono */}
                        <div className={`${bg} w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                          <span className="text-2xl">{icon}</span>
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className={`font-bold text-sm ${color} ${
                              !notif.leida ? 'text-gray-900' : ''
                            }`}>
                              {notif.titulo}
                            </h3>
                            {!notif.leida && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                            {notif.mensaje}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">
                              {formatDistanceToNow(new Date(notif.created_at), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notif.id)
                              }}
                              className="p-2 hover:bg-red-50 active:bg-red-100 rounded-lg text-red-500 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer con botón de cerrar (opcional) */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  )
}