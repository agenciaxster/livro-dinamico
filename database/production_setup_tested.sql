-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO PARA PRODUÇÃO (CORRIGIDO)
-- Livro Dinâmico - Sistema de Autenticação Completo
-- Versão com relações corretas entre tabelas
-- =====================================================

-- 1. CONFIGURAÇÃO DA TABELA USERS
-- =====================================================

-- Verificar se a coluna auth_user_id existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'auth_user_id'
    ) THEN
        ALTER TABLE public.users ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Coluna auth_user_id adicionada à tabela users';
    ELSE
        RAISE NOTICE 'Coluna auth_user_id já existe na tabela users';
    END IF;
END $$;

-- Remover colunas de senha antigas se existirem
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password'
    ) THEN
        ALTER TABLE public.users DROP COLUMN password;
        RAISE NOTICE 'Coluna password removida da tabela users';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE public.users DROP COLUMN password_hash;
        RAISE NOTICE 'Coluna password_hash removida da tabela users';
    END IF;
END $$;

-- 2. FUNÇÃO PARA CRIAR USUÁRIO AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        auth_user_id,
        email,
        name,
        role,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'user',
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se a função foi criada
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        RAISE NOTICE 'Função handle_new_user criada com sucesso';
    END IF;
END $$;

-- 3. TRIGGER PARA NOVOS USUÁRIOS
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verificar se o trigger foi criado
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
    ) THEN
        RAISE NOTICE 'Trigger on_auth_user_created criado com sucesso';
    END IF;
END $$;

-- 4. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Política: Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = auth_user_id);

-- Política: Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Política: Admins podem ver todos os usuários
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Política: Admins podem atualizar todos os usuários
CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Política: Admins podem deletar usuários
CREATE POLICY "Admins can delete users" ON public.users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Verificar RLS na tabela users
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE 'RLS habilitado na tabela users';
    END IF;
END $$;

-- 5. CONFIGURAÇÃO DAS OUTRAS TABELAS
-- =====================================================

-- Habilitar RLS em todas as tabelas principais
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Políticas para companies (baseado em company_id dos users)
DROP POLICY IF EXISTS "Users can view own company" ON public.companies;
DROP POLICY IF EXISTS "Users can update own company" ON public.companies;

CREATE POLICY "Users can view own company" ON public.companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own company" ON public.companies
    FOR ALL USING (
        id IN (
            SELECT company_id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

-- Políticas para entries (baseado em user_id)
DROP POLICY IF EXISTS "Users can view own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can manage own entries" ON public.entries;

CREATE POLICY "Users can view own entries" ON public.entries
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own entries" ON public.entries
    FOR ALL USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

-- Verificar RLS nas outras tabelas
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'companies' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE 'RLS habilitado na tabela companies';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'entries' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE 'RLS habilitado na tabela entries';
    END IF;
END $$;

-- 6. CONFIGURAÇÃO DE OUTRAS TABELAS DO SISTEMA
-- =====================================================

-- Habilitar RLS em todas as tabelas do sistema
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Políticas para categories (baseado em company_id)
DROP POLICY IF EXISTS "Company data access" ON public.categories;
CREATE POLICY "Company data access" ON public.categories
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

-- Políticas para accounts (baseado em company_id)
DROP POLICY IF EXISTS "Company data access" ON public.accounts;
CREATE POLICY "Company data access" ON public.accounts
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

-- Políticas para expenses (baseado em company_id)
DROP POLICY IF EXISTS "Company data access" ON public.expenses;
CREATE POLICY "Company data access" ON public.expenses
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

-- 7. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice para auth_user_id na tabela users
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);

-- Índices para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_company_id ON public.entries(company_id);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON public.entries(created_at);

-- Verificar criação dos índices
DO $$
BEGIN
    RAISE NOTICE 'Índices de performance criados com sucesso';
END $$;

-- 8. CONFIGURAÇÕES DE SEGURANÇA
-- =====================================================

-- Garantir que apenas usuários autenticados possam acessar as tabelas
REVOKE ALL ON public.users FROM anon;
REVOKE ALL ON public.companies FROM anon;
REVOKE ALL ON public.entries FROM anon;
REVOKE ALL ON public.categories FROM anon;
REVOKE ALL ON public.accounts FROM anon;
REVOKE ALL ON public.expenses FROM anon;

-- Conceder permissões adequadas para usuários autenticados
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;

-- Verificar permissões
DO $$
BEGIN
    RAISE NOTICE 'Permissões de segurança configuradas';
END $$;

-- 9. FUNÇÃO PARA VERIFICAR ADMIN
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE auth_user_id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se a função foi criada
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
        RAISE NOTICE 'Função is_admin criada com sucesso';
    END IF;
END $$;

-- 10. LIMPEZA E VERIFICAÇÃO FINAL
-- =====================================================

-- Remover usuários órfãos (sem auth_user_id)
DELETE FROM public.users WHERE auth_user_id IS NULL;

-- Verificar integridade dos dados
DO $$
DECLARE
    user_count INTEGER;
    auth_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users;
    SELECT COUNT(*) INTO auth_count FROM auth.users;
    
    RAISE NOTICE 'Usuários na tabela public.users: %', user_count;
    RAISE NOTICE 'Usuários na tabela auth.users: %', auth_count;
    
    IF user_count > auth_count THEN
        RAISE WARNING 'Existem mais usuários na tabela public.users do que na auth.users!';
    ELSE
        RAISE NOTICE 'Integridade dos dados verificada com sucesso';
    END IF;
END $$;

-- =====================================================
-- CONFIGURAÇÃO CONCLUÍDA
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'CONFIGURAÇÃO DE PRODUÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '1. Configurar templates de email no Supabase Dashboard';
    RAISE NOTICE '2. Configurar URLs de redirecionamento';
    RAISE NOTICE '3. Verificar configurações de autenticação';
    RAISE NOTICE '4. Testar fluxo completo de autenticação';
    RAISE NOTICE '';
    RAISE NOTICE 'Sistema pronto para produção!';
END $$;