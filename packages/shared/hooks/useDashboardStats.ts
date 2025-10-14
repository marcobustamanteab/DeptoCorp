import { useQuery } from '@tanstack/react-query'
import { supabase } from '@deptocorp/supabase-client'

interface DashboardStats {
  totalEdificios: number
  totalDepartamentos: number
  totalResidentes: number
  totalGastosPendientes: number
  montoGastosPendientes: number
  gastosAtrasados: number
  avisosActivos: number
}

export function useDashboardStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Contar edificios
      const { count: edificios } = await supabase
        .from('edificios')
        .select('*', { count: 'exact', head: true })

      // Contar departamentos
      const { count: departamentos } = await supabase
        .from('departamentos')
        .select('*', { count: 'exact', head: true })

      // Contar residentes
      const { count: residentes } = await supabase
        .from('residentes')
        .select('*', { count: 'exact', head: true })

      // Contar gastos pendientes
      const { count: gastosPendientes, data: gastosPendientesData } = await supabase
        .from('gastos_departamento')
        .select('monto', { count: 'exact' })
        .eq('estado', 'pendiente')

      // Calcular monto total pendiente
      const montoPendiente = gastosPendientesData?.reduce(
        (sum, g) => sum + Number(g.monto), 
        0
      ) || 0

      // Contar gastos atrasados
      const { count: gastosAtrasados } = await supabase
        .from('gastos_departamento')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'atrasado')

      // Contar avisos activos
      const { count: avisosActivos } = await supabase
        .from('avisos')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

      const stats: DashboardStats = {
        totalEdificios: edificios || 0,
        totalDepartamentos: departamentos || 0,
        totalResidentes: residentes || 0,
        totalGastosPendientes: gastosPendientes || 0,
        montoGastosPendientes: montoPendiente,
        gastosAtrasados: gastosAtrasados || 0,
        avisosActivos: avisosActivos || 0,
      }

      return stats
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  })

  return {
    stats: stats || {
      totalEdificios: 0,
      totalDepartamentos: 0,
      totalResidentes: 0,
      totalGastosPendientes: 0,
      montoGastosPendientes: 0,
      gastosAtrasados: 0,
      avisosActivos: 0,
    },
    isLoading,
    error,
  }
}