import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gastosService } from '@deptocorp/supabase-client'
import type { GastoComun } from '@deptocorp/supabase-client'
import toast from 'react-hot-toast'

export function useGastos(edificioId?: string) {
  const queryClient = useQueryClient()

  // Listar gastos por edificio
  const { data: gastos, isLoading, error } = useQuery({
    queryKey: ['gastos', edificioId],
    queryFn: async () => {
      if (!edificioId) return []
      const { data, error } = await gastosService.getByEdificio(edificioId)
      if (error) throw error
      return data
    },
    enabled: !!edificioId,
  })

  // Crear gasto común
  const createMutation = useMutation({
    mutationFn: async (gasto: Omit<GastoComun, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await gastosService.create(gasto)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos'] })
      toast.success('Gasto común creado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear gasto común')
    },
  })

  // Actualizar gasto común
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...gasto }: Partial<GastoComun> & { id: string }) => {
      const { data, error } = await gastosService.update(id, gasto)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos'] })
      toast.success('Gasto común actualizado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar gasto común')
    },
  })

  return {
    gastos: gastos || [],
    isLoading,
    error,
    createGasto: createMutation.mutate,
    updateGasto: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}