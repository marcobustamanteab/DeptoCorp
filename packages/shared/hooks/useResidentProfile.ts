import { useQuery } from '@tanstack/react-query'
import { supabase } from '@deptocorp/supabase-client'

interface ResidentProfile {
  id: string
  nombre: string
  email: string | null
  telefono: string | null
  es_propietario: boolean | null
  departamento: {
    id: string
    numero: string
    piso: number | null  
    edificio: {
      id: string
      nombre: string
      direccion: string | null  
    }
  }
}

export function useResidentProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['residentProfile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID')

      const { data, error } = await supabase
        .from('residentes')
        .select(`
          id,
          nombre,
          email,
          telefono,
          es_propietario,
          departamento:departamentos!inner(
            id,
            numero,
            piso,
            edificio:edificios!inner(
              id,
              nombre,
              direccion
            )
          )
        `)
        .eq('user_id', userId)
        .single()

      if (error) throw error
      
      // Validar que exista el departamento
      if (!data || !data.departamento) {
        throw new Error('Residente sin departamento asignado')
      }

      // Transformar la estructura para que sea más fácil de usar
      const profile: ResidentProfile = {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        es_propietario: data.es_propietario,
        departamento: {
          id: data.departamento.id,
          numero: data.departamento.numero,
          piso: data.departamento.piso,
          edificio: {
            id: data.departamento.edificio.id,
            nombre: data.departamento.edificio.nombre,
            direccion: data.departamento.edificio.direccion
          }
        }
      }
      
      return profile
    },
    enabled: !!userId,
  })
}