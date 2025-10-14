import { useQuery } from '@tanstack/react-query'
import { supabase } from '@deptocorp/supabase-client'

export function useRecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      // Obtener gastos comunes recientes
      const { data: gastosRecientes } = await supabase
        .from('gastos_comunes')
        .select(`
          id,
          mes,
          anio,
          monto_total,
          created_at,
          edificio:edificios(nombre)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      // Obtener residentes recientes
      const { data: residentesRecientes } = await supabase
        .from('residentes')
        .select(`
          nombre,
          created_at,
          departamento:departamentos(
            numero,
            edificio:edificios(nombre)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      const activities = [
        ...(gastosRecientes?.map(g => ({
          type: 'gasto',
          description: `Gasto común creado para ${g.edificio?.nombre}`,
          date: g.created_at,
          icon: 'dollar',
        })) || []),
        ...(residentesRecientes?.map(r => ({
          type: 'residente',
          description: `${r.nombre} agregado en ${r.departamento?.edificio?.nombre}`,
          date: r.created_at,
          icon: 'user',
        })) || []),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)

      return activities
    },
  })

  return {
    activities: activities || [],
    isLoading,
  }
}