import { Card } from '../components/ui/Card'
import { Plus } from 'lucide-react'

export function Gastos() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gastos Comunes</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} />
          Nuevo Gasto
        </button>
      </div>

      <Card>
        <p className="text-gray-500">No hay gastos comunes registrados</p>
      </Card>
    </div>
  )
}