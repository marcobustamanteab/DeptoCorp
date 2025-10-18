// ==========================================
// apps/resident-app/src/pages/GastosPage.tsx
// CON SUBIDA DE COMPROBANTES
// ==========================================
import { useResidentProfile } from '@deptocorp/shared/hooks/useResidentProfile'
import { useResidentGastos } from '@deptocorp/shared/hooks/useResidentGastos'
import { useSubirComprobante, useComprobantesGasto } from '@deptocorp/shared/hooks/useComprobantes'
import { DollarSign, Calendar, CheckCircle, Clock, AlertCircle, ChevronRight, Upload, Camera, FileText } from 'lucide-react'
import { useState, useRef } from 'react'
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
  const [showComprobanteModal, setShowComprobanteModal] = useState(false)
  const [gastoParaComprobante, setGastoParaComprobante] = useState<any>(null)

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

  const handleSubirComprobante = (gasto: any) => {
    setGastoParaComprobante(gasto)
    setShowComprobanteModal(true)
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
              <div key={gasto.id} className="bg-white rounded-2xl shadow-sm p-4">
                <button
                  onClick={() => setSelectedGasto(gasto)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`${estadoConfig.bg} p-2 rounded-xl mr-3`}>
                        <Icon className={estadoConfig.color} size={20} />
                      </div>
                      <div>
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

                {/* Botón Subir Comprobante */}
                <button
                  onClick={() => handleSubirComprobante(gasto)}
                  className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  <Upload size={20} />
                  Subir Comprobante
                </button>
              </div>
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

      {/* Modal Detalle */}
      {selectedGasto && (
        <ModalDetalle
          gasto={selectedGasto}
          onClose={() => setSelectedGasto(null)}
          onSubirComprobante={() => {
            setGastoParaComprobante(selectedGasto)
            setShowComprobanteModal(true)
            setSelectedGasto(null)
          }}
        />
      )}

      {/* Modal Subir Comprobante */}
      {showComprobanteModal && gastoParaComprobante && (
        <ModalSubirComprobante
          gasto={gastoParaComprobante}
          onClose={() => {
            setShowComprobanteModal(false)
            setGastoParaComprobante(null)
          }}
        />
      )}
    </div>
  )
}

// Modal Detalle del Gasto
function ModalDetalle({ gasto, onClose, onSubirComprobante }: any) {
  const { data: comprobantes } = useComprobantesGasto(gasto.id)

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl p-6 w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {MESES[gasto.mes - 1]} {gasto.anio}
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Monto</span>
            <span className="text-xl font-bold text-gray-800">
              ${gasto.monto.toLocaleString('es-CL')}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Estado</span>
            <span className={`font-semibold ${
              gasto.estado === 'pagado' ? 'text-green-600' :
              gasto.estado === 'atrasado' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {gasto.estado === 'pagado' ? 'Pagado' :
               gasto.estado === 'atrasado' ? 'Atrasado' : 'Pendiente'}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Fecha vencimiento</span>
            <span className="font-semibold text-gray-800">
              {format(new Date(gasto.fecha_vencimiento), 'dd/MM/yyyy')}
            </span>
          </div>

          {/* Comprobantes Subidos */}
          {comprobantes && comprobantes.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                📎 Comprobantes subidos ({comprobantes.length})
              </p>
              <div className="space-y-2">
                {comprobantes.map((comp: any) => (
                  <div key={comp.id} className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue-600" />
                        <div>
                          <p className="text-xs font-medium text-gray-800">
                            {comp.metodo_pago}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(comp.created_at), 'dd/MM/yy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold ${
                        comp.estado === 'confirmado' ? 'text-green-600' :
                        comp.estado === 'rechazado' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {comp.estado === 'confirmado' ? '✓ Confirmado' :
                         comp.estado === 'rechazado' ? '✗ Rechazado' :
                         '⏳ Pendiente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gasto.estado === 'pendiente' && (
            <button 
              onClick={onSubirComprobante}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-semibold mt-4 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              Subir Comprobante
            </button>
          )}

          <button 
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium mt-2"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal Subir Comprobante
function ModalSubirComprobante({ gasto, onClose }: any) {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [previsualizacion, setPrevisualizacion] = useState<string | null>(null)
  const [metodoPago, setMetodoPago] = useState('transferencia')
  const [referencia, setReferencia] = useState('')
  const [notas, setNotas] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { mutate: subirComprobante, isPending } = useSubirComprobante()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no debe superar 5MB')
        return
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten imágenes')
        return
      }

      setArchivo(file)
      
      // Crear previsualización
      const reader = new FileReader()
      reader.onloadend = () => {
        setPrevisualizacion(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!archivo) {
      alert('Debes seleccionar un archivo')
      return
    }

    subirComprobante({
      gastoDeptoId: gasto.id,
      archivo,
      metodo_pago: metodoPago,
      referencia_externa: referencia || undefined,
      notas: notas || undefined
    }, {
      onSuccess: () => onClose()
    })
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl p-6 w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>

        <h3 className="text-2xl font-bold text-gray-800 mb-2">Subir Comprobante</h3>
        <p className="text-gray-600 mb-6">
          {MESES[gasto.mes - 1]} {gasto.anio} • ${gasto.monto.toLocaleString('es-CL')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Seleccionar Archivo */}
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {previsualizacion ? (
              <div className="relative">
                <img 
                  src={previsualizacion} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => {
                    setArchivo(null)
                    setPrevisualizacion(null)
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="w-full bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-blue-100 transition"
                >
                  <Camera size={40} className="text-blue-500" />
                  <div className="text-center">
                    <p className="font-semibold text-blue-700">Seleccionar imagen</p>
                    <p className="text-xs text-blue-600 mt-1">Máx. 5MB</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Método de pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="cheque">Cheque</option>
              <option value="deposito">Depósito</option>
            </select>
          </div>

          {/* Referencia */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              N° de referencia (opcional)
            </label>
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 123456789"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Información adicional..."
            />
          </div>

          {/* Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-xs text-yellow-800">
              ℹ️ Tu comprobante será revisado por la administración. Recibirás una confirmación una vez validado.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !archivo}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Subiendo...' : 'Subir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}