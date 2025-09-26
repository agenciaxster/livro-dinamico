import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User as AuthUser } from '../services/authService';

export type UserRole = 'cliente' | 'admin' | 'user' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  isMasterAdmin: boolean;
  avatarUrl?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
  isMasterAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  changePassword: (newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Permissões por role
const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    'dashboard.view',
    'dashboard.edit',
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'reports.view',
    'reports.create',
    'settings.view',
    'settings.edit',
    'financial.view',
    'financial.edit',
    'accounts.view',
    'accounts.edit',
    'categories.view',
    'categories.edit',
    'entries.view',
    'entries.edit',
    'expenses.view',
    'expenses.edit'
  ],
  user: [
    'dashboard.view',
    'reports.view',
    'financial.view',
    'accounts.view',
    'categories.view',
    'entries.view',
    'entries.edit',
    'expenses.view',
    'expenses.edit'
  ],
  viewer: [
    'dashboard.view',
    'reports.view',
    'financial.view',
    'accounts.view',
    'categories.view',
    'entries.view',
    'expenses.view'
  ],
  cliente: [
    'dashboard.view',
    'reports.view',
    'financial.view'
  ]
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um usuário logado
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser({
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role as UserRole,
        companyId: currentUser.companyId,
        isMasterAdmin: currentUser.isMasterAdmin,
        avatarUrl: currentUser.avatarUrl,
        phone: currentUser.phone
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user: authUser, error } = await authService.login({ email, password });
      
      if (authUser && !error) {
        const userData: User = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.name,
          role: authUser.role as UserRole,
          companyId: authUser.companyId,
          isMasterAdmin: authUser.isMasterAdmin,
          avatarUrl: authUser.avatarUrl,
          phone: authUser.phone
        };
        setUser(userData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // Master admin tem todas as permissões
    if (user.isMasterAdmin) return true;
    return rolePermissions[user.role]?.includes(permission) || false;
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    const { success } = await authService.updateProfile(user.id, updates);
    if (success) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }
    return success;
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    if (!user) return false;
    
    const { success } = await authService.changePassword(newPassword);
    return success;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.isMasterAdmin || false,
    isClient: user?.role === 'cliente',
    isMasterAdmin: user?.isMasterAdmin || false,
    hasPermission,
    updateProfile,
    changePassword
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};