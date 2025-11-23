import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// TypeScript types for the database tables
export interface EnrichedAddress {
  id: number
  house_number?: string
  street?: string
  city?: string
  postcode?: string
  state?: string
  full_address?: string
  latitude?: number
  longitude?: number
  distance_to_fire_miles?: number
  distance_category?: string
}

// Database type definitions for Supabase
export interface Database {
  public: {
    Tables: {
      enriched_addresses: {
        Row: EnrichedAddress
        Insert: Omit<EnrichedAddress, 'id'>
        Update: Partial<Omit<EnrichedAddress, 'id'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
