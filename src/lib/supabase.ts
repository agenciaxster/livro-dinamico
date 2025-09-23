import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://udrtuxppnisvbtuzvujr.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcnR1eHBwbmlzdmJ0dXp2dWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDc1OTUsImV4cCI6MjA3NDEyMzU5NX0.0uafV2-Il96lH4MJgG0hqTPgQBQe2t9ia3jq33h8tKs'

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          phone?: string
          email?: string
          address?: string
          cnpj?: string
          razao_social?: string
          website?: string
          logo_url?: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string
          email?: string
          address?: string
          cnpj?: string
          razao_social?: string
          website?: string
          logo_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string
          address?: string
          cnpj?: string
          razao_social?: string
          website?: string
          logo_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          company_id?: string
          name: string
          email: string
          password_hash: string
          role: 'admin' | 'user' | 'viewer' | 'cliente'
          status: 'active' | 'inactive' | 'pending'
          last_login?: string
          last_password_change: string
          password_expired: boolean
          avatar_url?: string
          phone?: string
          is_master_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id?: string
          name: string
          email: string
          password_hash: string
          role: 'admin' | 'user' | 'viewer' | 'cliente'
          status?: 'active' | 'inactive' | 'pending'
          last_login?: string
          last_password_change?: string
          password_expired?: boolean
          avatar_url?: string
          phone?: string
          is_master_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          email?: string
          password_hash?: string
          role?: 'admin' | 'user' | 'viewer' | 'cliente'
          status?: 'active' | 'inactive' | 'pending'
          last_login?: string
          last_password_change?: string
          password_expired?: boolean
          avatar_url?: string
          phone?: string
          is_master_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          company_id?: string
          name: string
          description?: string
          color: string
          icon?: string
          type: 'income' | 'expense'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id?: string
          name: string
          description?: string
          color: string
          icon?: string
          type: 'income' | 'expense'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string
          color?: string
          icon?: string
          type?: 'income' | 'expense'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          company_id?: string
          name: string
          type: 'checking' | 'savings' | 'credit' | 'investment'
          bank?: string
          account_number?: string
          balance: number
          description?: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id?: string
          name: string
          type: 'checking' | 'savings' | 'credit' | 'investment'
          bank?: string
          account_number?: string
          balance?: number
          description?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          type?: 'checking' | 'savings' | 'credit' | 'investment'
          bank?: string
          account_number?: string
          balance?: number
          description?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      entries: {
        Row: {
          id: string
          company_id?: string
          account_id?: string
          category_id?: string
          user_id?: string
          description: string
          amount: number
          entry_date: string
          reference_number?: string
          notes?: string
          tags?: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id?: string
          account_id?: string
          category_id?: string
          user_id?: string
          description: string
          amount: number
          entry_date: string
          reference_number?: string
          notes?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          account_id?: string
          category_id?: string
          user_id?: string
          description?: string
          amount?: number
          entry_date?: string
          reference_number?: string
          notes?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          company_id?: string
          account_id?: string
          category_id?: string
          user_id?: string
          description: string
          amount: number
          expense_date: string
          reference_number?: string
          notes?: string
          tags?: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id?: string
          account_id?: string
          category_id?: string
          user_id?: string
          description: string
          amount: number
          expense_date: string
          reference_number?: string
          notes?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          account_id?: string
          category_id?: string
          user_id?: string
          description?: string
          amount?: number
          expense_date?: string
          reference_number?: string
          notes?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      generated_reports: {
        Row: {
          id: string
          company_id?: string
          user_id?: string
          title: string
          type: 'financial' | 'entries' | 'expenses' | 'accounts' | 'categories'
          file_name?: string
          file_url?: string
          filters?: Record<string, unknown>
          generated_at: string
          expires_at?: string
        }
        Insert: {
          id?: string
          company_id?: string
          user_id?: string
          title: string
          type: 'financial' | 'entries' | 'expenses' | 'accounts' | 'categories'
          file_name?: string
          file_url?: string
          filters?: Record<string, unknown>
           generated_at?: string
           expires_at?: string
         }
         Update: {
           id?: string
           company_id?: string
           user_id?: string
           title?: string
           type?: 'financial' | 'entries' | 'expenses' | 'accounts' | 'categories'
           file_name?: string
           file_url?: string
           filters?: Record<string, unknown>
          generated_at?: string
          expires_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          company_id?: string
          setting_key: string
          setting_value: unknown
          description?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id?: string
          setting_key: string
          setting_value: unknown
           description?: string
           created_at?: string
           updated_at?: string
         }
         Update: {
           id?: string
           company_id?: string
           setting_key?: string
           setting_value?: unknown
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          company_id?: string
          user_id?: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_values?: Record<string, unknown>
          new_values?: Record<string, unknown>
          ip_address?: string
          user_agent?: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string
          user_id?: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_values?: Record<string, unknown>
           new_values?: Record<string, unknown>
           ip_address?: string
           user_agent?: string
           created_at?: string
         }
         Update: {
           id?: string
           company_id?: string
           user_id?: string
           table_name?: string
           record_id?: string
           action?: 'INSERT' | 'UPDATE' | 'DELETE'
           old_values?: Record<string, unknown>
           new_values?: Record<string, unknown>
          ip_address?: string
          user_agent?: string
          created_at?: string
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
  }
}

// Funções auxiliares para autenticação
export const auth = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Funções auxiliares para operações no banco
export const db = {
  // Usuários
  getUsers: async (companyId?: string) => {
    let query = supabase.from('users').select('*')
    if (companyId) {
      query = query.eq('company_id', companyId)
    }
    return await query
  },

  // Categorias
  getCategories: async (companyId: string, type?: 'income' | 'expense') => {
    let query = supabase.from('categories').select('*').eq('company_id', companyId)
    if (type) {
      query = query.eq('type', type)
    }
    return await query
  },

  // Contas
  getAccounts: async (companyId: string) => {
    return await supabase.from('accounts').select('*').eq('company_id', companyId)
  },

  // Entradas
  getEntries: async (companyId: string) => {
    return await supabase.from('entries').select(`
      *,
      category:categories(*),
      account:accounts(*),
      user:users(*)
    `).eq('company_id', companyId)
  },

  // Despesas
  getExpenses: async (companyId: string) => {
    return await supabase.from('expenses').select(`
      *,
      category:categories(*),
      account:accounts(*),
      user:users(*)
    `).eq('company_id', companyId)
  },

  // Configurações
  getSettings: async (companyId: string) => {
    return await supabase.from('system_settings').select('*').eq('company_id', companyId)
  },

  // Empresa
  getCompany: async (companyId: string) => {
    return await supabase.from('companies').select('*').eq('id', companyId).single()
  }
}

export default supabase