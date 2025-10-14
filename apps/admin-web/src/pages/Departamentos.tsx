import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Plus, Edit2, Trash2, Home } from 'lucide-react'
import { useEdificios } from '../../../../packages/shared/hooks/useEdificios'
import { useDepartamentos } from '../../../../packages/shared/hooks/useDepartamentos'
import toast, { Toaster } from 'react-hot-toast'

interface DepartamentoFormData {
  edificio_id: string
  numero: string
  piso: number
  metros_cuadrados: number
  porcentaje_gastos: number
}

export function Departamentos() {
  const { edificios } = useEdificios()
  const [selectedEdificio, setSelectedEdificio] = useState<string>('')
  
  const { 
    departamentos, 
    isLoading, 
    createDepartamento, 
    updateDepartamento, 
    deleteDepartamento,
    isCreating,
    isUpdating,
  } = useDepartamentos(selectedEdificio)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDepartamento, setEditingDepartamento] = useState<any>(null)
  const [formData, setFormData] = useState<DepartamentoFormData>({
    edificio_id: '',
    numero: '',
    piso: 1,
    metros_cuadrados: 0,
    porcentaje_gastos: 0,
  })

  const handleOpenModal = (departamento?: any) => {
    if (departamento) {
      setEditingDepartamento(departamento)
      setFormData({
        edificio_id: departamento.edificio_id,
        numero: departamento.numero,
        piso: departamento.piso || 1,
        metros_cuadrados: departamento.metros_cuadrados || 0,
        porcentaje_gastos: departamento.porcentaje_gastos || 0,
      })
    } else {
      setEditingDepartamento(null)
      setFormData({
        edificio_id: selectedEdificio || '',
        numero: '',
        piso: 1,
        metros_cuadrados: 0,
        porcentaje_gastos: 0,
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingDepartamento(null)
    setFormData({
      edificio_id: '',
      numero: '',
      piso: 1,
      metros_cuadrados: 0,
      porcentaje_gastos: 0,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.edificio_id) {
      toast.error('Debes seleccionar un edificio')
      return
    }

    if (!formData.numero.trim()) {
      toast.error('El número de departamento es obligatorio')
      return
    }

    if (editingDepartamento) {
      updateDepartamento(
        { id: editingDepartamento.id, ...formData },
        {
          onSuccess: () => handleCloseModal(),
        }
      )
    } else {
      createDepartamento(formData, {
        onSuccess: () => handleCloseModal(),
      })
    }
  }

  const handleDelete = (id: string, numero: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el departamento "${numero}"?`)) {
      deleteDepartamento(id)
    }
  }

  if (edificios.length === 0) {
    return (
      <div>
        <Toaster position="top-right" />
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Departamentos</h1>
        <Card>
          <div className="text-center py-12">
            <Home size={48} className="mx-auto text-gray-400 mb-4" />
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
        <h1 className="text-3xl font-bold text-gray-800">Departamentos</h1>
        <Button 
          onClick={() => handleOpenModal()}
          disabled={!selectedEdificio}
        >
          <Plus size={20} className="inline mr-2" />
          Nuevo Departamento
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
            Selecciona un edificio para ver sus departamentos
          </p>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Cargando departamentos...</div>
        </div>
      ) : departamentos.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Home size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No hay departamentos en este edificio</p>
            <Button onClick={() => handleOpenModal()}>
              Crear primer departamento
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departamentos.map((depto) => (
            <Card key={depto.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Home className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      Depto {depto.numero}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Piso {depto.piso}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">M² construidos:</span>
                  <span className="font-medium">{depto.metros_cuadrados} m²</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">% Gastos comunes:</span>
                  <span className="font-medium">{depto.porcentaje_gastos}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Residentes:</span>
                  <span className="font-medium">
                    {depto.residentes?.length || 0}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleOpenModal(depto)}
                >
                  <Edit2 size={16} className="inline mr-2" />
                  Editar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(depto.id, depto.numero)}
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
        title={editingDepartamento ? 'Editar Departamento' : 'Nuevo Departamento'}
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
              disabled={!!editingDepartamento}
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
            label="Número/ID del Departamento *"
            value={formData.numero}
            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
            placeholder="Ej: 101, A-2, etc"
            required
          />

          <Input
            label="Piso"
            type="number"
            value={formData.piso}
            onChange={(e) => setFormData({ ...formData, piso: Number(e.target.value) })}
            min="0"
          />

          <Input
            label="Metros Cuadrados"
            type="number"
            step="0.01"
            value={formData.metros_cuadrados}
            onChange={(e) => setFormData({ ...formData, metros_cuadrados: Number(e.target.value) })}
            min="0"
          />

          <Input
            label="Porcentaje Gastos Comunes (%)"
            type="number"
            step="0.01"
            value={formData.porcentaje_gastos}
            onChange={(e) => setFormData({ ...formData, porcentaje_gastos: Number(e.target.value) })}
            min="0"
            max="100"
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