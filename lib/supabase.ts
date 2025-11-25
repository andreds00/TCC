import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import supabaseConfig from '@/constants/supabaseConfig'

const supabaseUrl = supabaseConfig.supabaseUrl;
const supabaseAnonKey = supabaseConfig.supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

