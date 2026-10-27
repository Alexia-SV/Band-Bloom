import { createClient } from '@supabase/supabase-js'

// Misma base de datos y misma cuenta que Mi Semana (https://alexia-sv.github.io/mi-semana/).
// La llave publicable puede ir en el código: cada tabla solo deja ver y cambiar tus propios datos (RLS).
const SUPABASE_URL = 'https://yuusedshkqztfzofcasq.supabase.co'
const SUPABASE_KEY = 'sb_publishable_oo5Z5WAO6dC4uE4LjcXEZA_NtGS3w_o'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
})
