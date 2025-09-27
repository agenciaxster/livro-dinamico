import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { authService } from '../services/authService';

export function CreateMasterAdmin() {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      const result = await authService.createMasterAdmin({
        name: 'Admin Master',
        email: 'financeiro@conectell.com.br',
        password: 'Admin@123'
      });
      
      if (result.success) {
        toast.success('Admin Master criado com sucesso!');
        setCreated(true);
      } else {
        toast.error(result.error || 'Erro ao criar Admin Master');
      }
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error('Erro ao criar Admin Master: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">✅ Admin Master Criado!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>O usuário Admin Master foi criado com sucesso.</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium">Credenciais:</p>
              <p className="text-sm">Email: financeiro@conectell.com.br</p>
              <p className="text-sm">Senha: Admin@123</p>
            </div>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Criar Admin Master</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configuração inicial do sistema
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Este usuário terá acesso completo ao sistema e poderá gerenciar todos os outros usuários.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium">Será criado com:</p>
            <p className="text-sm">Email: financeiro@conectell.com.br</p>
            <p className="text-sm">Senha: Admin@123</p>
            <p className="text-sm">Função: Master Administrator</p>
          </div>
          <Button 
            onClick={handleCreateAdmin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Criando...' : 'Criar Admin Master'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}