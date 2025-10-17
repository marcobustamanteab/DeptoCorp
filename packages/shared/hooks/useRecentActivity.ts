import { useQuery } from '@tanstack/react-query'
import { supabase } from '@deptocorp/supabase-client'

interface Activity {
  type: string
  description: string
  date: string | null
  icon: string
}

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

      const allActivities: Activity[] = [
        ...(gastosRecientes?.map(g => ({
          type: 'gasto',
          description: `Gasto común creado para ${g.edificio?.nombre || 'edificio'}`,
          date: g.created_at,
          icon: 'dollar',
        })) || []),
        ...(residentesRecientes?.map(r => ({
          type: 'residente',
          description: `${r.nombre} agregado en ${r.departamento?.edificio?.nombre || 'edificio'}`,
          date: r.created_at,
          icon: 'user',
        })) || []),
      ]
        .sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0
          const dateB = b.date ? new Date(b.date).getTime() : 0
          return dateB - dateA
        })
        .slice(0, 5)

      return allActivities
    },
  })

  return {
    activities: activities || [],
    isLoading,
  }
}