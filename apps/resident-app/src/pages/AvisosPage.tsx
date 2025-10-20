import { useResidentProfile } from '@deptocorp/shared/hooks/useResidentProfile'
import { useResidentAvisos } from '@deptocorp/shared/hooks/useResidentAvisos'
import { Bell, AlertCircle, Info, AlertTriangle, Megaphone } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'

interface AvisosPageProps {
  userId: string | undefined
}

// Definir el tipo de prioridad
type PrioridadType = 'urgente' | 'alta' | 'normal' | 'baja'

const PRIORIDADES = {
  urgente: { 
    icon: AlertCircle, 
    color: 'text-red-600', 
    bg: 'bg-red-100', 
    border: 'border-red-200',
    label: '🚨 Urgente' 
  },
  alta: { 
    icon: AlertTriangle, 
    color: 'text-orange-600', 
    bg: 'bg-orange-100', 
    border: 'border-orange-200',
    label: '⚠️ Alta' 
  },
  normal: { 
    icon: Megaphone, 
    color: 'text-blue-600', 
    bg: 'bg-blue-100', 
    border: 'border-blue-200',
    label: '📢 Normal' 
  },
  baja: { 
    icon: Info, 
    color: 'text-gray-600', 
    bg: 'bg-gray-100', 
    border: 'border-gray-200',
    label: '📋 Baja' 
  }
} as const

export function AvisosPage({ userId }: AvisosPageProps) {
  const { data: profile } = useResidentProfile(userId)
  const { data: avisos, isLoading } = useResidentAvisos(profile?.departamento.edificio.id)
  const [selectedAviso, setSelectedAviso] = useState<any>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando avisos...</div>
      </div>
    )
  }

  if (!avisos || avisos.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Avisos</h2>
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-600 font-medium mb-2">Sin avisos</p>
          <p className="text-gray-400 text-sm">
            No hay avisos activos en este momento
          </p>
        </div>
      </div>
    )
  }

  const avisosUrgentes = avisos.filter(a => a.prioridad === 'urgente')
  const avisosAlta = avisos.filter(a => a.prioridad === 'alta')
  const avisosNormales = avisos.filter(a => a.prioridad === 'normal' || a.prioridad === 'baja')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Avisos</h2>
        <div className="bg-blue-100 px-3 py-1 rounded-full">
          <span className="text-blue-600 font-bold text-sm">{avisos.length}</span>
        </div>
      </div>

      {/* Avisos Urgentes */}
      {avisosUrgentes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-red-600 uppercase flex items-center">
            <AlertCircle size={16} className="mr-1" />
            Urgentes
          </h3>
          {avisosUrgentes.map((aviso) => (
            <AvisoCard 
              key={aviso.id} 
              aviso={aviso} 
              onClick={() => setSelectedAviso(aviso)} 
            />
          ))}
        </div>
      )}

      {/* Avisos Alta Prioridad */}
      {avisosAlta.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-orange-600 uppercase flex items-center">
            <AlertTriangle size={16} className="mr-1" />
            Importante
          </h3>
          {avisosAlta.map((aviso) => (
            <AvisoCard 
              key={aviso.id} 
              aviso={aviso} 
              onClick={() => setSelectedAviso(aviso)} 
            />
          ))}
        </div>
      )}

      {/* Avisos Normales */}
      {avisosNormales.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-600 uppercase">Generales</h3>
          {avisosNormales.map((aviso) => (
            <AvisoCard 
              key={aviso.id} 
              aviso={aviso} 
              onClick={() => setSelectedAviso(aviso)} 
            />
          ))}
        </div>
      )}

      {/* Modal Detalle */}
      {selectedAviso && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50"
          onClick={() => setSelectedAviso(null)}
        >
          <div 
            className="bg-white rounded-t-3xl p-6 w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
            
            {/* Prioridad Badge - FIX AQUÍ */}
            {(() => {
              const prioridad = (selectedAviso.prioridad || 'normal') as PrioridadType
              const config = PRIORIDADES[prioridad]
              
              return (
                <div className={`inline-flex items-center ${config.bg} ${config.border} border px-3 py-1 rounded-full mb-4`}>
                  <span className={`text-xs font-semibold ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              )
            })()}

            {/* Título */}
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {selectedAviso.titulo}
            </h3>

            {/* Fecha */}
            <p className="text-sm text-gray-500 mb-6">
              Publicado {formatDistanceToNow(new Date(selectedAviso.fecha_publicacion), { 
                addSuffix: true, 
                locale: es 
              })}
            </p>

            {/* Contenido */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedAviso.contenido}
              </p>
            </div>

            {/* Expiración */}
            {selectedAviso.fecha_expiracion && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-yellow-800">
                  ⏰ Válido hasta: {new Date(selectedAviso.fecha_expiracion).toLocaleDateString('es-CL')}
                </p>
              </div>
            )}

            {/* Botón Cerrar */}
            <button 
              onClick={() => setSelectedAviso(null)}
              className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente Card de Aviso - FIX AQUÍ
function AvisoCard({ aviso, onClick }: { aviso: any, onClick: () => void }) {
  const prioridad = (aviso.prioridad || 'normal') as PrioridadType
  const config = PRIORIDADES[prioridad]
  const Icon = config.icon

  return (
    <button
      onClick={onClick}
      className={`w-full bg-white rounded-2xl shadow-sm p-4 border ${config.border} active:scale-95 transition text-left`}
    >
      <div className="flex items-start">
        <div className={`${config.bg} p-2 rounded-xl mr-3 flex-shrink-0`}>
          <Icon className={config.color} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">
            {aviso.titulo}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {aviso.contenido}
          </p>
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(aviso.fecha_publicacion), { 
              addSuffix: true, 
              locale: es 
            })}
          </p>
        </div>
      </div>
    </button>
  )
}