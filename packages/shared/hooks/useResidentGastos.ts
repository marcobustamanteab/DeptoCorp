import { useQuery } from '@tanstack/react-query'
import { supabase } from '@deptocorp/supabase-client'

interface GastoResidente {
  id: string
  mes: number
  anio: number
  monto: number
  estado: 'pendiente' | 'pagado' | 'atrasado'
  fecha_vencimiento: string
  fecha_pago: string | null
  gasto_comun: {
    monto_total: number
    notas: string | null
  }
  pagos: Array<{
    id: string
    monto: number
    metodo_pago: string
    fecha_pago: string
    referencia_externa: string | null
  }>
}

export function useResidentGastos(departamentoId: string | undefined) {
  return useQuery({
    queryKey: ['residentGastos', departamentoId],
    queryFn: async () => {
      if (!departamentoId) throw new Error('No departamento ID')

      const { data, error } = await supabase
        .from('gastos_departamento')
        .select(`
          id,
          monto,
          estado,
          fecha_pago,
          gasto_comun:gastos_comunes!inner(
            mes,
            anio,
            monto_total,
            fecha_vencimiento,
            notas
          ),
          pagos(
            id,
            monto,
            metodo_pago,
            fecha_pago,
            referencia_externa
          )
        `)
        .eq('departamento_id', departamentoId)
        .order('gasto_comun(anio)', { ascending: false })
        .order('gasto_comun(mes)', { ascending: false })

      if (error) throw error

      // Transformar datos
      const gastos: GastoResidente[] = data.map((item: any) => ({
        id: item.id,
        mes: item.gasto_comun.mes,
        anio: item.gasto_comun.anio,
        monto: item.monto,
        estado: item.estado,
        fecha_vencimiento: item.gasto_comun.fecha_vencimiento,
        fecha_pago: item.fecha_pago,
        gasto_comun: {
          monto_total: item.gasto_comun.monto_total,
          notas: item.gasto_comun.notas
        },
        pagos: item.pagos || []
      }))

      return gastos
    },
    enabled: !!departamentoId,
  })
}