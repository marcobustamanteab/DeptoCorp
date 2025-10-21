// packages/shared/hooks/useNotificaciones.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@deptocorp/supabase-client'
import toast from 'react-hot-toast'
import { useAuth } from './useAuth'

export interface Notificacion {
  id: string
  user_id: string
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  url?: string
  metadata?: Record<string, any>
  created_at: string
}

export function useNotificaciones() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Obtener SOLO las notificaciones del usuario actual
  const { data: notificaciones = [], isLoading } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('user_id', user.id) // ✨ FILTRAR POR USER_ID
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Notificacion[]
    },
    enabled: !!user,
  })

  // Contar notificaciones no leídas DEL USUARIO ACTUAL
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notificaciones-unread-count'],
    queryFn: async () => {
      if (!user?.id) return 0

      const { count, error } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id) // ✨ FILTRAR POR USER_ID
        .eq('leida', false)

      if (error) throw error
      return count || 0
    },
    enabled: !!user,
  })

  // Marcar como leída
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado')
      
      const { data, error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', id)
        .eq('user_id', user.id) // ✨ SEGURIDAD: Solo sus notificaciones
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
      queryClient.invalidateQueries({ queryKey: ['notificaciones-unread-count'] })
    },
  })

  // Marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return

      const { data, error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('user_id', user.id) // ✨ FILTRAR POR USER_ID
        .eq('leida', false)
        .select()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
      queryClient.invalidateQueries({ queryKey: ['notificaciones-unread-count'] })
      toast.success('Todas marcadas como leídas')
    },
  })

  // Eliminar notificación
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado')
      
      const { error } = await supabase
        .from('notificaciones')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // ✨ SEGURIDAD: Solo sus notificaciones

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
      queryClient.invalidateQueries({ queryKey: ['notificaciones-unread-count'] })
      toast.success('Notificación eliminada')
    },
  })

  // Eliminar todas las leídas
  const deleteAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return

      const { error } = await supabase
        .from('notificaciones')
        .delete()
        .eq('user_id', user.id) // ✨ FILTRAR POR USER_ID
        .eq('leida', true)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
      queryClient.invalidateQueries({ queryKey: ['notificaciones-unread-count'] })
      toast.success('Notificaciones eliminadas')
    },
  })

  // Suscripción a cambios en tiempo real (YA estaba bien filtrado)
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('notificaciones-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notificaciones',
          filter: `user_id=eq.${user.id}`, // ✅ Ya estaba filtrado
        },
        (payload) => {
          console.log('📬 Notificación en tiempo real:', payload)

          queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
          queryClient.invalidateQueries({ queryKey: ['notificaciones-unread-count'] })

          // Mostrar toast si es una nueva notificación
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as Notificacion
            toast(newNotif.titulo, {
              icon: getIconForType(newNotif.tipo),
              duration: 4000,
            })
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user?.id, queryClient])

  return {
    notificaciones,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
    deleteAllRead: deleteAllReadMutation.mutate,
  }
}

// Helper para iconos
function getIconForType(tipo: string): string {
  const iconMap: Record<string, string> = {
    reserva_aprobada: '✅',
    reserva_rechazada: '❌',
    reserva_pendiente: '📋',
    pago_confirmado: '✅',
    pago_rechazado: '❌',
    comprobante_pendiente: '💵',
    gasto_generado: '💰',
    aviso_nuevo: '📢',
  }
  return iconMap[tipo] || '🔔'
}