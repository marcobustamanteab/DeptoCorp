import { useResidentProfile } from '@deptocorp/shared/hooks/useResidentProfile'
import { useResidentGastos } from '@deptocorp/shared/hooks/useResidentGastos'
import { DollarSign, Calendar, CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface GastosPageProps {
  userId: string | undefined
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function GastosPage({ userId }: GastosPageProps) {
  const { data: profile } = useResidentProfile(userId)
  const { data: gastos, isLoading } = useResidentGastos(profile?.departamento.id)
  const [selectedGasto, setSelectedGasto] = useState<any>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando gastos...</div>
      </div>
    )
  }

  const gastosPendientes = gastos?.filter(g => g.estado !== 'pagado') || []
  const gastosPagados = gastos?.filter(g => g.estado === 'pagado') || []
  const totalPendiente = gastosPendientes.reduce((sum, g) => sum + g.monto, 0)

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Pagado' }
      case 'pendiente':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pendiente' }
      case 'atrasado':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Atrasado' }
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Pendiente' }
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Gastos Comunes</h2>

      {/* Resumen */}
      {gastosPendientes.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold">Total Pendiente</h3>
            <DollarSign size={24} />
          </div>
          <p className="text-3xl font-bold">${totalPendiente.toLocaleString('es-CL')}</p>
          <p className="text-orange-100 text-sm mt-2">
            {gastosPendientes.length} período{gastosPendientes.length !== 1 ? 's' : ''} pendiente{gastosPendientes.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
          Pendientes ({gastosPendientes.length})
        </button>
        <button className="px-4 py-2 text-gray-500 font-medium text-sm">
          Pagados ({gastosPagados.length})
        </button>
      </div>

      {/* Lista de Gastos Pendientes */}
      {gastosPendientes.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
          <p className="text-green-800 font-semibold">¡Todo al día!</p>
          <p className="text-green-600 text-sm mt-1">No tienes gastos comunes pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {gastosPendientes.map((gasto) => {
            const estadoConfig = getEstadoConfig(gasto.estado)
            const Icon = estadoConfig.icon

            return (
              <button
                key={gasto.id}
                onClick={() => setSelectedGasto(gasto)}
                className="w-full bg-white rounded-2xl shadow-sm p-4 active:scale-95 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`${estadoConfig.bg} p-2 rounded-xl mr-3`}>
                      <Icon className={estadoConfig.color} size={20} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-800">
                        {MESES[gasto.mes - 1]} {gasto.anio}
                      </h3>
                      <p className={`text-xs ${estadoConfig.color} font-medium`}>
                        {estadoConfig.label}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-xs">
                    <Calendar size={14} className="mr-1" />
                    Vence: {format(new Date(gasto.fecha_vencimiento), 'dd MMM', { locale: es })}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">
                      ${gasto.monto.toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Gastos Pagados */}
      {gastosPagados.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Historial</h3>
          {gastosPagados.slice(0, 3).map((gasto) => (
            <button
              key={gasto.id}
              onClick={() => setSelectedGasto(gasto)}
              className="w-full bg-gray-50 rounded-2xl p-4 active:scale-95 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-xl mr-3">
                    <CheckCircle className="text-green-600" size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-700">
                      {MESES[gasto.mes - 1]} {gasto.anio}
                    </h3>
                    <p className="text-xs text-green-600">
                      Pagado {gasto.fecha_pago ? format(new Date(gasto.fecha_pago), 'dd/MM/yy') : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-700">
                    ${gasto.monto.toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal Detalle (Simple por ahora) */}
      {selectedGasto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50"
          onClick={() => setSelectedGasto(null)}
        >
          <div 
            className="bg-white rounded-t-3xl p-6 w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {MESES[selectedGasto.mes - 1]} {selectedGasto.anio}
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Monto</span>
                <span className="text-xl font-bold text-gray-800">
                  ${selectedGasto.monto.toLocaleString('es-CL')}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Estado</span>
                <span className={`font-semibold ${
                  selectedGasto.estado === 'pagado' ? 'text-green-600' :
                  selectedGasto.estado === 'atrasado' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {selectedGasto.estado === 'pagado' ? 'Pagado' :
                   selectedGasto.estado === 'atrasado' ? 'Atrasado' : 'Pendiente'}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Fecha vencimiento</span>
                <span className="font-semibold text-gray-800">
                  {format(new Date(selectedGasto.fecha_vencimiento), 'dd/MM/yyyy')}
                </span>
              </div>

              {selectedGasto.estado === 'pagado' && selectedGasto.fecha_pago && (
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Fecha de pago</span>
                  <span className="font-semibold text-green-600">
                    {format(new Date(selectedGasto.fecha_pago), 'dd/MM/yyyy')}
                  </span>
                </div>
              )}

              {selectedGasto.gasto_comun.notas && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">{selectedGasto.gasto_comun.notas}</p>
                </div>
              )}

              {selectedGasto.estado === 'pendiente' && (
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-semibold mt-4 active:scale-95 transition">
                  Pagar Ahora (Próximamente)
                </button>
              )}

              <button 
                onClick={() => setSelectedGasto(null)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium mt-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}