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

  // Obtener todas las notificaciones
  const { data: notificaciones = [], isLoading } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Notificacion[]
    },
    enabled: !!user,
  })

  // Contar notificaciones no leídas
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notificaciones-unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('leida', false)

      if (error) throw error
      return count || 0
    },
    enabled: !!user,
  })

  // Marcar como leída
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', id)
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
      const { data, error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
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
      const { error } = await supabase
        .from('notificaciones')
        .delete()
        .eq('id', id)

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
      const { error } = await supabase
        .from('notificaciones')
        .delete()
        .eq('leida', true)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
      queryClient.invalidateQueries({ queryKey: ['notificaciones-unread-count'] })
      toast.success('Notificaciones eliminadas')
    },
  })

  // Suscripción a cambios en tiempo real
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
          filter: `user_id=eq.${user.id}`,
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