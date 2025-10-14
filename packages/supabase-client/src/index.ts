export { supabase } from './client'
export { authService } from './auth'
export {
  edificiosService,
  departamentosService,
  residentesService,
  gastosService,
  avisosService,
} from './database'

export type {
  Edificio,
  Departamento,
  Residente,
  GastoComun,
  GastoDepartamento,
  Pago,
  Aviso,
} from './database'

export type { Database } from './client'