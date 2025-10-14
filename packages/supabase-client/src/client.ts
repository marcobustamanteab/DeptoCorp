import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../shared/types/database.types'

// @ts-ignore - import.meta es válido en Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export type { Database }