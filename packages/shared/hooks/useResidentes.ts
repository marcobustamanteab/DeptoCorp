import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { residentesService } from '@deptocorp/supabase-client'
import type { Residente } from '@deptocorp/supabase-client'
import toast from 'react-hot-toast'

export function useResidentes(departamentoId?: string) {
  const queryClient = useQueryClient()

  // Listar residentes por departamento
  const { data: residentes, isLoading, error } = useQuery({
    queryKey: ['residentes', departamentoId],
    queryFn: async () => {
      if (!departamentoId) return []
      const { data, error } = await residentesService.getByDepartamento(departamentoId)
      if (error) throw error
      return data
    },
    enabled: !!departamentoId,
  })

  // Crear residente
  const createMutation = useMutation({
    mutationFn: async (residente: Omit<Residente, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await residentesService.create(residente)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentes'] })
      toast.success('Residente creado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear residente')
    },
  })

  // Actualizar residente
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...residente }: Partial<Residente> & { id: string }) => {
      const { data, error } = await residentesService.update(id, residente)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentes'] })
      toast.success('Residente actualizado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar residente')
    },
  })

  // Eliminar residente
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await residentesService.delete(id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentes'] })
      toast.success('Residente eliminado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar residente')
    },
  })

  return {
    residentes: residentes || [],
    isLoading,
    error,
    createResidente: createMutation.mutate,
    updateResidente: updateMutation.mutate,
    deleteResidente: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}