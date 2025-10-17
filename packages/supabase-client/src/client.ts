import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../shared/types/database.types'

const supabaseUrl = 'https://dxaovhalhmqxyhybsskj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4YW92aGFsaG1xeHloeWJzc2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjYxMDgsImV4cCI6MjA3NjI0MjEwOH0.E-F8cyBAo1MPPAcI9PfbqpwIEiBam0Rm2eCZtkSEg8s'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type { Database }