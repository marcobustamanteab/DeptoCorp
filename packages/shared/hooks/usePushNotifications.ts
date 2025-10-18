import { useState, useEffect } from 'react'
import { supabase } from '@deptocorp/supabase-client'
import toast from 'react-hot-toast'

// Clave pública VAPID (debes generarla)
// Genera con: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = 'REEMPLAZAR_CON_TU_CLAVE_PUBLICA_VAPID'

interface PushSubscription {
  endpoint: string
  p256dh: string
  auth: string
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  // Verificar soporte del navegador
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window

      setIsSupported(supported)
      
      if (supported) {
        setPermission(Notification.permission)
        await checkSubscription()
      }
      
      setIsLoading(false)
    }

    checkSupport()
  }, [])

  // Verificar si ya está suscrito
  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
      return !!subscription
    } catch (error) {
      console.error('Error verificando suscripción:', error)
      return false
    }
  }

  // Convertir Uint8Array a base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    bytes.forEach((byte) => binary += String.fromCharCode(byte))
    return btoa(binary)
  }

  // URL-safe base64
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Suscribirse a notificaciones push
  const subscribe = async (departamentoId?: string) => {
    if (!isSupported) {
      toast.error('Tu navegador no soporta notificaciones push')
      return false
    }

    setIsLoading(true)

    try {
      // Solicitar permisos
      const permissionResult = await Notification.requestPermission()
      setPermission(permissionResult)

      if (permissionResult !== 'granted') {
        toast.error('Permisos de notificación denegados')
        setIsLoading(false)
        return false
      }

      // Registrar Service Worker
      const registration = await navigator.serviceWorker.register('/service-worker.js')
      await navigator.serviceWorker.ready

      // Suscribirse a Push Manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      // Extraer datos de la suscripción
      const subscriptionData: PushSubscription = {
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!)
      }

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Guardar en base de datos
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          departamento_id: departamentoId || null,
          endpoint: subscriptionData.endpoint,
          p256dh: subscriptionData.p256dh,
          auth: subscriptionData.auth,
          user_agent: navigator.userAgent,
          device_name: getDeviceName(),
          is_active: true
        }, {
          onConflict: 'endpoint'
        })

      if (error) throw error

      setIsSubscribed(true)
      toast.success('¡Notificaciones activadas! 🔔')
      return true

    } catch (error) {
      console.error('Error suscribiendo a push:', error)
      toast.error('Error al activar notificaciones')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Desuscribirse de notificaciones
  const unsubscribe = async () => {
    setIsLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // Eliminar de base de datos
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint)

        if (error) throw error
      }

      setIsSubscribed(false)
      toast.success('Notificaciones desactivadas')
      return true

    } catch (error) {
      console.error('Error desuscribiendo:', error)
      toast.error('Error al desactivar notificaciones')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Detectar nombre del dispositivo
  const getDeviceName = () => {
    const ua = navigator.userAgent
    if (/mobile/i.test(ua)) return 'Móvil'
    if (/tablet/i.test(ua)) return 'Tablet'
    return 'Escritorio'
  }

  // Enviar notificación de prueba
  const testNotification = async () => {
    if (permission !== 'granted') {
      toast.error('Debes activar las notificaciones primero')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification('🏢 DeptoCorpApp', {
        body: '¡Las notificaciones están funcionando correctamente!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [200, 100, 200],
        tag: 'test-notification'
      })
    } catch (error) {
      console.error('Error enviando notificación de prueba:', error)
      toast.error('Error al enviar notificación de prueba')
    }
  }

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    testNotification,
    checkSubscription
  }
}