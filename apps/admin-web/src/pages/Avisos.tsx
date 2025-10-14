/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Plus, Edit2, Trash2, Bell, Eye, EyeOff } from 'lucide-react'
import { useEdificios } from '../../../../packages/shared/hooks/useEdificios'
import { useAvisos } from '../../../../packages/shared/hooks/useAvisos'
import toast, { Toaster } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface AvisoFormData {
  edificio_id: string
  titulo: string
  contenido: string
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente'
  fecha_expiracion: string
}

const PRIORIDADES = [
  { value: 'baja', label: 'Baja', color: 'bg-gray-100 text-gray-800', icon: '📋' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800', icon: '📢' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800', icon: '⚠️' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-800', icon: '🚨' },
]

export function Avisos() {
  const { edificios } = useEdificios()
  const [selectedEdificio, setSelectedEdificio] = useState<string>('')
  
  const { 
    avisos, 
    isLoading, 
    createAviso, 
    updateAviso, 
    deleteAviso,
    desactivarAviso,
    isCreating,
    isUpdating,
  } = useAvisos(selectedEdificio)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAviso, setEditingAviso] = useState<any>(null)
  const [formData, setFormData] = useState<AvisoFormData>({
    edificio_id: '',
    titulo: '',
    contenido: '',
    prioridad: 'normal',
    fecha_expiracion: '',
  })

  const handleOpenModal = (aviso?: any) => {
    if (aviso) {
      setEditingAviso(aviso)
      setFormData({
        edificio_id: aviso.edificio_id,
        titulo: aviso.titulo,
        contenido: aviso.contenido,
        prioridad: aviso.prioridad,
        fecha_expiracion: aviso.fecha_expiracion || '',
      })
    } else {
      setEditingAviso(null)
      setFormData({
        edificio_id: selectedEdificio || '',
        titulo: '',
        contenido: '',
        prioridad: 'normal',
        fecha_expiracion: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingAviso(null)
    setFormData({
      edificio_id: '',
      titulo: '',
      contenido: '',
      prioridad: 'normal',
      fecha_expiracion: '',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.edificio_id) {
      toast.error('Debes seleccionar un edificio')
      return
    }

    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio')
      return
    }

    if (!formData.contenido.trim()) {
      toast.error('El contenido es obligatorio')
      return
    }

    const avisoData = {
      ...formData,
      activo: true,
      fecha_publicacion: new Date().toISOString(),
    }

    if (editingAviso) {
      updateAviso(
        { id: editingAviso.id, ...avisoData },
        {
          onSuccess: () => handleCloseModal(),
        }
      )
    } else {
      createAviso(avisoData, {
        onSuccess: () => handleCloseModal(),
      })
    }
  }

  const handleDelete = (id: string, titulo: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el aviso "${titulo}"?`)) {
      deleteAviso(id)
    }
  }

  const handleToggleActivo = (aviso: any) => {
    if (aviso.activo) {
      desactivarAviso(aviso.id)
    } else {
      updateAviso({ id: aviso.id, activo: true })
    }
  }

  const getPrioridadConfig = (prioridad: string) => {
    return PRIORIDADES.find(p => p.value === prioridad) || PRIORIDADES[1]
  }

  if (edificios.length === 0) {
    return (
      <div>
        <Toaster position="top-right" />
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Avisos</h1>
        <Card>
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
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
        <h1 className="text-3xl font-bold text-gray-800">Avisos y Comunicados</h1>
        <Button 
          onClick={() => handleOpenModal()}
          disabled={!selectedEdificio}
        >
          <Plus size={20} className="inline mr-2" />
          Nuevo Aviso
        </Button>
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
            Selecciona un edificio para ver sus avisos
          </p>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Cargando avisos...</div>
        </div>
      ) : avisos.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No hay avisos en este edificio</p>
            <Button onClick={() => handleOpenModal()}>
              Crear primer aviso
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {avisos.map((aviso) => {
            const prioridad = getPrioridadConfig(aviso.prioridad)
            const estaExpirado = aviso.fecha_expiracion && new Date(aviso.fecha_expiracion) < new Date()

            return (
              <Card key={aviso.id} className={!aviso.activo ? 'opacity-60' : ''}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{prioridad.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-gray-800">
                            {aviso.titulo}
                          </h3>
                          {!aviso.activo && (
                            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                              Inactivo
                            </span>
                          )}
                          {estaExpirado && (
                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                              Expirado
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${prioridad.color}`}>
                            {prioridad.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(aviso.fecha_publicacion), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mt-3 whitespace-pre-wrap">
                      {aviso.contenido}
                    </p>

                    {aviso.fecha_expiracion && (
                      <p className="text-sm text-gray-500 mt-3">
                        Expira: {new Date(aviso.fecha_expiracion).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleToggleActivo(aviso)}
                      title={aviso.activo ? 'Desactivar' : 'Activar'}
                    >
                      {aviso.activo ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleOpenModal(aviso)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(aviso.id, aviso.titulo)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAviso ? 'Editar Aviso' : 'Nuevo Aviso'}
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
              disabled={!!editingAviso}
            >
              <option value="">-- Selecciona --</option>
              {edificios.map((edificio) => (
                <option key={edificio.id} value={edificio.id}>
                  {edificio.nombre}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Título *"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ej: Corte de agua programado"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenido *
            </label>
            <textarea
              value={formData.contenido}
              onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={5}
              placeholder="Escribe el mensaje completo del aviso..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad *
            </label>
            <select
              value={formData.prioridad}
              onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {PRIORIDADES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.icon} {p.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Fecha de Expiración (Opcional)"
            type="date"
            value={formData.fecha_expiracion}
            onChange={(e) => setFormData({ ...formData, fecha_expiracion: e.target.value })}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 Los avisos serán visibles para todos los residentes del edificio en su app.
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
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}