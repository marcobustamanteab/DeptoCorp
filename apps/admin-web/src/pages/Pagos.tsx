import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../../packages/supabase-client/src/client'
import { DollarSign, FileText, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Pago {
  id: string
  monto: number
  metodo_pago: string
  referencia_externa: string | null
  estado: string
  fecha_pago: string | null
  gasto_departamento?: {
    monto: number
    departamento?: {
      numero: string
      edificio?: {
        nombre: string
      }
    }
    gasto_comun?: {
      mes: number
      anio: number
    }
  }
}

export function Pagos() {
  const [filtroMetodo, setFiltroMetodo] = useState<string>('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')

  const { data: pagos, isLoading } = useQuery({
    queryKey: ['all-pagos', filtroMetodo, filtroEstado],
    queryFn: async () => {
      let query = supabase
        .from('pagos')
        .select(`
          *,
          gasto_departamento:gastos_departamento(
            monto,
            departamento:departamentos(
              numero,
              edificio:edificios(nombre)
            ),
            gasto_comun:gastos_comunes(mes, anio)
          )
        `)
        .order('fecha_pago', { ascending: false })

      if (filtroMetodo) {
        query = query.eq('metodo_pago', filtroMetodo)
      }

      if (filtroEstado) {
        query = query.eq('estado', filtroEstado)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Pago[]
    },
  })

  const totalPagado = pagos?.reduce((sum, p) => sum + Number(p.monto), 0) || 0

  const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Historial de Pagos</h1>
        <p className="text-gray-600 mt-1">Todos los pagos registrados en el sistema</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Pagos</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {pagos?.length || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="text-blue-600" size={28} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Monto Total</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${totalPagado.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="text-green-600" size={28} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Confirmados</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {pagos?.filter(p => p.estado === 'confirmado').length || 0}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="text-purple-600" size={28} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <select
              value={filtroMetodo}
              onChange={(e) => setFiltroMetodo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="cheque">Cheque</option>
              <option value="deposito">Depósito</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="confirmado">Confirmado</option>
              <option value="pendiente">Pendiente</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Pagos */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Cargando pagos...</div>
        </div>
      ) : !pagos || pagos.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No hay pagos registrados</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Edificio / Depto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Período
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Método
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Referencia
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pagos.map((pago: Pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString() : '-'}
                      <br />
                      {pago.fecha_pago && (
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(pago.fecha_pago), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-800">
                        {pago.gasto_departamento?.departamento?.edificio?.nombre || '-'}
                      </div>
                      <div className="text-gray-600">
                        Depto {pago.gasto_departamento?.departamento?.numero || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {pago.gasto_departamento?.gasto_comun?.mes && 
                        `${MESES[pago.gasto_departamento.gasto_comun.mes - 1]} ${pago.gasto_departamento.gasto_comun.anio}`
                      }
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                      ${Number(pago.monto).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                      {pago.metodo_pago || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {pago.referencia_externa || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        pago.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                        pago.estado === 'rechazado' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pago.estado || 'pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}