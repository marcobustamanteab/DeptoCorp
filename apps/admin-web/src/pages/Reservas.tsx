/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Plus, Calendar, MapPin, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useEdificios } from '../../../../packages/shared/hooks/useEdificios'
import { useDepartamentos } from '../../../../packages/shared/hooks/useDepartamentos'
import { useEspaciosComunes } from '../../../../packages/shared/hooks/useEspaciosComunes'
import { useReservas } from '../../../../packages/shared/hooks/useReservas'
import toast, { Toaster } from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { showDeleteConfirm } from '../utils/alerts'

export function Reservas() {
  const { edificios } = useEdificios()
  const [selectedEdificio, setSelectedEdificio] = useState<string>('')
  const { departamentos } = useDepartamentos(selectedEdificio)
  const { espacios, createEspacio, deleteEspacio } = useEspaciosComunes(selectedEdificio)
  const { reservas, isLoading, createReserva, updateReserva, deleteReserva, isCreating } = useReservas(selectedEdificio)

  const [showEspacioModal, setShowEspacioModal] = useState(false)
  const [showReservaModal, setShowReservaModal] = useState(false)
  const [espacioForm, setEspacioForm] = useState({
    edificio_id: '',
    nombre: '',
    descripcion: '',
    capacidad: 0,
  })
  const [reservaForm, setReservaForm] = useState({
    edificio_id: '',
    espacio_id: '',
    departamento_id: '',
    fecha_inicio: '',
    hora_inicio: '',
    fecha_fin: '',
    hora_fin: '',
    notas: '',
  })

  const handleCreateEspacio = (e: React.FormEvent) => {
    e.preventDefault()
    if (!espacioForm.nombre.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    createEspacio({ ...espacioForm, activo: true }, {
      onSuccess: () => {
        setShowEspacioModal(false)
        setEspacioForm({ edificio_id: '', nombre: '', descripcion: '', capacidad: 0 })
      },
    })
  }

  const handleDeleteEspacio = async (id: string, nombre: string) => {
    const confirmed = await showDeleteConfirm(nombre)
    if (!confirmed) return
    deleteEspacio(id)
  }

  const handleCreateReserva = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reservaForm.espacio_id || !reservaForm.departamento_id) {
      toast.error('Debes seleccionar espacio y departamento')
      return
    }

    if (!reservaForm.fecha_inicio || !reservaForm.hora_inicio || !reservaForm.fecha_fin || !reservaForm.hora_fin) {
      toast.error('Debes completar todas las fechas y horas')
      return
    }

    const fechaInicio = new Date(`${reservaForm.fecha_inicio}T${reservaForm.hora_inicio}`)
    const fechaFin = new Date(`${reservaForm.fecha_fin}T${reservaForm.hora_fin}`)

    if (fechaFin <= fechaInicio) {
      toast.error('La fecha de fin debe ser posterior a la de inicio')
      return
    }

    // CORRECCIÓN: El admin crea reservas ya confirmadas
    createReserva({
      edificio_id: selectedEdificio,
      espacio_id: reservaForm.espacio_id,
      departamento_id: reservaForm.departamento_id,
      fecha_inicio: fechaInicio.toISOString(),
      fecha_fin: fechaFin.toISOString(),
      estado: 'confirmada', // Admin confirma directamente
      notas: reservaForm.notas,
    }, {
      onSuccess: () => {
        setShowReservaModal(false)
        setReservaForm({
          edificio_id: '',
          espacio_id: '',
          departamento_id: '',
          fecha_inicio: '',
          hora_inicio: '',
          fecha_fin: '',
          hora_fin: '',
          notas: '',
        })
      },
    })
  }

  const handleAprobarReserva = (id: string) => {
    updateReserva({ id, estado: 'confirmada' })
  }

  const handleRechazarReserva = async (id: string) => {
    const confirmed = await showDeleteConfirm('esta reserva')
    if (!confirmed) return
    updateReserva({ id, estado: 'cancelada' })
  }

  const handleDeleteReserva = async (id: string) => {
    const confirmed = await showDeleteConfirm('esta reserva')
    if (!confirmed) return
    deleteReserva(id)
  }

  const getEstadoBadge = (estado: string) => {
    const badges = {
      pendiente: { color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle size={14} />, label: 'Pendiente' },
      confirmada: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} />, label: 'Confirmada' },
      cancelada: { color: 'bg-red-100 text-red-800', icon: <XCircle size={14} />, label: 'Cancelada' },
    }
    return badges[estado as keyof typeof badges] || badges.pendiente
  }

  // Separar reservas por estado
  const reservasPendientes = reservas?.filter((r: any) => r.estado === 'pendiente') || []
  const reservasConfirmadas = reservas?.filter((r: any) => r.estado === 'confirmada') || []

  if (edificios.length === 0) {
    return (
      <div>
        <Toaster position="top-right" />
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Reservas</h1>
        <Card>
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
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
        <h1 className="text-3xl font-bold text-gray-800">Reservas de Espacios Comunes</h1>
        <div className="flex gap-3">
          <Button 
            variant="secondary"
            onClick={() => {
              setEspacioForm({ ...espacioForm, edificio_id: selectedEdificio })
              setShowEspacioModal(true)
            }}
            disabled={!selectedEdificio}
          >
            <Plus size={20} className="inline mr-2" />
            Nuevo Espacio
          </Button>
          <Button 
            onClick={() => {
              setReservaForm({ ...reservaForm, edificio_id: selectedEdificio })
              setShowReservaModal(true)
            }}
            disabled={!selectedEdificio || espacios.length === 0}
          >
            <Plus size={20} className="inline mr-2" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      {/* Selector de Edificio */}
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
          {edificios.map((edificio) => (
            <option key={edificio.id} value={edificio.id}>
              {edificio.nombre}
            </option>
          ))}
        </select>
      </Card>

      {!selectedEdificio ? (
        <Card>
          <p className="text-gray-500 text-center py-8">
            Selecciona un edificio para ver sus reservas
          </p>
        </Card>
      ) : espacios.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No hay espacios comunes configurados</p>
            <Button onClick={() => {
              setEspacioForm({ ...espacioForm, edificio_id: selectedEdificio })
              setShowEspacioModal(true)
            }}>
              Crear primer espacio común
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Espacios Comunes */}
          <Card className="mb-6">
            <h3 className="font-bold text-lg mb-4">Espacios Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {espacios.map((espacio) => (
                <div key={espacio.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{espacio.nombre}</h4>
                      {espacio.descripcion && (
                        <p className="text-sm text-gray-600 mt-1">{espacio.descripcion}</p>
                      )}
                      {espacio.capacidad && (
                        <p className="text-sm text-gray-500 mt-1">
                          Capacidad: {espacio.capacidad} personas
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteEspacio(espacio.id, espacio.nombre)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Reservas Pendientes de Aprobación */}
          {reservasPendientes.length > 0 && (
            <Card className="mb-6 border-yellow-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="text-yellow-600" size={20} />
                Reservas Pendientes de Aprobación ({reservasPendientes.length})
              </h3>
              <div className="space-y-3">
                {reservasPendientes.map((reserva: any) => {
                  const badge = getEstadoBadge(reserva.estado)
                  return (
                    <div key={reserva.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin size={16} className="text-gray-600" />
                            <h4 className="font-medium">{reserva.espacio.nombre}</h4>
                            <span className={`${badge.color} px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                              {badge.icon} {badge.label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Departamento:</strong> {reserva.departamento.numero}</p>
                            <p className="flex items-center gap-1">
                              <Clock size={14} />
                              {format(new Date(reserva.fecha_inicio), "dd MMM yyyy HH:mm", { locale: es })} - {format(new Date(reserva.fecha_fin), "HH:mm")}
                            </p>
                            {reserva.notas && <p><strong>Notas:</strong> {reserva.notas}</p>}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => handleAprobarReserva(reserva.id)}
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleRechazarReserva(reserva.id)}
                          >
                            <XCircle size={16} className="mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Lista de Reservas Confirmadas */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-600">Cargando reservas...</div>
            </div>
          ) : reservasConfirmadas.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No hay reservas confirmadas</p>
              </div>
            </Card>
          ) : (
            <Card>
              <h3 className="font-bold text-lg mb-4">Reservas Confirmadas</h3>
              <div className="space-y-3">
                {reservasConfirmadas.map((reserva: any) => {
                  const badge = getEstadoBadge(reserva.estado)
                  return (
                    <div key={reserva.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin size={16} className="text-gray-600" />
                            <h4 className="font-medium">{reserva.espacio.nombre}</h4>
                            <span className={`${badge.color} px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                              {badge.icon} {badge.label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Departamento:</strong> {reserva.departamento.numero}</p>
                            <p className="flex items-center gap-1">
                              <Clock size={14} />
                              {format(new Date(reserva.fecha_inicio), "dd MMM yyyy HH:mm", { locale: es })} - {format(new Date(reserva.fecha_fin), "HH:mm")}
                            </p>
                            {reserva.notas && <p><strong>Notas:</strong> {reserva.notas}</p>}
                          </div>
                        </div>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteReserva(reserva.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Modal Crear Espacio Común */}
      <Modal
        isOpen={showEspacioModal}
        onClose={() => setShowEspacioModal(false)}
        title="Nuevo Espacio Común"
      >
        <form onSubmit={handleCreateEspacio} className="space-y-4">
          <Input
            label="Nombre *"
            value={espacioForm.nombre}
            onChange={(e) => setEspacioForm({ ...espacioForm, nombre: e.target.value })}
            placeholder="Ej: Quincho, Sala de eventos"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={espacioForm.descripcion}
              onChange={(e) => setEspacioForm({ ...espacioForm, descripcion: e.target.value })}
              placeholder="Descripción del espacio..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <Input
            label="Capacidad (personas)"
            type="number"
            value={espacioForm.capacidad}
            onChange={(e) => setEspacioForm({ ...espacioForm, capacidad: Number(e.target.value) })}
            placeholder="10"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowEspacioModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Crear Reserva */}
      <Modal
        isOpen={showReservaModal}
        onClose={() => setShowReservaModal(false)}
        title="Nueva Reserva"
      >
        <form onSubmit={handleCreateReserva} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Espacio Común *
            </label>
            <select
              value={reservaForm.espacio_id}
              onChange={(e) => setReservaForm({ ...reservaForm, espacio_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Selecciona un espacio --</option>
              {espacios.map((espacio) => (
                <option key={espacio.id} value={espacio.id}>
                  {espacio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departamento *
            </label>
            <select
              value={reservaForm.departamento_id}
              onChange={(e) => setReservaForm({ ...reservaForm, departamento_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Selecciona un departamento --</option>
              {departamentos.map((depto) => (
                <option key={depto.id} value={depto.id}>
                  Depto {depto.numero}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha Inicio *"
              type="date"
              value={reservaForm.fecha_inicio}
              onChange={(e) => setReservaForm({ ...reservaForm, fecha_inicio: e.target.value })}
              required
            />
            <Input
              label="Hora Inicio *"
              type="time"
              value={reservaForm.hora_inicio}
              onChange={(e) => setReservaForm({ ...reservaForm, hora_inicio: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha Fin *"
              type="date"
              value={reservaForm.fecha_fin}
              onChange={(e) => setReservaForm({ ...reservaForm, fecha_fin: e.target.value })}
              required
            />
            <Input
              label="Hora Fin *"
              type="time"
              value={reservaForm.hora_fin}
              onChange={(e) => setReservaForm({ ...reservaForm, hora_fin: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={reservaForm.notas}
              onChange={(e) => setReservaForm({ ...reservaForm, notas: e.target.value })}
              placeholder="Notas adicionales..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowReservaModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isCreating}
            >
              {isCreating ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}