/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/admin-web/src/pages/Notificaciones.tsx
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react'
import { useNotificaciones } from '../../../../packages/shared/hooks/useNotificaciones'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Toaster } from 'react-hot-toast'

export function Notificaciones() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  
  const {
    notificaciones,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotificaciones()

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

  const handleNotificationClick = (notif: any) => {
    if (!notif.leida) {
      markAsRead(notif.id)
    }
    if (notif.url) {
      navigate(notif.url)
    }
  }

  const filteredNotifications = filter === 'unread' 
    ? notificaciones.filter((n: any) => !n.leida)
    : notificaciones

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando notificaciones...</div>
      </div>
    )
  }

  return (
    <div>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Bell size={32} />
          Notificaciones
        </h1>
        <p className="text-gray-600">
          {unreadCount > 0 
            ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
            : 'No tienes notificaciones sin leer'
          }
        </p>
      </div>

      {/* Filtros y acciones */}
      <Card className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Filtros */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({notificaciones.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'unread'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sin leer ({unreadCount})
            </button>
          </div>

          {/* Acciones masivas */}
          {notificaciones.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium flex items-center gap-2 transition"
                >
                  <CheckCheck size={18} />
                  Marcar todas como leídas
                </button>
              )}
              <button
                onClick={() => deleteAllRead()}
                className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium flex items-center gap-2 transition"
              >
                <Trash2 size={18} />
                Eliminar leídas
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Lista de notificaciones */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <Bell size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? '¡Estás al día! 🎉'
                : 'Te avisaremos cuando haya algo nuevo'
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif: any) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className="cursor-pointer"
            >
              <Card
                className={`hover:shadow-lg transition group ${
                  !notif.leida ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-4">
                  {/* Icono */}
                  <div className="flex-shrink-0 text-4xl">
                    {getIconForType(notif.tipo)}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className={`text-lg font-bold ${
                        !notif.leida ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notif.titulo}
                      </h3>
                      {!notif.leida && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                          NUEVA
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      {notif.mensaje}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(notif.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>

                      {/* Acciones */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        {!notif.leida && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notif.id)
                            }}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium flex items-center gap-1 text-sm"
                          >
                            <Check size={14} />
                            Marcar leída
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notif.id)
                          }}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium flex items-center gap-1 text-sm"
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}