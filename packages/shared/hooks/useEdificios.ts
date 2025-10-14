import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { edificiosService } from '@deptocorp/supabase-client'
import type { Edificio } from '@deptocorp/supabase-client'
import toast from 'react-hot-toast'

export function useEdificios() {
  const queryClient = useQueryClient()

  // Listar edificios
  const { data: edificios, isLoading, error } = useQuery({
    queryKey: ['edificios'],
    queryFn: async () => {
      const { data, error } = await edificiosService.getAll()
      if (error) throw error
      return data
    },
  })

  // Crear edificio
  const createMutation = useMutation({
    mutationFn: async (edificio: Omit<Edificio, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await edificiosService.create(edificio)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edificios'] })
      toast.success('Edificio creado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear edificio')
    },
  })

  // Actualizar edificio
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...edificio }: Partial<Edificio> & { id: string }) => {
      const { data, error } = await edificiosService.update(id, edificio)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edificios'] })
      toast.success('Edificio actualizado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar edificio')
    },
  })

  // Eliminar edificio
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await edificiosService.delete(id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edificios'] })
      toast.success('Edificio eliminado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar edificio')
    },
  })

  return {
    edificios: edificios || [],
    isLoading,
    error,
    createEdificio: createMutation.mutate,
    updateEdificio: updateMutation.mutate,
    deleteEdificio: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}