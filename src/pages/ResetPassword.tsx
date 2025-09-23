import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toastSuccess, toastError } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [passwordReset, setPasswordReset] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Verificar se há tokens de recuperação na URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (type === 'recovery' && accessToken && refreshToken) {
      // Definir a sessão com os tokens de recuperação
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (error) {
          console.error('Erro ao definir sessão:', error);
          setIsValidToken(false);
          toastError('Link de recuperação inválido ou expirado');
        } else {
          setIsValidToken(true);
        }
      });
    } else {
      setIsValidToken(false);
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toastError('Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      toastError('As senhas não coincidem');
      return;
    }

    if (!passwordValidation.isValid) {
      toastError('A senha não atende aos critérios de segurança');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toastError(error.message);
      } else {
        setPasswordReset(true);
        toastSuccess('Senha redefinida com sucesso!');
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      toastError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Verificando link de recuperação...</p>
        </div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-white">
                Link Inválido
              </CardTitle>
              <CardDescription className="text-blue-100/80">
                O link de recuperação é inválido ou expirou.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-white/70 text-sm">
                  Por favor, solicite um novo link de recuperação.
                </p>
                
                <div className="flex flex-col gap-3">
                  <Link to="/forgot-password">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                      Solicitar Novo Link
                    </Button>
                  </Link>
                  
                  <Link to="/login">
                    <Button variant="outline" className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20">
                      Voltar ao Login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (passwordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-white">
                Senha Redefinida!
              </CardTitle>
              <CardDescription className="text-blue-100/80">
                Sua senha foi alterada com sucesso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-white/90">
                  Você será redirecionado para a página de login em alguns segundos.
                </p>
                
                <Link to="/login">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    Ir para Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-blue-200" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">
              Nova Senha
            </h1>
            <p className="text-blue-100/80 text-sm sm:text-base">
              Defina uma nova senha segura para sua conta
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-2 sm:space-y-3 pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl font-semibold text-white">
              Redefinir Senha
            </CardTitle>
            <CardDescription className="text-blue-100/70 text-sm sm:text-base">
              Escolha uma senha forte e segura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Nova Senha */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="password" className="text-white/90 font-medium text-sm sm:text-base">
                  Nova Senha
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-blue-200/70 group-hover:text-blue-200 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 bg-white/10 backdrop-blur-md border-white/30 text-white placeholder:text-blue-200/60 hover:bg-white/15 focus:bg-white/20 focus:border-blue-400/50 transition-all duration-300 text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-blue-200/70 hover:text-blue-200 transition-colors"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="confirmPassword" className="text-white/90 font-medium text-sm sm:text-base">
                  Confirmar Nova Senha
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-blue-200/70 group-hover:text-blue-200 transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 bg-white/10 backdrop-blur-md border-white/30 text-white placeholder:text-blue-200/60 hover:bg-white/15 focus:bg-white/20 focus:border-blue-400/50 transition-all duration-300 text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 sm:right-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-blue-200/70 hover:text-blue-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Critérios de Senha */}
              {password && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 sm:p-4 space-y-2">
                  <p className="text-white/90 font-medium text-sm">Critérios de Segurança:</p>
                  <div className="grid grid-cols-1 gap-1 text-xs sm:text-sm">
                    <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${passwordValidation.minLength ? 'bg-green-400' : 'bg-red-400'}`} />
                      Mínimo 8 caracteres
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasUpperCase ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${passwordValidation.hasUpperCase ? 'bg-green-400' : 'bg-red-400'}`} />
                      Pelo menos uma letra maiúscula
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasLowerCase ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${passwordValidation.hasLowerCase ? 'bg-green-400' : 'bg-red-400'}`} />
                      Pelo menos uma letra minúscula
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasNumbers ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${passwordValidation.hasNumbers ? 'bg-green-400' : 'bg-red-400'}`} />
                      Pelo menos um número
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${passwordValidation.hasSpecialChar ? 'bg-green-400' : 'bg-red-400'}`} />
                      Pelo menos um caractere especial
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300 border-0"
                disabled={isLoading || !passwordValidation.isValid || password !== confirmPassword}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Redefinindo...
                  </div>
                ) : (
                  'Redefinir Senha'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 sm:px-6 py-3 shadow-lg">
            <p className="text-white/80 text-sm">
              Lembrou da senha?{' '}
              <Link 
                to="/login" 
                className="text-blue-200 hover:text-white hover:underline font-medium transition-colors"
              >
                Voltar ao Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;