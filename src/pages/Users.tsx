import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Users as UsersIcon, 
  Mail, 
  Calendar, 
  Shield, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  UserCheck,
  UserX,
  Filter,
  X,
  EyeOff,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

// Interface para usuário
interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Senha não será exibida, apenas para criação/edição
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin?: string;
  lastPasswordChange?: string;
  passwordExpired?: boolean;
  avatar?: string;
}

// Mock data para usuários
const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@empresa.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    lastLogin: '2024-01-20T14:22:00Z',
    lastPasswordChange: '2024-01-15T10:30:00Z',
    passwordExpired: false
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-16T09:15:00Z',
    lastLogin: '2024-01-19T16:45:00Z',
    lastPasswordChange: '2024-01-16T09:15:00Z',
    passwordExpired: false
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro.costa@empresa.com',
    role: 'viewer',
    status: 'inactive',
    createdAt: '2024-01-17T11:20:00Z',
    lastLogin: '2024-01-18T08:30:00Z',
    lastPasswordChange: '2023-12-17T11:20:00Z',
    passwordExpired: true
  },
  {
    id: '4',
    name: 'Ana Oliveira',
    email: 'ana.oliveira@empresa.com',
    role: 'user',
    status: 'pending',
    createdAt: '2024-01-18T13:45:00Z',
    lastPasswordChange: '2024-01-18T13:45:00Z',
    passwordExpired: false
  },
  {
    id: '5',
    name: 'Carlos Ferreira',
    email: 'carlos.ferreira@empresa.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-19T15:10:00Z',
    lastLogin: '2024-01-20T12:15:00Z',
    lastPasswordChange: '2024-01-19T15:10:00Z',
    passwordExpired: false
  }
];

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as User['role'],
    status: 'active' as User['status']
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const itemsPerPage = 8;

  // Detectar se deve abrir edição do usuário atual
  useEffect(() => {
    const editParam = searchParams.get('edit');
    if (editParam === 'current' && currentUser) {
      // Encontrar o usuário atual na lista
      const currentUserData = users.find(user => user.email === currentUser.email);
      if (currentUserData) {
        handleEdit(currentUserData);
        // Remover o parâmetro da URL
        setSearchParams({});
      }
    }
  }, [searchParams, currentUser, users]);

  // Filtrar e ordenar usuários
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [users, searchTerm, selectedRole, selectedStatus]);

  // Paginação
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Estatísticas
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;
  const adminUsers = users.filter(u => u.role === 'admin').length;

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      status: 'active'
    });
    setEditingUser(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de senha para novos usuários
    if (!editingUser) {
      if (!formData.password) {
        alert('A senha é obrigatória para novos usuários.');
        return;
      }
      if (formData.password.length < 8) {
        alert('A senha deve ter pelo menos 8 caracteres.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('As senhas não coincidem.');
        return;
      }
    }
    
    // Validação de senha para edição (se fornecida)
    if (editingUser && formData.password) {
      if (formData.password.length < 8) {
        alert('A senha deve ter pelo menos 8 caracteres.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('As senhas não coincidem.');
        return;
      }
    }
    
    if (editingUser) {
      // Editar usuário existente
      const updateData: Partial<User> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status
      };
      
      // Só atualiza a senha se foi fornecida
      if (formData.password) {
        updateData.lastPasswordChange = new Date().toISOString();
        updateData.passwordExpired = false;
      }
      
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...updateData }
          : user
      ));
    } else {
      // Criar novo usuário
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        createdAt: new Date().toISOString(),
        lastPasswordChange: new Date().toISOString(),
        passwordExpired: false
      };
      setUsers([newUser, ...users]);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Não preencher senha existente por segurança
      confirmPassword: '',
      role: user.role,
      status: user.status
    });
    setIsDialogOpen(true);
  };

  const handleView = (user: User) => {
    setViewingUser(user);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    setSelectedStatus('all');
    resetPagination();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'admin': return <ShieldCheck className="w-4 h-4" />;
      case 'user': return <UserCheck className="w-4 h-4" />;
      case 'viewer': return <Eye className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'user': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusBadgeColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-6 p-4 lg:p-0">
      {/* Sidebar */}
      <div className="w-full lg:w-80 lg:flex-shrink-0 space-y-4 lg:space-y-6">
        {/* Header da Sidebar */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Controles de Usuários</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie usuários e permissões</p>
        </div>

        {/* Estatísticas Resumidas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
              <span className="font-semibold">{totalUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Ativos</span>
              <span className="font-semibold text-green-600">{activeUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pendentes</span>
              <span className="font-semibold text-yellow-600">{pendingUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Admins</span>
              <span className="font-semibold text-red-600">{adminUsers}</span>
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca */}
            <div>
              <Label className="text-xs">Buscar</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome ou email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); resetPagination(); }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Função */}
            <div>
              <Label className="text-xs">Função</Label>
              <Select value={selectedRole} onValueChange={(value) => { setSelectedRole(value); resetPagination(); }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={selectedStatus} onValueChange={(value) => { setSelectedStatus(value); resetPagination(); }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 space-y-4 lg:space-y-6 min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usuários</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie usuários e suas permissões no sistema</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Edite os dados do usuário.' : 'Adicione um novo usuário ao sistema. Todos os campos são obrigatórios.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: João Silva"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Ex: joao@empresa.com"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">
                      {editingUser ? 'Nova Senha (deixe em branco para manter atual)' : 'Senha *'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="Mínimo 8 caracteres"
                        required={!editingUser}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">
                      {editingUser ? 'Confirmar Nova Senha' : 'Confirmar Senha *'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        placeholder="Repita a senha"
                        required={!editingUser || formData.password !== ''}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Função *</Label>
                    <Select value={formData.role} onValueChange={(value: User['role']) => setFormData({...formData, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin - Acesso total</SelectItem>
                        <SelectItem value="user">Usuário - Acesso padrão</SelectItem>
                        <SelectItem value="viewer">Visualizador - Apenas leitura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={formData.status} onValueChange={(value: User['status']) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Modal de Visualização */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto mx-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
              <DialogDescription>
                Visualize todas as informações deste usuário.
              </DialogDescription>
            </DialogHeader>
            {viewingUser && (
              <div className="grid gap-6 py-4">
                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</Label>
                      <p className="text-base font-medium">{viewingUser.name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</Label>
                    <p className="text-base font-medium mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {viewingUser.email}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Função</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoleIcon(viewingUser.role)}
                        <Badge className={getRoleBadgeColor(viewingUser.role)}>
                          {viewingUser.role === 'admin' ? 'Admin' : 
                           viewingUser.role === 'user' ? 'Usuário' : 'Visualizador'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</Label>
                      <div className="mt-1">
                        <Badge className={getStatusBadgeColor(viewingUser.status)}>
                          {viewingUser.status === 'active' ? 'Ativo' : 
                           viewingUser.status === 'inactive' ? 'Inativo' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Última Alteração de Senha</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Lock className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {viewingUser.lastPasswordChange ? formatDateTime(viewingUser.lastPasswordChange) : 'N/A'}
                      </p>
                      {viewingUser.passwordExpired && (
                        <Badge variant="destructive" className="ml-2">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Senha Expirada
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Criado em</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(viewingUser.createdAt)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Último Login</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {viewingUser.lastLogin ? formatDateTime(viewingUser.lastLogin) : 'Nunca'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">ID do Usuário</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-mono">{viewingUser.id}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="w-full sm:w-auto">
                Fechar
              </Button>
              {viewingUser && (
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEdit(viewingUser);
                }} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lista de Usuários */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold">Lista de Usuários</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length}</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usuários do Sistema</CardTitle>
              <CardDescription>
                {filteredUsers.length} usuário(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Nenhum usuário encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all'
                      ? 'Tente ajustar os filtros de busca.' 
                      : 'Comece criando o primeiro usuário.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedUsers.map((user) => {
                    const isCurrentUser = currentUser && user.email === currentUser.email;
                    return (
                    <div key={user.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-4 ${isCurrentUser ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''}`}>
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user.name}
                            </p>
                            {isCurrentUser && (
                              <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Você
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                            <Badge className={`text-xs w-fit ${getRoleBadgeColor(user.role)}`}>
                              {user.role === 'admin' ? 'Admin' : 
                               user.role === 'user' ? 'Usuário' : 'Visualizador'}
                            </Badge>
                            <Badge className={`text-xs w-fit ${getStatusBadgeColor(user.status)}`}>
                              {user.status === 'active' ? 'Ativo' : 
                               user.status === 'inactive' ? 'Inativo' : 'Pendente'}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Criado em {formatDate(user.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <Lock className="h-3 w-3" />
                            <span>
                              Senha alterada em {user.lastPasswordChange ? formatDate(user.lastPasswordChange) : 'N/A'}
                            </span>
                            {user.passwordExpired && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Expirada
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 justify-center sm:justify-end">
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={user.status === 'active'}
                            onCheckedChange={() => toggleUserStatus(user.id)}
                            size="sm"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {user.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(user)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Paginação */}
          {filteredUsers.length > itemsPerPage && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex items-center space-x-2 overflow-x-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex-shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">Anterior</span>
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        let pageNumber;
                        
                        if (totalPages <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 2) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 1) {
                          pageNumber = totalPages - 2 + i;
                        } else {
                          pageNumber = currentPage - 1 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                            className="w-8 h-8 p-0 flex-shrink-0"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex-shrink-0"
                    >
                      <span className="hidden sm:inline mr-1">Próxima</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;