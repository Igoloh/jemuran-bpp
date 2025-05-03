export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activity_details: {
        Row: {
          id: string
          budget_code_id: string | null
          activity_code: string
          activity_title: string
          details: string | null
          unit: string
          volume_original: number
          volume_revised: number
          value_original: number
          value_revised: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          budget_code_id?: string | null
          activity_code: string
          activity_title: string
          details?: string | null
          unit: string
          volume_original: number
          volume_revised: number
          value_original: number
          value_revised: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          budget_code_id?: string | null
          activity_code?: string
          activity_title?: string
          details?: string | null
          unit?: string
          volume_original?: number
          volume_revised?: number
          value_original?: number
          value_revised?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      activity_logs: {
        Row: {
          id: string
          type: string
          activity_id: string | null
          budget_code_id: string | null
          details: Json
          created_at: string | null
        }
        Insert: {
          id?: string
          type: string
          activity_id?: string | null
          budget_code_id?: string | null
          details: Json
          created_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          activity_id?: string | null
          budget_code_id?: string | null
          details?: Json
          created_at?: string | null
        }
      }
      budget_codes: {
        Row: {
          id: string
          ro_code: string
          ro_title: string
          component_code: string
          component_title: string
          program: string
          quarterly_withdrawal: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          ro_code: string
          ro_title: string
          component_code: string
          component_title: string
          program: string
          quarterly_withdrawal?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          ro_code?: string
          ro_title?: string
          component_code?: string
          component_title?: string
          program?: string
          quarterly_withdrawal?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}