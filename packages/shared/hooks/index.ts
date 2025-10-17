export * from './hooks'
export * from './types/database.types'

// Common hooks or Admin hooks

export { useAuth } from './useAuth'
export { useEdificios } from './useEdificios'
export { useDepartamentos } from './useDepartamentos'
export { useResidentes } from './useResidentes'
export { useGastos } from './useGastos'
export { useDashboardStats } from './useDashboardStats'
export { useRecentActivity } from './useRecentActivity'
export { usePagos } from './usePagos'
export { useAvisos } from './useAvisos'
export { useEspaciosComunes } from './useEspaciosComunes'
export { useReservas } from './useReservas'

// Resident hooks

export { useResidentProfile } from './useResidentProfile'
export { useResidentGastos } from './useResidentGastos'
export { useResidentAvisos } from './useResidentAvisos'
export {
  useResidentEspaciosComunes,
  useResidentReservas,
  useReservasPorEspacio,
  useCreateReserva,
  useCancelReserva
} from './useResidentReservas'