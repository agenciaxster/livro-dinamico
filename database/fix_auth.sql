-- =====================================================
-- SCRIPT PARA CORRIGIR AUTENTICAÇÃO E REMOVER USUÁRIO
-- =====================================================

-- 1. REMOVER O USUÁRIO admin@conectell.com.br
DELETE FROM users WHERE email = 'admin@conectell.com.br';

-- 2. ATUALIZAR A TABELA USERS PARA INTEGRAR COM SUPABASE AUTH
-- Adicionar coluna para armazenar o UUID do Supabase Auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- Remover a coluna password_hash já que usaremos Supabase Auth
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
ALTER TABLE users DROP COLUMN IF EXISTS last_password_change;
ALTER TABLE users DROP COLUMN IF EXISTS password_expired;

-- 3. CRIAR FUNÇÃO PARA SINCRONIZAR USUÁRIOS DO SUPABASE AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir novo usuário na tabela users quando um usuário é criado no auth.users
  INSERT INTO public.users (
    id,
    auth_user_id,
    email,
    name,
    role,
    status,
    company_id,
    is_master_admin,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'active',
    COALESCE(NEW.raw_user_meta_data->>'company_id', '550e8400-e29b-41d4-a716-446655440000'),
    COALESCE((NEW.raw_user_meta_data->>'is_master_admin')::boolean, false),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CRIAR TRIGGER PARA EXECUTAR A FUNÇÃO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. ATUALIZAR POLÍTICAS RLS PARA USAR auth.uid()
-- Remover políticas antigas
DROP POLICY IF EXISTS "Company data access" ON users;
DROP POLICY IF EXISTS "Company data access" ON companies;
DROP POLICY IF EXISTS "Company data access" ON categories;
DROP POLICY IF EXISTS "Company data access" ON accounts;
DROP POLICY IF EXISTS "Company data access" ON entries;
DROP POLICY IF EXISTS "Company data access" ON expenses;
DROP POLICY IF EXISTS "Company data access" ON generated_reports;
DROP POLICY IF EXISTS "Company data access" ON system_settings;
DROP POLICY IF EXISTS "Company data access" ON audit_logs;

-- Criar novas políticas usando auth.uid()
CREATE POLICY "Users can view own company data" ON users
    FOR ALL USING (
        auth.uid() = auth_user_id OR 
        company_id IN (
            SELECT company_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Company data access" ON companies
    FOR ALL USING (
        id IN (
            SELECT company_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Company data access" ON categories
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Company data access" ON accounts
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Company data access" ON entries
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Company data access" ON expenses
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Company data access" ON generated_reports
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Company data access" ON system_settings
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Company data access" ON audit_logs
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- 6. CRIAR FUNÇÃO PARA BUSCAR USUÁRIO POR AUTH_USER_ID
CREATE OR REPLACE FUNCTION get_user_by_auth_id(auth_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    role TEXT,
    status TEXT,
    company_id UUID,
    is_master_admin BOOLEAN,
    avatar_url TEXT,
    phone TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.company_id,
        u.is_master_admin,
        u.avatar_url,
        u.phone,
        u.last_login,
        u.created_at,
        u.updated_at
    FROM users u
    WHERE u.auth_user_id = auth_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. INSERIR UM USUÁRIO ADMIN MASTER TEMPORÁRIO (será substituído pelo Supabase Auth)
INSERT INTO users (
    id,
    auth_user_id,
    name,
    email,
    role,
    status,
    company_id,
    is_master_admin,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    NULL, -- Será preenchido quando o usuário fizer login via Supabase
    'Admin Master',
    'admin@example.com', -- Use este email para criar no Supabase
    'admin',
    'active',
    '550e8400-e29b-41d4-a716-446655440000',
    true,
    NOW(),
    NOW()
);

-- =====================================================
-- INSTRUÇÕES PARA USO:
-- =====================================================
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Vá em Authentication > Users no dashboard do Supabase
-- 3. Clique em "Add user" e crie um usuário com:
--    - Email: admin@example.com (ou outro de sua escolha)
--    - Password: sua senha
--    - User Metadata: {"role": "admin", "is_master_admin": true}
-- 4. O trigger irá automaticamente criar o registro na tabela users
-- =====================================================