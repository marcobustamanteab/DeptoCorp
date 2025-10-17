import { useQuery } from '@tanstack/react-query'
import { supabase } from '@deptocorp/supabase-client'

interface Aviso {
  id: string
  titulo: string
  contenido: string
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente'
  activo: boolean
  fecha_publicacion: string
  fecha_expiracion: string | null
}

export function useResidentAvisos(edificioId: string | undefined) {
  return useQuery({
    queryKey: ['residentAvisos', edificioId],
    queryFn: async () => {
      if (!edificioId) throw new Error('No edificio ID')

      const { data, error } = await supabase
        .from('avisos')
        .select('*')
        .eq('edificio_id', edificioId)
        .eq('activo', true)
        .order('prioridad', { ascending: false })
        .order('fecha_publicacion', { ascending: false })

      if (error) throw error
      return data as Aviso[]
    },
    enabled: !!edificioId,
    refetchInterval: 30000, // Refetch cada 30 segundos
  })
}