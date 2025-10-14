/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { FileText, Download, Building2, Users, DollarSign, AlertCircle } from 'lucide-react'
import { useEdificios } from '../../../../packages/shared/hooks/useEdificios'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../../packages/supabase-client/src/client'
import { exportToExcel, exportMultipleSheets } from '../utils/exportExcel'
import toast, { Toaster } from 'react-hot-toast'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function Reportes() {
  const { edificios } = useEdificios()
  const [selectedEdificio, setSelectedEdificio] = useState<string>('')
  const [selectedMes, setSelectedMes] = useState<number>(new Date().getMonth() + 1)
  const [selectedAnio, setSelectedAnio] = useState<number>(new Date().getFullYear())

  // Datos para reportes
  const { data: departamentos } = useQuery({
    queryKey: ['departamentos-reporte', selectedEdificio],
    queryFn: async () => {
      if (!selectedEdificio) return []
      const { data } = await supabase
        .from('departamentos')
        .select(`
          *,
          residentes(*)
        `)
        .eq('edificio_id', selectedEdificio)
      return data || []
    },
    enabled: !!selectedEdificio,
  })

  const { data: gastoComun } = useQuery({
    queryKey: ['gasto-reporte', selectedEdificio, selectedMes, selectedAnio],
    queryFn: async () => {
      if (!selectedEdificio) return null
      const { data } = await supabase
        .from('gastos_comunes')
        .select(`
          *,
          gastos_departamento(
            *,
            departamento:departamentos(numero, piso),
            pagos(*)
          )
        `)
        .eq('edificio_id', selectedEdificio)
        .eq('mes', selectedMes)
        .eq('anio', selectedAnio)
        .single()
      return data
    },
    enabled: !!selectedEdificio,
  })

  // Reporte 1: Estado de Cuenta por Departamento
  const handleExportEstadoCuenta = () => {
    if (!gastoComun) {
      toast.error('No hay datos de gastos para este período')
      return
    }

    const edificio = edificios.find(e => e.id === selectedEdificio)
    const data = gastoComun.gastos_departamento.map((gd: any) => ({
      'Edificio': edificio?.nombre,
      'Departamento': gd.departamento?.numero,
      'Piso': gd.departamento?.piso,
      'Período': `${MESES[selectedMes - 1]} ${selectedAnio}`,
      'Monto': Number(gd.monto),
      'Estado': gd.estado,
      'Fecha Pago': gd.fecha_pago ? new Date(gd.fecha_pago).toLocaleDateString() : 'Pendiente',
      'Método Pago': gd.pagos?.[0]?.metodo_pago || '-',
      'Referencia': gd.pagos?.[0]?.referencia_externa || '-',
    }))

    exportToExcel(
      data,
      `Estado_Cuenta_${edificio?.nombre}_${MESES[selectedMes - 1]}_${selectedAnio}`,
      'Estado de Cuenta'
    )
    toast.success('Reporte exportado exitosamente')
  }

  // Reporte 2: Reporte de Morosidad
  const handleExportMorosidad = () => {
    if (!gastoComun) {
      toast.error('No hay datos de gastos para este período')
      return
    }

    const edificio = edificios.find(e => e.id === selectedEdificio)
    const morosos = gastoComun.gastos_departamento
      .filter((gd: any) => gd.estado === 'atrasado' || gd.estado === 'pendiente')
      .map((gd: any) => ({
        'Edificio': edificio?.nombre,
        'Departamento': gd.departamento?.numero,
        'Piso': gd.departamento?.piso,
        'Período': `${MESES[selectedMes - 1]} ${selectedAnio}`,
        'Monto Adeudado': Number(gd.monto),
        'Estado': gd.estado,
        'Días de Atraso': gd.estado === 'atrasado' ? 
          Math.floor((new Date().getTime() - new Date(gastoComun.fecha_vencimiento).getTime()) / (1000 * 60 * 60 * 24)) : 
          0,
      }))

    if (morosos.length === 0) {
      toast.success('¡No hay morosos en este período!')
      return
    }

    exportToExcel(
      morosos,
      `Morosidad_${edificio?.nombre}_${MESES[selectedMes - 1]}_${selectedAnio}`,
      'Morosidad'
    )
    toast.success(`Reporte de morosidad exportado (${morosos.length} departamentos)`)
  }

  // Reporte 3: Lista de Residentes
  const handleExportResidentes = () => {
    if (!departamentos || departamentos.length === 0) {
      toast.error('No hay residentes registrados')
      return
    }

    const edificio = edificios.find(e => e.id === selectedEdificio)
    const data: any[] = []

    departamentos.forEach((depto: any) => {
      if (depto.residentes && depto.residentes.length > 0) {
        depto.residentes.forEach((residente: any) => {
          data.push({
            'Edificio': edificio?.nombre,
            'Departamento': depto.numero,
            'Piso': depto.piso,
            'Nombre': residente.nombre,
            'Email': residente.email || '-',
            'Teléfono': residente.telefono || '-',
            'RUT': residente.rut || '-',
            'Tipo': residente.es_propietario ? 'Propietario' : 'Arrendatario',
            'Fecha Ingreso': residente.fecha_ingreso ? new Date(residente.fecha_ingreso).toLocaleDateString() : '-',
          })
        })
      }
    })

    if (data.length === 0) {
      toast.error('No hay residentes para exportar')
      return
    }

    exportToExcel(
      data,
      `Residentes_${edificio?.nombre}_${new Date().toISOString().split('T')[0]}`,
      'Residentes'
    )
    toast.success(`Lista de residentes exportada (${data.length} residentes)`)
  }

  // Reporte 4: Reporte Completo del Edificio
  const handleExportReporteCompleto = async () => {
    if (!selectedEdificio) {
      toast.error('Selecciona un edificio')
      return
    }

    const edificio = edificios.find(e => e.id === selectedEdificio)

    // Resumen del edificio
    const resumen = [{
      'Edificio': edificio?.nombre,
      'Dirección': edificio?.direccion,
      'Ciudad': edificio?.ciudad,
      'Total Departamentos': departamentos?.length || 0,
      'Total Residentes': departamentos?.reduce((sum: number, d: any) => sum + (d.residentes?.length || 0), 0) || 0,
    }]

    // Lista de departamentos
    const deptos = departamentos?.map((d: any) => ({
      'Número': d.numero,
      'Piso': d.piso,
      'M²': d.metros_cuadrados,
      '% Gastos': d.porcentaje_gastos,
      'Residentes': d.residentes?.length || 0,
    })) || []

    // Residentes
    const residentes: any[] = []
    departamentos?.forEach((depto: any) => {
      depto.residentes?.forEach((r: any) => {
        residentes.push({
          'Departamento': depto.numero,
          'Nombre': r.nombre,
          'Email': r.email || '-',
          'Teléfono': r.telefono || '-',
          'Tipo': r.es_propietario ? 'Propietario' : 'Arrendatario',
        })
      })
    })

    // Obtener últimos 3 meses de gastos
    const { data: ultimosGastos } = await supabase
      .from('gastos_comunes')
      .select(`
        mes,
        anio,
        monto_total,
        fecha_vencimiento,
        gastos_departamento(estado)
      `)
      .eq('edificio_id', selectedEdificio)
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })
      .limit(3)

    const gastosResumen = ultimosGastos?.map((g: any) => {
      const total = g.gastos_departamento?.length || 0
      const pagados = g.gastos_departamento?.filter((gd: any) => gd.estado === 'pagado').length || 0
      const pendientes = g.gastos_departamento?.filter((gd: any) => gd.estado === 'pendiente').length || 0
      const atrasados = g.gastos_departamento?.filter((gd: any) => gd.estado === 'atrasado').length || 0

      return {
        'Período': `${MESES[g.mes - 1]} ${g.anio}`,
        'Monto Total': g.monto_total,
        'Vencimiento': new Date(g.fecha_vencimiento).toLocaleDateString(),
        'Total Deptos': total,
        'Pagados': pagados,
        'Pendientes': pendientes,
        'Atrasados': atrasados,
        '% Pagado': total > 0 ? Math.round((pagados / total) * 100) : 0,
      }
    }) || []

    exportMultipleSheets(
      [
        { data: resumen, sheetName: 'Resumen' },
        { data: deptos, sheetName: 'Departamentos' },
        { data: residentes, sheetName: 'Residentes' },
        { data: gastosResumen, sheetName: 'Últimos Gastos' },
      ],
      `Reporte_Completo_${edificio?.nombre}_${new Date().toISOString().split('T')[0]}`
    )
    toast.success('Reporte completo exportado exitosamente')
  }

  if (edificios.length === 0) {
    return (
      <div>
        <Toaster position="top-right" />
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Reportes</h1>
        <Card>
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
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
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Reportes y Exportación</h1>
        <p className="text-gray-600 mt-1">Exporta datos a Excel para análisis externos</p>
      </div>

      {/* Selector de Edificio y Período */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edificio *
            </label>
            <select
              value={selectedEdificio}
              onChange={(e) => setSelectedEdificio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Selecciona un edificio --</option>
              {edificios.map((edificio) => (
                <option key={edificio.id} value={edificio.id}>
                  {edificio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mes
            </label>
            <select
              value={selectedMes}
              onChange={(e) => setSelectedMes(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {MESES.map((mes, index) => (
                <option key={index} value={index + 1}>
                  {mes}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año
            </label>
            <select
              value={selectedAnio}
              onChange={(e) => setSelectedAnio(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[2023, 2024, 2025, 2026].map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {!selectedEdificio ? (
        <Card>
          <p className="text-gray-500 text-center py-8">
            Selecciona un edificio para generar reportes
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reporte 1 */}
          <Card>
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="text-blue-600" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  Estado de Cuenta
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Detalle de gastos comunes por departamento para el período seleccionado.
                </p>
                <Button
                  onClick={handleExportEstadoCuenta}
                  disabled={!gastoComun}
                  className="w-full"
                >
                  <Download size={16} className="inline mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </div>
          </Card>

          {/* Reporte 2 */}
          <Card>
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="text-red-600" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  Reporte de Morosidad
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Lista de departamentos con pagos pendientes o atrasados.
                </p>
                <Button
                  onClick={handleExportMorosidad}
                  disabled={!gastoComun}
                  className="w-full"
                >
                  <Download size={16} className="inline mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </div>
          </Card>

          {/* Reporte 3 */}
          <Card>
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="text-green-600" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  Lista de Residentes
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Directorio completo de residentes con datos de contacto.
                </p>
                <Button
                  onClick={handleExportResidentes}
                  disabled={!departamentos || departamentos.length === 0}
                  className="w-full"
                >
                  <Download size={16} className="inline mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </div>
          </Card>

          {/* Reporte 4 */}
          <Card>
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Building2 className="text-purple-600" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  Reporte Completo
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Excel con múltiples hojas: resumen, departamentos, residentes y gastos.
                </p>
                <Button
                  onClick={handleExportReporteCompleto}
                  className="w-full"
                >
                  <Download size={16} className="inline mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}