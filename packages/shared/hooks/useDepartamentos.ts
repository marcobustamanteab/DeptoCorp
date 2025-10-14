import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { departamentosService } from '@deptocorp/supabase-client'
import type { Departamento } from '@deptocorp/supabase-client'
import toast from 'react-hot-toast'

export function useDepartamentos(edificioId?: string) {
  const queryClient = useQueryClient()

  // Listar departamentos por edificio
  const { data: departamentos, isLoading, error } = useQuery({
    queryKey: ['departamentos', edificioId],
    queryFn: async () => {
      if (!edificioId) return []
      const { data, error } = await departamentosService.getByEdificio(edificioId)
      if (error) throw error
      return data
    },
    enabled: !!edificioId,
  })

  // Crear departamento
  const createMutation = useMutation({
    mutationFn: async (departamento: Omit<Departamento, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await departamentosService.create(departamento)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] })
      toast.success('Departamento creado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear departamento')
    },
  })

  // Actualizar departamento
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...departamento }: Partial<Departamento> & { id: string }) => {
      const { data, error } = await departamentosService.update(id, departamento)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] })
      toast.success('Departamento actualizado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar departamento')
    },
  })

  // Eliminar departamento
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await departamentosService.delete(id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] })
      toast.success('Departamento eliminado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar departamento')
    },
  })

  return {
    departamentos: departamentos || [],
    isLoading,
    error,
    createDepartamento: createMutation.mutate,
    updateDepartamento: updateMutation.mutate,
    deleteDepartamento: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}