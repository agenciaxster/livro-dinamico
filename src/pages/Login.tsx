import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toastSuccess, toastError } from '../hooks/use-toast';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        toastSuccess(
          "Login realizado com sucesso!",
          "Bem-vindo de volta ao sistema."
        );
        navigate('/');
      } else {
        toastError(
          "Erro no login",
          "Email ou senha incorretos. Tente novamente."
        );
      }
    } catch (err) {
      toastError(
        "Erro no sistema",
        "Erro ao fazer login. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'url(/futuristic-bg.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-cyan-300 rounded-full animate-ping opacity-40" />
        <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce opacity-50" />
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-indigo-400 rounded-full animate-pulse opacity-70" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 space-y-6 sm:space-y-8 px-2 sm:px-0">
        {/* Logo/Header with glass effect */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Bem-vindo
            </h1>
            <p className="text-base sm:text-lg text-blue-100/90 drop-shadow-md px-4 sm:px-0">
              Acesse sua conta com segurança
            </p>
          </div>
        </div>



        {/* Login Form with advanced glass effect */}
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:bg-white/15 hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02]">
          <CardHeader className="space-y-2 pb-4 sm:pb-6 px-4 sm:px-6">
            <CardTitle className="text-2xl sm:text-3xl text-center text-white drop-shadow-lg">
              Login
            </CardTitle>
            <CardDescription className="text-center text-blue-100/80 text-sm sm:text-base px-2 sm:px-0">
              Entre com suas credenciais para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="email" className="text-white/90 font-medium text-sm sm:text-base">
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-blue-200/70 group-hover:text-blue-200 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 sm:pl-12 h-12 sm:h-14 bg-white/10 backdrop-blur-md border-white/30 text-white placeholder:text-blue-200/60 hover:bg-white/15 focus:bg-white/20 focus:border-blue-400/50 transition-all duration-300 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="password" className="text-white/90 font-medium text-sm sm:text-base">
                  Senha
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-blue-200/70 group-hover:text-blue-200 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
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

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <input
                    id="remember"
                    type="checkbox"
                    className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500/50"
                  />
                  <Label htmlFor="remember" className="text-white/80 text-sm">
                    Lembrar-me
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-200 hover:text-white hover:underline transition-colors text-left sm:text-right"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300 border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer with glass effect */}
        <div className="text-center px-4 sm:px-0">
          <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 sm:px-6 py-3 shadow-lg">
            <p className="text-white/80 text-sm">
              Esqueceu sua senha?{' '}
              <Link 
                to="/forgot-password" 
                className="text-blue-200 hover:text-white hover:underline font-medium transition-colors"
              >
                Recuperar senha
              </Link>
            </p>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Login;