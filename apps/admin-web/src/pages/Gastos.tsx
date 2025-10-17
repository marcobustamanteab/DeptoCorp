/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Plus, DollarSign, CheckCircle, Clock, XCircle, CheckCircle2 } from 'lucide-react'
import { useEdificios } from '../../../../packages/shared/hooks/useEdificios'
import { useGastos } from '../../../../packages/shared/hooks/useGastos'
import { usePagos } from '../../../../packages/shared/hooks/usePagos'
import { gastosDepartamentoService } from '../../../../packages/supabase-client/src'
import toast, { Toaster } from 'react-hot-toast'

interface GastoFormData {
  edificio_id: string
  mes: number
  anio: number
  monto_total: number
  fecha_vencimiento: string
  notas: string
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function Gastos() {
  const { edificios } = useEdificios()
  const [selectedEdificio, setSelectedEdificio] = useState<string>('')
  const [selectedGasto, setSelectedGasto] = useState<any>(null)
  const [gastosDetalle, setGastosDetalle] = useState<any[]>([])
  const [showDetalle, setShowDetalle] = useState(false)
  
  const { 
    gastos, 
    isLoading, 
    createGasto,
    isCreating,
  } = useGastos(selectedEdificio)

  const { registrarPago, isRegistrandoPago } = usePagos()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showPagoModal, setShowPagoModal] = useState(false)
  const [selectedGastoDepto, setSelectedGastoDepto] = useState<any>(null)
  const [pagoForm, setPagoForm] = useState({
    monto: 0,
    metodo_pago: 'transferencia',
    referencia_externa: '',
    notas: '',
  })

  const currentDate = new Date()
  const [formData, setFormData] = useState<GastoFormData>({
    edificio_id: '',
    mes: currentDate.getMonth() + 1,
    anio: currentDate.getFullYear(),
    monto_total: 0,
    fecha_vencimiento: '',
    notas: '',
  })

  const handleOpenModal = () => {
    setFormData({
      edificio_id: selectedEdificio || '',
      mes: currentDate.getMonth() + 1,
      anio: currentDate.getFullYear(),
      monto_total: 0,
      fecha_vencimiento: '',
      notas: '',
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormData({
      edificio_id: '',
      mes: currentDate.getMonth() + 1,
      anio: currentDate.getFullYear(),
      monto_total: 0,
      fecha_vencimiento: '',
      notas: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.edificio_id) {
      toast.error('Debes seleccionar un edificio')
      return
    }

    if (formData.monto_total <= 0) {
      toast.error('El monto total debe ser mayor a 0')
      return
    }

    if (!formData.fecha_vencimiento) {
      toast.error('La fecha de vencimiento es obligatoria')
      return
    }

    const gastoData = {
      ...formData,
      estado: 'pendiente' as const,
    }

    createGasto(gastoData, {
      onSuccess: async (nuevoGasto: any) => {
        const { error } = await gastosDepartamentoService.asignarGastosTodos(
          nuevoGasto.id,
          formData.edificio_id
        )

        if (error) {
          toast.error('Gasto creado pero error al asignar a departamentos')
        } else {
          toast.success('Gasto creado y asignado a todos los departamentos')
        }
        
        handleCloseModal()
      },
    })
  }

  const handleVerDetalle = async (gasto: any) => {
    setSelectedGasto(gasto)
    const { data, error } = await gastosDepartamentoService.getByGastoComun(gasto.id)
    
    if (error) {
      toast.error('Error al cargar detalle')
      return
    }
    
    setGastosDetalle(data || [])
    setShowDetalle(true)
  }

  const handleRegistrarPago = (gastoDepto: any) => {
    setSelectedGastoDepto(gastoDepto)
    setPagoForm({
      monto: Number(gastoDepto.monto),
      metodo_pago: 'transferencia',
      referencia_externa: '',
      notas: '',
    })
    setShowPagoModal(true)
  }

  const handleSubmitPago = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedGastoDepto) return

    registrarPago({
      gasto_departamento_id: selectedGastoDepto.id,
      ...pagoForm,
    }, {
      onSuccess: () => {
        setShowPagoModal(false)
        handleVerDetalle(selectedGasto)
      },
    })
  }

  const calcularEstadisticas = (gastosDep: any[]) => {
    const total = gastosDep.length
    const pagados = gastosDep.filter(g => g.estado === 'pagado').length
    const pendientes = gastosDep.filter(g => g.estado === 'pendiente').length
    const atrasados = gastosDep.filter(g => g.estado === 'atrasado').length
    const montoPagado = gastosDep
      .filter(g => g.estado === 'pagado')
      .reduce((sum, g) => sum + Number(g.monto), 0)
    const montoPendiente = gastosDep
      .filter(g => g.estado !== 'pagado')
      .reduce((sum, g) => sum + Number(g.monto), 0)

    return { total, pagados, pendientes, atrasados, montoPagado, montoPendiente }
  }

  if (edificios.length === 0) {
    return (
      <div>
        <Toaster position="top-right" />
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Gastos Comunes</h1>
        <Card>
          <div className="text-center py-12">
            <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">Primero debes crear un edificio</p>
            <Button onClick={() => window.location.href = '/edificios'}>
              Ir a Edificios
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gastos Comunes</h1>
        <Button 
          onClick={handleOpenModal}
          disabled={!selectedEdificio}
        >
          <Plus size={20} className="inline mr-2" />
          Nuevo Gasto Común
        </Button>
      </div>

      <Card className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Edificio
        </label>
        <select
          value={selectedEdificio}
          onChange={(e) => setSelectedEdificio(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">-- Selecciona un edificio --</option>
          {edificios.map((edificio: any) => (
            <option key={edificio.id} value={edificio.id}>
              {edificio.nombre}
            </option>
          ))}
        </select>
      </Card>

      {!selectedEdificio ? (
        <Card>
          <p className="text-gray-500 text-center py-8">
            Selecciona un edificio para ver los gastos comunes
          </p>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Cargando gastos...</div>
        </div>
      ) : gastos.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No hay gastos comunes en este edificio</p>
            <Button onClick={handleOpenModal}>
              Crear primer gasto común
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {gastos.map((gasto:any) => {
            const stats = calcularEstadisticas(gasto.gastos_departamento || [])
            const porcentajePagado = stats.total > 0 ? (stats.pagados / stats.total) * 100 : 0

            return (
              <Card key={gasto.id}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <DollarSign className="text-yellow-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {MESES[gasto.mes - 1]} {gasto.anio}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Vence: {new Date(gasto.fecha_vencimiento).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-600">Monto Total</p>
                        <p className="text-lg font-bold text-gray-800">
                          ${gasto.monto_total.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Recaudado</p>
                        <p className="text-lg font-bold text-green-600">
                          ${stats.montoPagado.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Pendiente</p>
                        <p className="text-lg font-bold text-red-600">
                          ${stats.montoPendiente.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Estado</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${porcentajePagado}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {Math.round(porcentajePagado)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-1">
                        <CheckCircle size={16} className="text-green-600" />
                        <span>{stats.pagados} pagados</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} className="text-yellow-600" />
                        <span>{stats.pendientes} pendientes</span>
                      </div>
                      {stats.atrasados > 0 && (
                        <div className="flex items-center gap-1">
                          <XCircle size={16} className="text-red-600" />
                          <span>{stats.atrasados} atrasados</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleVerDetalle(gasto)}
                      className="flex-1 md:flex-none"
                    >
                      Ver Detalle
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Crear Gasto */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Nuevo Gasto Común"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Edificio *
            </label>
            <select
              value={formData.edificio_id}
              onChange={(e) => setFormData({ ...formData, edificio_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Selecciona --</option>
              {edificios.map((edificio: any) => (
                <option key={edificio.id} value={edificio.id}>
                  {edificio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mes *
              </label>
              <select
                value={formData.mes}
                onChange={(e) => setFormData({ ...formData, mes: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {MESES.map((mes, index) => (
                  <option key={index} value={index + 1}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Año *"
              type="number"
              value={formData.anio}
              onChange={(e) => setFormData({ ...formData, anio: Number(e.target.value) })}
              min="2020"
              max="2030"
              required
            />
          </div>

          <Input
            label="Monto Total *"
            type="number"
            step="0.01"
            value={formData.monto_total}
            onChange={(e) => setFormData({ ...formData, monto_total: Number(e.target.value) })}
            placeholder="1000000"
            min="0"
            required
          />

          <Input
            label="Fecha de Vencimiento *"
            type="date"
            value={formData.fecha_vencimiento}
            onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Detalles adicionales..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 El gasto se distribuirá automáticamente a todos los departamentos según su porcentaje de gastos comunes.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isCreating}
            >
              {isCreating ? 'Creando...' : 'Crear y Asignar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalle */}
      <Modal
        isOpen={showDetalle}
        onClose={() => setShowDetalle(false)}
        title={selectedGasto ? `Detalle - ${MESES[selectedGasto.mes - 1]} ${selectedGasto.anio}` : 'Detalle'}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Monto Total</p>
                <p className="text-lg font-bold">${selectedGasto?.monto_total.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Vencimiento</p>
                <p className="text-lg font-bold">
                  {selectedGasto && new Date(selectedGasto.fecha_vencimiento).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Depto</th>
                  <th className="px-4 py-2 text-right">Monto</th>
                  <th className="px-4 py-2 text-center">Estado</th>
                  <th className="px-4 py-2 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {gastosDetalle.map((gd) => (
                  <tr key={gd.id} className="border-t">
                    <td className="px-4 py-2">{gd.departamento?.numero}</td>
                    <td className="px-4 py-2 text-right font-medium">
                      ${Number(gd.monto).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        gd.estado === 'pagado' ? 'bg-green-100 text-green-800' :
                        gd.estado === 'atrasado' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {gd.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {gd.estado === 'pendiente' || gd.estado === 'atrasado' ? (
                        <button
                          onClick={() => handleRegistrarPago(gd)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Registrar Pago
                        </button>
                      ) : (
                        <CheckCircle2 className="text-green-600 mx-auto" size={18} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            onClick={() => setShowDetalle(false)}
            className="w-full"
          >
            Cerrar
          </Button>
        </div>
      </Modal>

      {/* Modal Registrar Pago */}
      <Modal
        isOpen={showPagoModal}
        onClose={() => setShowPagoModal(false)}
        title="Registrar Pago"
      >
        <form onSubmit={handleSubmitPago} className="space-y-4">
          {selectedGastoDepto && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Departamento</p>
              <p className="font-bold text-lg">
                Depto {selectedGastoDepto.departamento?.numero}
              </p>
              <p className="text-sm text-gray-600 mt-2">Monto a pagar</p>
              <p className="font-bold text-2xl text-green-600">
                ${Number(selectedGastoDepto.monto).toLocaleString()}
              </p>
            </div>
          )}

          <Input
            label="Monto Pagado *"
            type="number"
            step="0.01"
            value={pagoForm.monto}
            onChange={(e) => setPagoForm({ ...pagoForm, monto: Number(e.target.value) })}
            required
            min="0"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago *
            </label>
            <select
              value={pagoForm.metodo_pago}
              onChange={(e) => setPagoForm({ ...pagoForm, metodo_pago: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="transferencia">Transferencia Bancaria</option>
              <option value="efectivo">Efectivo</option>
              <option value="cheque">Cheque</option>
              <option value="deposito">Depósito</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <Input
            label="Número de Referencia"
            value={pagoForm.referencia_externa}
            onChange={(e) => setPagoForm({ ...pagoForm, referencia_externa: e.target.value })}
            placeholder="Ej: N° de transferencia, N° de cheque, etc"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={pagoForm.notas}
              onChange={(e) => setPagoForm({ ...pagoForm, notas: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Observaciones adicionales..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowPagoModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isRegistrandoPago}
            >
              {isRegistrandoPago ? 'Registrando...' : 'Registrar Pago'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}