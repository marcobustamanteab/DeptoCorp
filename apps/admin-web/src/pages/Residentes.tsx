/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Plus, Edit2, Trash2, Users, User, Crown } from 'lucide-react'
import { useEdificios } from '../../../../packages/shared/hooks/useEdificios'
import { useDepartamentos } from '../../../../packages/shared/hooks/useDepartamentos'
import { useResidentes } from '../../../../packages/shared/hooks/useResidentes'
import { Toaster } from 'react-hot-toast'
import { showDeleteConfirm, showWarning, showLoading, closeLoading, showError, showSuccess } from '../utils/alerts'

interface ResidenteFormData {
  departamento_id: string
  nombre: string
  email: string
  telefono: string
  rut: string
  es_propietario: boolean
  fecha_ingreso: string
}

export function Residentes() {
  const { edificios } = useEdificios()
  const [selectedEdificio, setSelectedEdificio] = useState('')
  const [selectedDepartamento, setSelectedDepartamento] = useState('')
  
  const { departamentos } = useDepartamentos(selectedEdificio)
  const { 
    residentes, 
    isLoading, 
    createResidente, 
    updateResidente, 
    deleteResidente,
    isCreating,
    isUpdating,
  } = useResidentes(selectedDepartamento)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingResidente, setEditingResidente] = useState<any>(null)
  const [formData, setFormData] = useState<ResidenteFormData>({
    departamento_id: '',
    nombre: '',
    email: '',
    telefono: '',
    rut: '',
    es_propietario: false,
    fecha_ingreso: new Date().toISOString().split('T')[0],
  })

  const handleOpenModal = (residente?: any) => {
    if (residente) {
      setEditingResidente(residente)
      setFormData({
        departamento_id: residente.departamento_id,
        nombre: residente.nombre,
        email: residente.email || '',
        telefono: residente.telefono || '',
        rut: residente.rut || '',
        es_propietario: residente.es_propietario || false,
        fecha_ingreso: residente.fecha_ingreso || new Date().toISOString().split('T')[0],
      })
    } else {
      setEditingResidente(null)
      setFormData({
        departamento_id: selectedDepartamento || '',
        nombre: '',
        email: '',
        telefono: '',
        rut: '',
        es_propietario: false,
        fecha_ingreso: new Date().toISOString().split('T')[0],
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingResidente(null)
    setFormData({
      departamento_id: '',
      nombre: '',
      email: '',
      telefono: '',
      rut: '',
      es_propietario: false,
      fecha_ingreso: new Date().toISOString().split('T')[0],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones con SweetAlert2
    if (!formData.departamento_id) {
      showWarning('Debes seleccionar un departamento')
      return
    }

    if (!formData.nombre.trim()) {
      showWarning('El nombre del residente es obligatorio')
      return
    }

    // Validar formato de email si se proporciona
    if (formData.email && !formData.email.includes('@')) {
      showWarning('El email no tiene un formato válido')
      return
    }

    // Validar RUT chileno básico (opcional)
    if (formData.rut) {
      const rutClean = formData.rut.replace(/\./g, '').replace(/-/g, '')
      if (rutClean.length < 8 || rutClean.length > 9) {
        showWarning('El RUT no tiene un formato válido. Ejemplo: 12.345.678-9')
        return
      }
    }

    const dataToSubmit = {
      ...formData,
      user_id: null, // Por ahora null, vincularemos con auth después
      email: formData.email || null,
      telefono: formData.telefono || null,
      rut: formData.rut || null,
    }

    try {
      showLoading(editingResidente ? 'Actualizando residente...' : 'Creando residente...')

      if (editingResidente) {
        updateResidente(
          { id: editingResidente.id, ...dataToSubmit },
          {
            onSuccess: () => {
              closeLoading()
              showSuccess('Residente actualizado correctamente')
              handleCloseModal()
            },
            onError: () => {
              closeLoading()
              showError('No se pudo actualizar el residente')
            }
          }
        )
      } else {
        createResidente(dataToSubmit, {
          onSuccess: () => {
            closeLoading()
            showSuccess('Residente creado correctamente')
            handleCloseModal()
          },
          onError: () => {
            closeLoading()
            showError('No se pudo crear el residente')
          }
        })
      }
    } catch (error) {
      console.log(error)
      closeLoading()
      showError('Ocurrió un error inesperado')
    }
  }

  const handleDelete = async (id: string, nombre: string) => {
    // Confirmación con SweetAlert2
    const confirmed = await showDeleteConfirm(nombre)
    
    if (!confirmed) return

    try {
      showLoading('Eliminando residente...')
      
      deleteResidente(id, {
        onSuccess: () => {
          closeLoading()
          showSuccess('Residente eliminado correctamente')
        },
        onError: () => {
          closeLoading()
          showError('No se pudo eliminar el residente')
        }
      })
    } catch (error) {
      console.log(error)
      closeLoading()
      showError('Ocurrió un error inesperado')
    }
  }

  if (edificios.length === 0) {
    return (
      <div>
        <Toaster position="top-right" />
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Residentes</h1>
        <Card>
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
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
        <h1 className="text-3xl font-bold text-gray-800">Residentes</h1>
        <Button 
          onClick={() => handleOpenModal()}
          disabled={!selectedDepartamento}
        >
          <Plus size={20} className="inline mr-2" />
          Nuevo Residente
        </Button>
      </div>

      {/* Selectores */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Edificio
            </label>
            <select
              value={selectedEdificio}
              onChange={(e) => {
                setSelectedEdificio(e.target.value)
                setSelectedDepartamento('')
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Selecciona un edificio --</option>
              {edificios.map((edificio: any) => (
                <option key={edificio.id} value={edificio.id}>
                  {edificio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Departamento
            </label>
            <select
              value={selectedDepartamento}
              onChange={(e) => setSelectedDepartamento(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!selectedEdificio}
            >
              <option value="">-- Selecciona un departamento --</option>
              {departamentos.map((depto: any) => (
                <option key={depto.id} value={depto.id}>
                  Depto {depto.numero}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {!selectedEdificio || !selectedDepartamento ? (
        <Card>
          <p className="text-gray-500 text-center py-8">
            Selecciona un edificio y departamento para ver sus residentes
          </p>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Cargando residentes...</div>
        </div>
      ) : residentes.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No hay residentes en este departamento</p>
            <Button onClick={() => handleOpenModal()}>
              Agregar primer residente
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {residentes.map((residente: any) => (
            <Card key={residente.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`${residente.es_propietario ? 'bg-purple-100' : 'bg-blue-100'} p-3 rounded-lg`}>
                    {residente.es_propietario ? (
                      <Crown className={`${residente.es_propietario ? 'text-purple-600' : 'text-blue-600'}`} size={24} />
                    ) : (
                      <User className="text-blue-600" size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {residente.nombre}
                    </h3>
                    <p className={`text-xs ${residente.es_propietario ? 'text-purple-600' : 'text-blue-600'} font-medium`}>
                      {residente.es_propietario ? 'Propietario' : 'Arrendatario'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                {residente.email && (
                  <p className="text-gray-600">
                    <span className="font-medium">📧</span> {residente.email}
                  </p>
                )}
                {residente.telefono && (
                  <p className="text-gray-600">
                    <span className="font-medium">📱</span> {residente.telefono}
                  </p>
                )}
                {residente.rut && (
                  <p className="text-gray-600">
                    <span className="font-medium">🆔</span> {residente.rut}
                  </p>
                )}
                {residente.fecha_ingreso && (
                  <p className="text-gray-600">
                    <span className="font-medium">📅</span> {new Date(residente.fecha_ingreso).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleOpenModal(residente)}
                >
                  <Edit2 size={16} className="inline mr-2" />
                  Editar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(residente.id, residente.nombre)}
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
        title={editingResidente ? 'Editar Residente' : 'Nuevo Residente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departamento *
            </label>
            <select
              value={formData.departamento_id}
              onChange={(e) => setFormData({ ...formData, departamento_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!!editingResidente}
            >
              <option value="">-- Selecciona --</option>
              {departamentos.map((depto: any) => (
                <option key={depto.id} value={depto.id}>
                  Depto {depto.numero}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Nombre Completo *"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Juan Pérez"
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="juan@email.com"
          />

          <Input
            label="Teléfono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            placeholder="+56 9 1234 5678"
          />

          <Input
            label="RUT"
            value={formData.rut}
            onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
            placeholder="12.345.678-9"
          />

          <Input
            label="Fecha de Ingreso"
            type="date"
            value={formData.fecha_ingreso}
            onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="es_propietario"
              checked={formData.es_propietario}
              onChange={(e) => setFormData({ ...formData, es_propietario: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="es_propietario" className="text-sm font-medium text-gray-700">
              Es propietario
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            💡 Los propietarios tienen permisos especiales en el sistema
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