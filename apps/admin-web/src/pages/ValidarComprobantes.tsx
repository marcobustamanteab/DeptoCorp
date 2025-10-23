import { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../../packages/supabase-client/src/client'
import { FileText, CheckCircle, XCircle, Eye, Calendar, DollarSign, Home, User } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { format } from 'date-fns'
import { showConfirm } from '../utils/alerts'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

interface Pago {
  id: string
  monto: number
  metodo_pago: string
  referencia_externa: string | null
  comprobante_url: string | null
  estado: 'pendiente' | 'confirmado' | 'rechazado'
  notas: string | null
  created_at: string
  gasto_departamento: {
    id: string
    monto: number
    departamento: {
      numero: string
      edificio: {
        nombre: string
      }
    }
    gasto_comun: {
      mes: number
      anio: number
    }
  }
}

// Componente para mostrar imagen del comprobante
function ComprobanteImage({ url }: { url: string }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getSignedUrl() {
      try {
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split('/')
        const fileName = pathParts[pathParts.length - 1]
        
        if (!fileName) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase.storage
          .from('comprobantes')
          .createSignedUrl(fileName, 3600)

        if (error) {
          console.error('Error getting signed URL:', error)
          setLoading(false)
          return
        }

        setSignedUrl(data.signedUrl)
        setLoading(false)
      } catch (error) {
        console.error('Error:', error)
        setLoading(false)
      }
    }

    getSignedUrl()
  }, [url])

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Cargando imagen...</div>
  }

  if (!signedUrl) {
    return <div className="text-center py-8 text-red-600">Error al cargar la imagen</div>
  }

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">Comprobante:</p>
      <img 
        src={signedUrl} 
        alt="Comprobante" 
        className="w-full rounded-lg border border-gray-300"
      />
      <a
        href={signedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 hover:underline mt-2 inline-block"
      >
        Abrir en nueva pestaña →
      </a>
    </div>
  )
}

export function ValidarComprobantes() {
  const queryClient = useQueryClient()
  const [filtroEstado, setFiltroEstado] = useState<string>('pendiente')
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Obtener TODOS los pagos
  const { data: allPagos, isLoading } = useQuery({
    queryKey: ['pagos-validar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pagos')
        .select(`
          *,
          gasto_departamento:gastos_departamento(
            id,
            monto,
            departamento:departamentos(
              numero,
              edificio:edificios(nombre)
            ),
            gasto_comun:gastos_comunes(mes, anio)
          )
        `)
        .not('comprobante_url', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Pago[]
    },
  })

  // Filtrar según estado seleccionado
  const pagos = allPagos?.filter(p => p.estado === filtroEstado) || []

  // Calcular contadores
  const pagosPendientes = allPagos?.filter(p => p.estado === 'pendiente').length || 0
  const pagosConfirmados = allPagos?.filter(p => p.estado === 'confirmado').length || 0
  const pagosRechazados = allPagos?.filter(p => p.estado === 'rechazado').length || 0

  // Mutation para validar/rechazar
  const validarPago = useMutation({
    mutationFn: async ({ pagoId, estado, gastoDeptoId }: { pagoId: string, estado: 'confirmado' | 'rechazado', gastoDeptoId: string }) => {
      const { error: pagoError } = await supabase
        .from('pagos')
        .update({ estado })
        .eq('id', pagoId)

      if (pagoError) throw pagoError

      if (estado === 'confirmado') {
        const { error: gastoError } = await supabase
          .from('gastos_departamento')
          .update({ 
            estado: 'pagado',
            fecha_pago: new Date().toISOString()
          })
          .eq('id', gastoDeptoId)

        if (gastoError) throw gastoError
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pagos-validar'] })
      toast.success(
        variables.estado === 'confirmado' 
          ? 'Comprobante confirmado exitosamente' 
          : 'Comprobante rechazado'
      )
      setShowModal(false)
      setSelectedPago(null)
    },
    onError: () => {
      toast.error('Error al procesar el comprobante')
    }
  })

  const handleVerDetalle = (pago: Pago) => {
    setSelectedPago(pago)
    setShowModal(true)
  }
  
  const handleValidar = async (estado: 'confirmado' | 'rechazado') => {
    if (!selectedPago) return
    
    const mensaje = estado === 'confirmado' 
      ? '¿Confirmar este comprobante como válido?' 
      : '¿Rechazar este comprobante?'
    
    const confirmText = estado === 'confirmado' ? 'Sí, confirmar' : 'Sí, rechazar'
    
    const confirmed = await showConfirm(mensaje, '¿Estás seguro?', confirmText, 'Cancelar')
    
    if (confirmed) {
      validarPago.mutate({
        pagoId: selectedPago.id,
        estado,
        gastoDeptoId: selectedPago.gasto_departamento.id
      })
    }
  }

  return (
    <div>
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Validar Comprobantes</h1>
        <p className="text-gray-600 mt-1">Revisa y valida los comprobantes de pago subidos por residentes</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">{pagosPendientes}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FileText className="text-yellow-600" size={32} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Confirmados</p>
              <p className="text-3xl font-bold text-green-600">{pagosConfirmados}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rechazados</p>
              <p className="text-3xl font-bold text-red-600">{pagosRechazados}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="text-red-600" size={32} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFiltroEstado('pendiente')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtroEstado === 'pendiente'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pendientes ({pagosPendientes})
          </button>
          <button
            onClick={() => setFiltroEstado('confirmado')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtroEstado === 'confirmado'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Confirmados ({pagosConfirmados})
          </button>
          <button
            onClick={() => setFiltroEstado('rechazado')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtroEstado === 'rechazado'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Rechazados ({pagosRechazados})
          </button>
        </div>
      </Card>

      {/* Lista */}
      {isLoading ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando comprobantes...</p>
          </div>
        </Card>
      ) : !pagos || pagos.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No hay comprobantes {filtroEstado}s</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagos.map((pago) => (
            <Card key={pago.id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${
                      pago.estado === 'confirmado' ? 'bg-green-100' :
                      pago.estado === 'rechazado' ? 'bg-red-100' :
                      'bg-yellow-100'
                    }`}>
                      <FileText className={
                        pago.estado === 'confirmado' ? 'text-green-600' :
                        pago.estado === 'rechazado' ? 'text-red-600' :
                        'text-yellow-600'
                      } size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {MESES[pago.gasto_departamento.gasto_comun.mes - 1]} {pago.gasto_departamento.gasto_comun.anio}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {format(new Date(pago.created_at), 'dd/MM/yy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    pago.estado === 'confirmado' ? 'bg-green-100 text-green-700' :
                    pago.estado === 'rechazado' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {pago.estado === 'confirmado' ? 'Confirmado' :
                     pago.estado === 'rechazado' ? 'Rechazado' : 'Pendiente'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Home size={16} className="mr-2" />
                    <span className="font-medium">{pago.gasto_departamento.departamento.edificio.nombre}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User size={16} className="mr-2" />
                    <span>Depto {pago.gasto_departamento.departamento.numero}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign size={16} className="mr-2" />
                    <span className="font-bold">${pago.monto.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    <span>{pago.metodo_pago}</span>
                  </div>
                </div>

                <Button onClick={() => handleVerDetalle(pago)} variant="secondary" className="w-full">
                  <Eye size={16} className="inline mr-2" />
                  Ver Comprobante
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedPago && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Detalle del Comprobante</h3>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Edificio:</span>
                  <span className="font-semibold">{selectedPago.gasto_departamento.departamento.edificio.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Departamento:</span>
                  <span className="font-semibold">{selectedPago.gasto_departamento.departamento.numero}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Período:</span>
                  <span className="font-semibold">
                    {MESES[selectedPago.gasto_departamento.gasto_comun.mes - 1]} {selectedPago.gasto_departamento.gasto_comun.anio}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-bold text-lg">${selectedPago.monto.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método:</span>
                  <span className="font-semibold">{selectedPago.metodo_pago}</span>
                </div>
                {selectedPago.referencia_externa && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Referencia:</span>
                    <span className="font-semibold">{selectedPago.referencia_externa}</span>
                  </div>
                )}
                {selectedPago.notas && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600 block mb-1">Notas:</span>
                    <span className="text-sm">{selectedPago.notas}</span>
                  </div>
                )}
              </div>

              {selectedPago.comprobante_url && (
                <ComprobanteImage url={selectedPago.comprobante_url} />
              )}

              {selectedPago.estado === 'pendiente' && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={() => handleValidar('rechazado')} variant="danger" className="flex-1" disabled={validarPago.isPending}>
                    <XCircle size={20} className="inline mr-2" />
                    Rechazar
                  </Button>
                  <Button onClick={() => handleValidar('confirmado')} className="flex-1 bg-green-500 hover:bg-green-600" disabled={validarPago.isPending}>
                    <CheckCircle size={20} className="inline mr-2" />
                    Confirmar
                  </Button>
                </div>
              )}

              <Button onClick={() => setShowModal(false)} variant="secondary" className="w-full">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}