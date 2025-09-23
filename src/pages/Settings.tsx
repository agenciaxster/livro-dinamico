import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Save, 
  RotateCcw,
  Shield, 
  Database, 
  Users,
  CheckCircle,
  Lock,
  Mail,
  Palette
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SystemSettings {
  systemName: string;
  systemVersion: string;
  maintenanceMode: boolean;
  sessionTimeout: number;
  emailNotifications: boolean;
  smtpServer: string;
  smtpPort: string;
  theme: 'light' | 'dark' | 'auto';
}

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const defaultSettings: SystemSettings = {
    systemName: 'Livro Dinâmico',
    systemVersion: '1.0.0',
    maintenanceMode: false,
    sessionTimeout: 30,
    emailNotifications: false,
    smtpServer: '',
    smtpPort: '587',
    theme: 'auto'
  };

  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  // Carregar configurações salvas ao inicializar
  useEffect(() => {
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        console.error('Erro ao carregar configurações salvas:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof SystemSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleMaintenanceModeToggle = (checked: boolean) => {
    handleInputChange('maintenanceMode', checked);
    
    if (checked) {
      toast({
        title: "⚠️ Modo de Manutenção Ativado",
        description: "O sistema entrará em modo de manutenção após salvar as configurações. Usuários não poderão acessar o sistema.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "✅ Modo de Manutenção Desativado",
        description: "O sistema voltará ao funcionamento normal após salvar as configurações.",
      });
    }
  };

  const handleEmailNotificationsToggle = (checked: boolean) => {
    handleInputChange('emailNotifications', checked);
    
    if (checked) {
      toast({
        title: "📧 Notificações por Email Ativadas",
        description: "Configure o servidor SMTP para enviar notificações por email.",
      });
    } else {
      toast({
        title: "📧 Notificações por Email Desativadas",
        description: "O sistema não enviará mais notificações por email.",
      });
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    handleInputChange('theme', theme);
    
    // Aplicar tema imediatamente
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // Auto - usar preferência do sistema
      root.classList.remove('dark', 'light');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    }

    toast({
      title: "🎨 Tema Alterado",
      description: `Tema alterado para: ${theme === 'auto' ? 'Automático' : theme === 'dark' ? 'Escuro' : 'Claro'}`,
    });
  };

  const validateSettings = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validar nome do sistema
    if (!settings.systemName.trim()) {
      errors.push("Nome do sistema é obrigatório");
    }

    // Validar timeout de sessão
    if (settings.sessionTimeout < 5 || settings.sessionTimeout > 480) {
      errors.push("Timeout de sessão deve estar entre 5 e 480 minutos");
    }

    // Validar configurações de email se ativadas
    if (settings.emailNotifications) {
      if (!settings.smtpServer.trim()) {
        errors.push("Servidor SMTP é obrigatório quando notificações por email estão ativadas");
      }
      if (!settings.smtpPort.trim()) {
        errors.push("Porta SMTP é obrigatória quando notificações por email estão ativadas");
      } else if (isNaN(Number(settings.smtpPort)) || Number(settings.smtpPort) < 1 || Number(settings.smtpPort) > 65535) {
        errors.push("Porta SMTP deve ser um número válido entre 1 e 65535");
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleSave = async () => {
    const validation = validateSettings();
    
    if (!validation.isValid) {
      toast({
        title: "❌ Erro de Validação",
        description: validation.errors.join(". "),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular salvamento no servidor
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Salvar no localStorage para persistência
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      
      toast({
        title: "✅ Configurações Salvas!",
        description: "Todas as configurações foram salvas com sucesso e aplicadas ao sistema.",
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "❌ Erro ao Salvar",
        description: "Ocorreu um erro ao salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    
    // Aplicar tema padrão
    handleThemeChange(defaultSettings.theme);
    
    toast({
      title: "🔄 Configurações Restauradas",
      description: "Todas as configurações foram restauradas para os valores padrão. Clique em 'Salvar' para confirmar.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Configurações do Sistema
          </h1>
          <p className="text-gray-600 text-lg">
            Gerencie as configurações básicas do sistema
          </p>
        </div>

        {/* Status do Sistema */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold text-green-600">Online</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Database className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Banco de Dados</p>
                  <p className="font-semibold text-blue-600">Conectado</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Usuários Ativos</p>
                  <p className="font-semibold text-purple-600">12</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configurações Gerais */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configurações básicas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="systemName">Nome do Sistema</Label>
                <Input
                  id="systemName"
                  value={settings.systemName}
                  onChange={(e) => handleInputChange('systemName', e.target.value)}
                  placeholder="Digite o nome do sistema"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemVersion">Versão</Label>
                <Input
                  id="systemVersion"
                  value={settings.systemVersion}
                  onChange={(e) => handleInputChange('systemVersion', e.target.value)}
                  placeholder="Versão do sistema"
                  disabled
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Modo de Manutenção</Label>
                  <p className="text-sm text-gray-500">
                    Ativar modo de manutenção do sistema
                  </p>
                </div>
                <Switch
                 checked={settings.maintenanceMode}
                 onCheckedChange={handleMaintenanceModeToggle}
               />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Segurança */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-600" />
                Segurança
              </CardTitle>
              <CardDescription>
                Configurações de segurança e autenticação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Timeout de Sessão (minutos)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                  min="5"
                  max="480"
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Email */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600" />
                Email e Notificações
              </CardTitle>
              <CardDescription>
                Configurações de email e notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-gray-500">
                    Enviar notificações por email
                  </p>
                </div>
                <Switch
                 checked={settings.emailNotifications}
                 onCheckedChange={handleEmailNotificationsToggle}
               />
              </div>

              {settings.emailNotifications && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="smtpServer">Servidor SMTP</Label>
                    <Input
                      id="smtpServer"
                      value={settings.smtpServer}
                      onChange={(e) => handleInputChange('smtpServer', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">Porta SMTP</Label>
                    <Input
                      id="smtpPort"
                      value={settings.smtpPort}
                      onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                      placeholder="587"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

           {/* Configurações de Interface */}
           <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Palette className="h-5 w-5 text-purple-600" />
                 Interface
               </CardTitle>
               <CardDescription>
                 Configurações de aparência e interface
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
               <div className="space-y-4">
                 <Label>Tema do Sistema</Label>
                 <div className="grid grid-cols-3 gap-3">
                   <div 
                     className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                       settings.theme === 'light' ? 'bg-blue-50 border-blue-200' : ''
                     }`}
                     onClick={() => handleThemeChange('light')}
                   >
                     <div className={`w-4 h-4 bg-white border-2 rounded-full ${
                       settings.theme === 'light' ? 'border-blue-300' : 'border-gray-300'
                     }`}></div>
                     <span className={`text-sm ${
                       settings.theme === 'light' ? 'font-medium text-blue-700' : ''
                     }`}>Claro</span>
                   </div>
                   <div 
                     className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                       settings.theme === 'dark' ? 'bg-blue-50 border-blue-200' : ''
                     }`}
                     onClick={() => handleThemeChange('dark')}
                   >
                     <div className={`w-4 h-4 bg-gray-800 border-2 rounded-full ${
                       settings.theme === 'dark' ? 'border-blue-300' : 'border-gray-300'
                     }`}></div>
                     <span className={`text-sm ${
                       settings.theme === 'dark' ? 'font-medium text-blue-700' : ''
                     }`}>Escuro</span>
                   </div>
                   <div 
                     className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                       settings.theme === 'auto' ? 'bg-blue-50 border-blue-200' : ''
                     }`}
                     onClick={() => handleThemeChange('auto')}
                   >
                     <div className={`w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 border-2 rounded-full ${
                       settings.theme === 'auto' ? 'border-blue-300' : 'border-gray-300'
                     }`}></div>
                     <span className={`text-sm ${
                       settings.theme === 'auto' ? 'font-medium text-blue-700' : ''
                     }`}>Auto</span>
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>

         {/* Botões de Ação */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleReset}
            disabled={isLoading}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50 px-6 py-3"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrões
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;