/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/admin-web/src/components/NotificationBell.tsx
import { useState, useRef, useEffect } from 'react'
import { Bell, Check, Trash2, CheckCheck, X } from 'lucide-react'
import { useNotificaciones } from '../../../../packages/shared/hooks/useNotificaciones'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  
  const {
    notificaciones,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotificaciones()

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (notif: any) => {
    if (!notif.leida) {
      markAsRead(notif.id)
    }
    if (notif.url) {
      navigate(notif.url)
      setIsOpen(false)
    }
  }

  const getIconForType = (tipo: string) => {
    const iconMap: Record<string, string> = {
      reserva_aprobada: '✅',
      reserva_rechazada: '❌',
      reserva_pendiente: '📋',
      pago_confirmado: '✅',
      pago_rechazado: '❌',
      comprobante_pendiente: '💵',
      gasto_generado: '💰',
      aviso_nuevo: '📢',
    }
    return iconMap[tipo] || '🔔'
  }

  const recientes = notificaciones.slice(0, 5)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Bell size={20} />
              Notificaciones
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            {notificaciones.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    title="Marcar todas como leídas"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
                <button
                  onClick={() => deleteAllRead()}
                  className="text-xs text-gray-500 hover:text-red-600 font-medium"
                  title="Eliminar leídas"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="overflow-y-auto flex-1">
            {notificaciones.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="font-medium">No tienes notificaciones</p>
                <p className="text-sm">Te avisaremos cuando haya algo nuevo</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recientes.map((notif: any) => (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-gray-50 transition cursor-pointer group ${
                      !notif.leida ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-2xl">
                        {getIconForType(notif.tipo)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-semibold ${
                            !notif.leida ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notif.titulo}
                          </h4>
                          {!notif.leida && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notif.mensaje}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notif.created_at), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            {!notif.leida && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notif.id)
                                }}
                                className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                title="Marcar como leída"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notif.id)
                              }}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              title="Eliminar"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notificaciones.length > 5 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  navigate('/notificaciones')
                  setIsOpen(false)
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todas ({notificaciones.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}