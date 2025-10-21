import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@deptocorp/supabase-client'
import toast from 'react-hot-toast'
import { verificarDisponibilidadEspacio, formatearMensajeConflicto } from '../utils/reservasValidation'

export function useReservas(edificioId?: string) {
  const queryClient = useQueryClient()

  const { data: reservas, isLoading } = useQuery({
    queryKey: ['reservas', edificioId],
    queryFn: async () => {
      if (!edificioId) return []
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          espacio:espacios_comunes(nombre),
          departamento:departamentos(numero)
        `)
        .eq('edificio_id', edificioId)
        .gte('fecha_inicio', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 30 días
        .order('fecha_inicio', { ascending: true })
      
      if (error) throw error
      return data
    },
    enabled: !!edificioId,
  })

  const createMutation = useMutation({
    mutationFn: async (reserva: any) => {
      // 1. VALIDAR DISPONIBILIDAD
      const { available, conflictingReservas, error: validationError } = 
        await verificarDisponibilidadEspacio(
          reserva.espacio_id,
          reserva.fecha_inicio,
          reserva.fecha_fin
        )

      if (validationError) {
        throw new Error('Error al verificar disponibilidad')
      }

      if (!available) {
        const mensaje = formatearMensajeConflicto(conflictingReservas)
        throw new Error(mensaje)
      }

      // 2. CREAR RESERVA
      const { data, error } = await supabase
        .from('reservas')
        .insert(reserva)
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success('Reserva creada exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear reserva')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...reserva }: any) => {
      // Si está cambiando fechas, validar disponibilidad
      if (reserva.fecha_inicio && reserva.fecha_fin && reserva.espacio_id) {
        const { available, conflictingReservas, error: validationError } = 
          await verificarDisponibilidadEspacio(
            reserva.espacio_id,
            reserva.fecha_inicio,
            reserva.fecha_fin,
            id // Excluir la reserva actual
          )

        if (validationError) {
          throw new Error('Error al verificar disponibilidad')
        }

        if (!available) {
          const mensaje = formatearMensajeConflicto(conflictingReservas)
          throw new Error(mensaje)
        }
      }

      const { data, error } = await supabase
        .from('reservas')
        .update(reserva)
        .eq('id', id)
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success('Reserva actualizada')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reservas')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success('Reserva cancelada')
    },
  })

  return {
    reservas: reservas || [],
    isLoading,
    createReserva: createMutation.mutate,
    updateReserva: updateMutation.mutate,
    deleteReserva: deleteMutation.mutate,
    isCreating: createMutation.isPending,
  }
}