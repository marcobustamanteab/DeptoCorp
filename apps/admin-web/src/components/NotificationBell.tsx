/* eslint-disable @typescript-eslint/no-explicit-any */
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

  const getIconAndColor = (tipo: string) => {
    const config: Record<string, { icon: string; bg: string; color: string }> = {
      reserva_pendiente: { icon: '📋', bg: 'bg-yellow-50', color: 'text-yellow-700' },
      comprobante_pendiente: { icon: '💵', bg: 'bg-blue-50', color: 'text-blue-700' },
      reserva_aprobada: { icon: '✅', bg: 'bg-green-50', color: 'text-green-700' },
      reserva_rechazada: { icon: '❌', bg: 'bg-red-50', color: 'text-red-700' },
      pago_confirmado: { icon: '✅', bg: 'bg-green-50', color: 'text-green-700' },
      pago_rechazado: { icon: '❌', bg: 'bg-red-50', color: 'text-red-700' },
    }
    return config[tipo] || { icon: '🔔', bg: 'bg-gray-50', color: 'text-gray-700' }
  }

  const recientes = notificaciones.slice(0, 8)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-gray-700" />
                <h3 className="font-bold text-gray-800">Notificaciones</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            
            {/* Acciones rápidas */}
            {notificaciones.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition"
                  >
                    <CheckCheck size={14} />
                    Marcar todas
                  </button>
                )}
                <button
                  onClick={() => deleteAllRead()}
                  className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition"
                >
                  <Trash2 size={14} />
                  Limpiar leídas
                </button>
              </div>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="overflow-y-auto flex-1">
            {notificaciones.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell size={32} className="text-gray-400" />
                </div>
                <p className="font-medium text-gray-800 mb-1">No hay notificaciones</p>
                <p className="text-sm text-gray-500">Te avisaremos cuando haya algo nuevo</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recientes.map((notif: any) => {
                  const { icon, bg, color } = getIconAndColor(notif.tipo)
                  
                  return (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-gray-50 transition cursor-pointer group ${
                        !notif.leida ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="flex gap-3">
                        {/* Icono */}
                        <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <span className="text-xl">{icon}</span>
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`text-sm font-semibold ${color} ${
                              !notif.leida ? 'text-gray-900' : ''
                            }`}>
                              {notif.titulo}
                            </h4>
                            {!notif.leida && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notif.mensaje}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">
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
                                  className="p-1.5 hover:bg-green-100 rounded text-green-600"
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
                                className="p-1.5 hover:bg-red-100 rounded text-red-600"
                                title="Eliminar"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notificaciones.length > 8 && (
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