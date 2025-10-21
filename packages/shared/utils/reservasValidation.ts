import { supabase } from '@deptocorp/supabase-client'

/**
 * Verifica si un espacio está disponible en el rango de fechas dado
 * @returns { available: boolean, conflictingReservas: array }
 */
export async function verificarDisponibilidadEspacio(
  espacioId: string,
  fechaInicio: string, // ISO string
  fechaFin: string,     // ISO string
  reservaIdExcluir?: string // Para ediciones
) {
  // Buscar reservas que se solapen con el rango solicitado
  let query = supabase
    .from('reservas')
    .select(`
      id,
      fecha_inicio,
      fecha_fin,
      estado,
      departamento:departamentos(numero)
    `)
    .eq('espacio_id', espacioId)
    .neq('estado', 'cancelada') // No contar reservas canceladas
    .or(`and(fecha_inicio.lte.${fechaFin},fecha_fin.gte.${fechaInicio})`)

  // Si estamos editando, excluir la reserva actual
  if (reservaIdExcluir) {
    query = query.neq('id', reservaIdExcluir)
  }

  const { data: reservasConflicto, error } = await query

  if (error) {
    console.error('Error verificando disponibilidad:', error)
    return { available: false, conflictingReservas: [], error }
  }

  return {
    available: !reservasConflicto || reservasConflicto.length === 0,
    conflictingReservas: reservasConflicto || []
  }
}

/**
 * Formatea un mensaje de error amigable para el usuario
 */
export function formatearMensajeConflicto(reservas: any[]): string {
  if (reservas.length === 0) return ''
  
  if (reservas.length === 1) {
    const r = reservas[0]
    const inicio = new Date(r.fecha_inicio).toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    const fin = new Date(r.fecha_fin).toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    return `Ya existe una reserva de ${inicio} a ${fin} (Depto ${r.departamento?.numero || 'N/A'})`
  }
  
  return `Hay ${reservas.length} reservas en ese horario. Por favor elige otro.`
}