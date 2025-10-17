import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { avisosService } from '@deptocorp/supabase-client'
import type { Aviso } from '@deptocorp/supabase-client'
import { supabase } from '@deptocorp/supabase-client'
import toast from 'react-hot-toast'

export function useAvisos(edificioId?: string) {
  const queryClient = useQueryClient()

  // Listar avisos por edificio
  const { data: avisos, isLoading, error } = useQuery({
    queryKey: ['avisos', edificioId],
    queryFn: async () => {
      if (!edificioId) return []
      const { data, error } = await avisosService.getByEdificio(edificioId)
      if (error) throw error
      return data
    },
    enabled: !!edificioId,
  })

  // Crear aviso
  const createMutation = useMutation({
    mutationFn: async (aviso: Omit<Aviso, 'id' | 'created_at'> & { created_by?: string }) => {
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await avisosService.create({
        ...aviso,
        created_by: aviso.created_by || user?.id || null,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avisos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Aviso creado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear aviso')
    },
  })

  // Actualizar aviso
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...aviso }: Partial<Aviso> & { id: string }) => {
      const { data, error } = await avisosService.update(id, aviso)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avisos'] })
      toast.success('Aviso actualizado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar aviso')
    },
  })

  // Eliminar aviso
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await avisosService.delete(id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avisos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Aviso eliminado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar aviso')
    },
  })

  // Desactivar aviso
  const desactivarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await avisosService.update(id, { activo: false })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avisos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Aviso desactivado')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al desactivar aviso')
    },
  })

  return {
    avisos: avisos || [],
    isLoading,
    error,
    createAviso: createMutation.mutate,
    updateAviso: updateMutation.mutate,
    deleteAviso: deleteMutation.mutate,
    desactivarAviso: desactivarMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}