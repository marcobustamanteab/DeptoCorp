import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@deptocorp/supabase-client'
import toast from 'react-hot-toast'

// Hook para subir comprobante
export function useSubirComprobante() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      gastoDeptoId,
      archivo,
      metodo_pago,
      referencia_externa,
      notas
    }: {
      gastoDeptoId: string
      archivo: File
      metodo_pago: string
      referencia_externa?: string
      notas?: string
    }) => {
      // 1. Obtener info del gasto departamento
      const { data: gastoDepto, error: gastoError } = await supabase
        .from('gastos_departamento')
        .select('monto')
        .eq('id', gastoDeptoId)
        .single()

      if (gastoError) throw new Error('Error al obtener información del gasto')

      // 2. Generar nombre único para el archivo
      const timestamp = Date.now()
      const extension = archivo.name.split('.').pop()
      const nombreArchivo = `${gastoDeptoId}_${timestamp}.${extension}`

      // 3. Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(nombreArchivo, archivo, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error('Error al subir el archivo: ' + uploadError.message)
      }

      // 4. Obtener URL pública del archivo
      const { data: urlData } = supabase.storage
        .from('comprobantes')
        .getPublicUrl(nombreArchivo)

      // 5. Crear registro de pago en la tabla pagos
      const { data: pagoData, error: pagoError } = await supabase
        .from('pagos')
        .insert({
          gasto_departamento_id: gastoDeptoId,
          monto: gastoDepto.monto,
          metodo_pago,
          referencia_externa,
          comprobante_url: urlData.publicUrl,
          estado: 'pendiente', // Admin debe confirmar
          notas
        })
        .select()
        .single()

      if (pagoError) {
        // Si falla la creación del pago, eliminar el archivo subido
        await supabase.storage.from('comprobantes').remove([nombreArchivo])
        throw new Error('Error al registrar el pago: ' + pagoError.message)
      }

      return { pago: pagoData, url: urlData.publicUrl, gastoDeptoId }
    },
    onSuccess: (data) => {
      // CORRECCIÓN: Invalidar múltiples queries para que se actualice la UI
      queryClient.invalidateQueries({ queryKey: ['residentGastos'] })
      queryClient.invalidateQueries({ queryKey: ['comprobantes', data.gastoDeptoId] })
      queryClient.invalidateQueries({ queryKey: ['comprobantes'] }) // Query genérica
      
      toast.success('Comprobante subido exitosamente. Pendiente de confirmación.')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al subir comprobante')
    }
  })
}

// Hook para obtener pagos/comprobantes de un gasto
export function useComprobantesGasto(gastoDeptoId: string | undefined) {
  return useQuery({
    queryKey: ['comprobantes', gastoDeptoId],
    queryFn: async () => {
      if (!gastoDeptoId) return []

      const { data, error } = await supabase
        .from('pagos')
        .select('*')
        .eq('gasto_departamento_id', gastoDeptoId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!gastoDeptoId,
    // IMPORTANTE: Refrescar cada 3 segundos mientras esté activo
    refetchInterval: 3000,
  })
}