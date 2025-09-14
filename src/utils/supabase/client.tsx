import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

console.log('Supabase client configuration:', {
  url: `https://${projectId}.supabase.co`,
  anonKeyStart: publicAnonKey.substring(0, 20) + '...'
})

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
)

export default supabase