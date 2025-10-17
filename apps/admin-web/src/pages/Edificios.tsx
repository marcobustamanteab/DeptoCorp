/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react'
import { useEdificios } from '../../../../packages/shared/hooks/useEdificios'
import toast, { Toaster } from 'react-hot-toast'

interface EdificioFormData {
  nombre: string
  direccion: string
  ciudad: string
  pais: string
}

export function Edificios() {
  const { 
    edificios, 
    isLoading, 
    createEdificio, 
    updateEdificio, 
    deleteEdificio,
    isCreating,
    isUpdating,
  } = useEdificios()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEdificio, setEditingEdificio] = useState<any>(null)
  const [formData, setFormData] = useState<EdificioFormData>({
    nombre: '',
    direccion: '',
    ciudad: '',
    pais: 'Chile',
  })

  const handleOpenModal = (edificio?: any) => {
    if (edificio) {
      setEditingEdificio(edificio)
      setFormData({
        nombre: edificio.nombre,
        direccion: edificio.direccion || '',
        ciudad: edificio.ciudad || '',
        pais: edificio.pais || 'Chile',
      })
    } else {
      setEditingEdificio(null)
      setFormData({
        nombre: '',
        direccion: '',
        ciudad: '',
        pais: 'Chile',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingEdificio(null)
    setFormData({
      nombre: '',
      direccion: '',
      ciudad: '',
      pais: 'Chile',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    if (editingEdificio) {
      updateEdificio(
        { id: editingEdificio.id, ...formData },
        {
          onSuccess: () => handleCloseModal(),
        }
      )
    } else {
      createEdificio(formData, {
        onSuccess: () => handleCloseModal(),
      })
    }
  }

  const handleDelete = (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el edificio "${nombre}"?`)) {
      deleteEdificio(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando edificios...</div>
      </div>
    )
  }

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Edificios</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} className="inline mr-2" />
          Nuevo Edificio
        </Button>
      </div>

      {edificios.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No hay edificios registrados</p>
            <Button onClick={() => handleOpenModal()}>
              Crear primer edificio
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {edificios.map((edificio: any) => (
            <Card key={edificio.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Building2 className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {edificio.nombre}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {edificio.ciudad}, {edificio.pais}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {edificio.direccion}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleOpenModal(edificio)}
                >
                  <Edit2 size={16} className="inline mr-2" />
                  Editar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(edificio.id, edificio.nombre)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEdificio ? 'Editar Edificio' : 'Nuevo Edificio'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del Edificio *"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Torre Central"
            required
          />

          <Input
            label="Dirección"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            placeholder="Ej: Av. Principal 123"
          />

          <Input
            label="Ciudad"
            value={formData.ciudad}
            onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
            placeholder="Ej: Santiago"
          />

          <Input
            label="País"
            value={formData.pais}
            onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
            placeholder="Ej: Chile"
          />

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