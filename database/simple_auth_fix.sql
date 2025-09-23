-- Script simplificado para corrigir autenticação Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Primeiro, vamos verificar se a coluna auth_user_id existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'auth_user_id'
    ) THEN
        ALTER TABLE public.users ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);
        CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
    END IF;
END $$;

-- 2. Remover o usuário admin@conectell.com.br se existir
DELETE FROM public.users WHERE email = 'admin@conectell.com.br';

-- 3. Remover colunas de senha se existirem
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE public.users DROP COLUMN password_hash;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_password_change'
    ) THEN
        ALTER TABLE public.users DROP COLUMN last_password_change;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_expired'
    ) THEN
        ALTER TABLE public.users DROP COLUMN password_expired;
    END IF;
END $$;

-- 4. Criar função para lidar com novos usuários (versão simplificada)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    auth_user_id,
    email,
    name,
    role,
    status,
    is_master_admin,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'active',
    COALESCE((NEW.raw_user_meta_data->>'is_master_admin')::boolean, false),
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Se der erro, apenas ignore (usuário pode já existir)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Atualizar políticas RLS (versão simplificada)
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;

-- Políticas básicas
CREATE POLICY "Enable read for authenticated users" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on auth_user_id" ON public.users
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- 7. Garantir que RLS está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 8. Verificar se tudo está funcionando
SELECT 'Setup completed successfully!' as status;