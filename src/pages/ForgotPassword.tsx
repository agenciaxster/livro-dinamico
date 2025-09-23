import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toastSuccess, toastError } from '@/hooks/use-toast';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toastError('Por favor, insira seu email');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toastError(error.message);
      } else {
        setEmailSent(true);
        toastSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
      }
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      toastError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="text-center space-y-3 sm:space-y-4 pb-6 sm:pb-8">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
                Email Enviado!
              </CardTitle>
              <CardDescription className="text-blue-100/80 text-sm sm:text-base">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 sm:p-6">
                <p className="text-white/90 text-sm sm:text-base text-center">
                  Enviamos um link de recuperação para:
                </p>
                <p className="text-blue-200 font-medium text-center mt-2 break-all">
                  {email}
                </p>
              </div>
              
              <div className="text-center space-y-3 sm:space-y-4">
                <p className="text-white/70 text-xs sm:text-sm">
                  Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    onClick={() => setEmailSent(false)}
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40"
                  >
                    Tentar Novamente
                  </Button>
                  
                  <Link to="/login" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                      <ArrowLeft className="w-4 h-4 mr-2" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
            <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-blue-200" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">
              Recuperar Senha
            </h1>
            <p className="text-blue-100/80 text-sm sm:text-base">
              Digite seu email para receber um link de recuperação
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-2 sm:space-y-3 pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl font-semibold text-white">
              Esqueceu sua senha?
            </CardTitle>
            <CardDescription className="text-blue-100/70 text-sm sm:text-base">
              Não se preocupe! Vamos ajudá-lo a recuperar o acesso à sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
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

              <Button
                type="submit"
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300 border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </div>
                ) : (
                  'Enviar Link de Recuperação'
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
                <ArrowLeft className="w-3 h-3 inline mr-1" />
                Voltar ao Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;