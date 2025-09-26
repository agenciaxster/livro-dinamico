import { supabase } from '../integrations/supabase/client'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'viewer' | 'cliente'
  status: 'active' | 'inactive' | 'pending'
  companyId?: string
  isMasterAdmin: boolean
  avatarUrl?: string
  phone?: string
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role?: 'admin' | 'user' | 'viewer' | 'cliente'
  companyId?: string
  phone?: string
}

class AuthService {
  private currentUser: User | null = null

  async login(credentials: LoginCredentials): Promise<{ user: User | null; error: string | null }> {
    try {
      console.log('🔍 Tentando login com:', credentials.email);
      
      // Fazer login com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      console.log('📧 Resposta do Supabase Auth:', { authData, authError });

      if (authError || !authData.user) {
        console.error('❌ Erro na autenticação Supabase:', authError);
        return { user: null, error: 'Email ou senha incorretos' }
      }

      console.log('✅ Auth bem-sucedido, buscando dados do usuário...');

      // Buscar dados do usuário na tabela users
      let { data: userData, error: userError } = await supabase
        .from('users' as any)
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .maybeSingle() as { data: any; error: any }

      console.log('👤 Usuário encontrado por auth_user_id:', { userData, userError });

      if (userError || !userData) {
        console.log('⚠️ Usuário não encontrado por auth_user_id, tentando por email...');
        
        // Se não encontrar, buscar por email (para usuários antigos)
        const { data: userByEmail, error: emailError } = await supabase
          .from('users' as any)
          .select('*')
          .eq('email', credentials.email)
          .maybeSingle() as { data: any; error: any }

        console.log('📧 Usuário encontrado por email:', { userByEmail, emailError });

        if (emailError || !userByEmail) {
          console.error('❌ Usuário não encontrado na tabela users');
          return { user: null, error: 'Usuário não encontrado no sistema' }
        }

        console.log('🔄 Atualizando auth_user_id do usuário...');
        // Atualizar o auth_user_id do usuário existente
        const { error: updateError } = await supabase
          .from('users' as any)
          .update({ auth_user_id: authData.user.id })
          .eq('id', userByEmail.id)

        if (updateError) {
          console.error('❌ Erro ao atualizar auth_user_id:', updateError);
        } else {
          console.log('✅ auth_user_id atualizado com sucesso');
        }

        userData = userByEmail
      }

      // Verificar se usuário está ativo
      if (userData && userData.status !== 'active') {
        console.warn('⚠️ Usuário não está ativo:', userData.status);
        await supabase.auth.signOut()
        return { user: null, error: 'Usuário inativo ou pendente' }
      }

      console.log('✅ Usuário está ativo, atualizando último login...');
      // Atualizar último login
      if (userData && userData.id) {
        await supabase
          .from('users' as any)
          .update({ last_login: new Date().toISOString() })
          .eq('id', userData.id)
      }

      // Converter dados do banco para interface User
      const user: User = {
        id: userData?.id || '',
        name: userData?.name || '',
        email: userData?.email || '',
        role: (userData?.role as 'admin' | 'user' | 'viewer' | 'cliente') || 'user',
        status: (userData?.status as 'active' | 'inactive' | 'pending') || 'active',
        companyId: userData?.company_id,
        isMasterAdmin: userData?.is_master_admin || false,
        avatarUrl: userData?.avatar_url,
        phone: userData?.phone,
        lastLogin: userData?.last_login,
        createdAt: userData?.created_at || '',
        updatedAt: userData?.updated_at || ''
      }

      console.log('✅ Login bem-sucedido. Dados do usuário:', user);
      this.currentUser = user

      // Salvar no localStorage
      localStorage.setItem('currentUser', JSON.stringify(user))
      localStorage.setItem('isAuthenticated', 'true')

      return { user, error: null }
    } catch (error) {
      console.error('💥 Erro geral no login:', error)
      return { user: null, error: 'Erro interno do servidor' }
    }
  }

  // Registro de novo usuário usando Supabase Auth
  async register(data: RegisterData): Promise<{ user: User | null; error: string | null }> {
    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role || 'user',
            company_id: data.companyId,
            phone: data.phone,
            is_master_admin: false
          }
        }
      })

      if (authError || !authData.user) {
        return { user: null, error: authError?.message || 'Erro ao criar usuário' }
      }

      // O trigger handle_new_user() irá criar automaticamente o registro na tabela users
      
      return { user: null, error: 'Usuário criado! Verifique seu email para confirmar a conta.' }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { user: null, error: 'Erro interno do servidor' }
    }
  }

  // Logout
  async logout(): Promise<void> {
    await supabase.auth.signOut()
    this.currentUser = null
    localStorage.removeItem('currentUser')
    localStorage.removeItem('isAuthenticated')
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    if (this.currentUser) return true
    
    const stored = localStorage.getItem('isAuthenticated')
    return stored === 'true'
  }

  // Obter usuário atual
  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser

    const stored = localStorage.getItem('currentUser')
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored)
        return this.currentUser
      } catch {
        return null
      }
    }

    return null
  }

  // Atualizar perfil do usuário
  async updateProfile(userId: string, data: Partial<User>): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('users' as any)
        .update({
          name: data.name,
          phone: data.phone,
          avatar_url: data.avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        return { success: false, error: 'Erro ao atualizar perfil' }
      }

      // Atualizar usuário atual se for o mesmo
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = { ...this.currentUser, ...data }
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  // Alterar senha usando Supabase Auth
  async changePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  // Solicitar reset de senha por email
  async requestPasswordReset(email: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  // Redefinir senha com token de recuperação
  async resetPassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  // Verificar se há uma sessão de recuperação ativa
  async verifyRecoverySession(): Promise<{ isValid: boolean; error: string | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        return { isValid: false, error: error.message }
      }

      // Verificar se há uma sessão ativa
      if (!session) {
        return { isValid: false, error: 'Nenhuma sessão de recuperação encontrada' }
      }

      return { isValid: true, error: null }
    } catch (error) {
      console.error('Erro ao verificar sessão de recuperação:', error)
      return { isValid: false, error: 'Erro interno do servidor' }
    }
  }

  // Verificar permissões
  hasPermission(requiredRole: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    const roleHierarchy = {
      'admin': 4,
      'user': 3,
      'viewer': 2,
      'cliente': 1
    }

    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

    return userLevel >= requiredLevel || user.isMasterAdmin
  }

  // Verificar se é admin master
  isMasterAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.isMasterAdmin || false
  }

  // Buscar usuários (apenas para admins)
  async getUsers(companyId?: string): Promise<{ users: User[]; error: string | null }> {
    try {
      if (!this.hasPermission('admin')) {
        return { users: [], error: 'Sem permissão para listar usuários' }
      }

      let query = supabase.from('users' as any).select('*')
      
      if (companyId && !this.isMasterAdmin()) {
        query = query.eq('company_id', companyId)
      }

      const { data, error } = await query

      if (error) {
        return { users: [], error: 'Erro ao buscar usuários' }
      }

      if (!data) {
        return { users: [], error: null }
      }

      const users: User[] = data.map((userData: any) => ({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as 'admin' | 'user' | 'viewer' | 'cliente',
        status: userData.status as 'active' | 'inactive' | 'pending',
        companyId: userData.company_id,
        isMasterAdmin: userData.is_master_admin,
        avatarUrl: userData.avatar_url,
        phone: userData.phone,
        lastLogin: userData.last_login,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      }))

      return { users, error: null }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      return { users: [], error: 'Erro interno do servidor' }
    }
  }

  // Criar admin master usando Supabase Auth (apenas para setup inicial)
  async createMasterAdmin(data: { name: string; email: string; password: string }): Promise<{ success: boolean; error: string | null }> {
    try {
      // Verificar se já existe um admin master
      const { data: existingAdmin } = await supabase
        .from('users' as any)
        .select('id')
        .eq('is_master_admin', true)
        .maybeSingle()

      if (existingAdmin) {
        return { success: false, error: 'Admin master já existe' }
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: 'admin',
            is_master_admin: true
          }
        }
      })

      if (authError || !authData.user) {
        return { success: false, error: authError?.message || 'Erro ao criar admin master' }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erro ao criar admin master:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }
}

export const authService = new AuthService()
export default authService