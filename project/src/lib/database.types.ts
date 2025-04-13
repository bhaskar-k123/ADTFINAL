export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          roll_number: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          roll_number: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          roll_number?: string
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          type: 'LECTURE' | 'LAB'
          attendance_threshold: number
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'LECTURE' | 'LAB'
          attendance_threshold?: number
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'LECTURE' | 'LAB'
          attendance_threshold?: number
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      timetable_entries: {
        Row: {
          id: string
          subject_id: string
          day_of_week: number
          start_time: string
          end_time: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          day_of_week: number
          start_time: string
          end_time: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      attendance_records: {
        Row: {
          id: string
          subject_id: string
          date: string
          status: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          date: string
          status: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject_id?: string
          date?: string
          status?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
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
      subject_type: 'LECTURE' | 'LAB'
    }
  }
}