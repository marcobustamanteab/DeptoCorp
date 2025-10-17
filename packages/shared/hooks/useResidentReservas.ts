import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@deptocorp/supabase-client'
import toast from 'react-hot-toast'

interface EspacioComun {
  id: string
  nombre: string
  descripcion: string | null
  capacidad: number | null
  requiere_autorizacion: boolean
  activo: boolean
}

interface Reserva {
  id: string
  espacio_id: string
  departamento_id: string
  fecha_inicio: string
  fecha_fin: string
  estado: 'pendiente' | 'confirmada' | 'cancelada'
  notas: string | null
  espacio: EspacioComun
}

// Hook para obtener espacios comunes (RENOMBRADO para evitar conflicto)
export function useResidentEspaciosComunes(edificioId: string | undefined) {
  return useQuery({
    queryKey: ['residentEspaciosComunes', edificioId],
    queryFn: async () => {
      if (!edificioId) throw new Error('No edificio ID')

      const { data, error } = await supabase
        .from('espacios_comunes')
        .select('*')
        .eq('edificio_id', edificioId)
        .eq('activo', true)
        .order('nombre')

      if (error) throw error
      return data as EspacioComun[]
    },
    enabled: !!edificioId,
  })
}

// Hook para obtener reservas del residente
export function useResidentReservas(departamentoId: string | undefined) {
  return useQuery({
    queryKey: ['residentReservas', departamentoId],
    queryFn: async () => {
      if (!departamentoId) throw new Error('No departamento ID')

      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          espacio:espacios_comunes(*)
        `)
        .eq('departamento_id', departamentoId)
        .order('fecha_inicio', { ascending: false })

      if (error) throw error
      return data as Reserva[]
    },
    enabled: !!departamentoId,
  })
}

// Hook para obtener reservas de un espacio en una fecha
export function useReservasPorEspacio(espacioId: string, fecha: string) {
  return useQuery({
    queryKey: ['reservasEspacio', espacioId, fecha],
    queryFn: async () => {
      const fechaInicio = `${fecha}T00:00:00`
      const fechaFin = `${fecha}T23:59:59`

      const { data, error } = await supabase
        .from('reservas')
        .select('fecha_inicio, fecha_fin, estado')
        .eq('espacio_id', espacioId)
        .gte('fecha_inicio', fechaInicio)
        .lte('fecha_fin', fechaFin)
        .neq('estado', 'cancelada')

      if (error) throw error
      return data
    },
    enabled: !!espacioId && !!fecha,
  })
}

// Hook para crear reserva
export function useCreateReserva() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reserva: {
      edificio_id: string
      espacio_id: string
      departamento_id: string
      fecha_inicio: string
      fecha_fin: string
      notas?: string
    }) => {
      const { data, error } = await supabase
        .from('reservas')
        .insert({
          ...reserva,
          estado: 'confirmada'
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentReservas'] })
      queryClient.invalidateQueries({ queryKey: ['reservasEspacio'] })
      toast.success('Reserva creada exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear reserva')
    }
  })
}

// Hook para cancelar reserva
export function useCancelReserva() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reservaId: string) => {
      const { error } = await supabase
        .from('reservas')
        .update({ estado: 'cancelada' })
        .eq('id', reservaId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentReservas'] })
      toast.success('Reserva cancelada')
    },
    onError: () => {
      toast.error('Error al cancelar reserva')
    }
  })
}