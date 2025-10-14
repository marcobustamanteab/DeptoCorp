import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@deptocorp/supabase-client'
import toast from 'react-hot-toast'

export function useEspaciosComunes(edificioId?: string) {
  const queryClient = useQueryClient()

  const { data: espacios, isLoading } = useQuery({
    queryKey: ['espacios-comunes', edificioId],
    queryFn: async () => {
      if (!edificioId) return []
      const { data, error } = await supabase
        .from('espacios_comunes')
        .select('*')
        .eq('edificio_id', edificioId)
        .eq('activo', true)
        .order('nombre')
      
      if (error) throw error
      return data
    },
    enabled: !!edificioId,
  })

  const createMutation = useMutation({
    mutationFn: async (espacio: any) => {
      const { data, error } = await supabase
        .from('espacios_comunes')
        .insert(espacio)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['espacios-comunes'] })
      toast.success('Espacio común creado')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear espacio')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...espacio }: any) => {
      const { data, error } = await supabase
        .from('espacios_comunes')
        .update(espacio)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['espacios-comunes'] })
      toast.success('Espacio actualizado')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('espacios_comunes')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['espacios-comunes'] })
      toast.success('Espacio eliminado')
    },
  })

  return {
    espacios: espacios || [],
    isLoading,
    createEspacio: createMutation.mutate,
    updateEspacio: updateMutation.mutate,
    deleteEspacio: deleteMutation.mutate,
    isCreating: createMutation.isPending,
  }
}