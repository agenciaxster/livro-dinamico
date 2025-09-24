-- =====================================================
-- CORREÇÃO COMPLETA DO SISTEMA DE AUTENTICAÇÃO E RLS
-- =====================================================

-- 1. SINCRONIZAR USUÁRIO EXISTENTE AUTH.USERS -> PUBLIC.USERS
DO $$
DECLARE
    auth_user_record RECORD;
    public_user_record RECORD;
BEGIN
    -- Buscar usuário financeiro@conectell.com.br no auth.users
    SELECT id, email, email_confirmed_at INTO auth_user_record
    FROM auth.users 
    WHERE email = 'financeiro@conectell.com.br';
    
    -- Buscar usuário na tabela public.users
    SELECT id, auth_user_id INTO public_user_record
    FROM public.users 
    WHERE email = 'financeiro@conectell.com.br';
    
    IF auth_user_record.id IS NOT NULL AND public_user_record.id IS NOT NULL THEN
        -- Sincronizar auth_user_id
        UPDATE public.users 
        SET 
            auth_user_id = auth_user_record.id,
            updated_at = now()
        WHERE email = 'financeiro@conectell.com.br';
        
        RAISE NOTICE 'Usuário sincronizado: % -> %', auth_user_record.id, public_user_record.id;
    ELSE
        RAISE NOTICE 'Usuário não encontrado para sincronização';
    END IF;
END $$;

-- 2. CRIAR FUNÇÃO SECURITY DEFINER PARA VERIFICAR ADMIN (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM public.users 
    WHERE auth_user_id = auth.uid() 
    AND status = 'active';
    
    RETURN COALESCE(user_role, 'none');
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'none';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 3. CRIAR FUNÇÃO PARA VERIFICAR SE USUÁRIO É MASTER ADMIN
CREATE OR REPLACE FUNCTION public.is_current_user_master_admin()
RETURNS BOOLEAN AS $$
DECLARE
    is_master BOOLEAN;
BEGIN
    SELECT is_master_admin INTO is_master 
    FROM public.users 
    WHERE auth_user_id = auth.uid() 
    AND status = 'active';
    
    RETURN COALESCE(is_master, false);
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 4. CRIAR FUNÇÃO PARA OBTER COMPANY_ID DO USUÁRIO ATUAL
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID AS $$
DECLARE
    user_company_id UUID;
BEGIN
    SELECT company_id INTO user_company_id 
    FROM public.users 
    WHERE auth_user_id = auth.uid() 
    AND status = 'active';
    
    RETURN user_company_id;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 5. REMOVER TODAS AS POLÍTICAS RLS CONFLITANTES E RECRIAR DE FORMA SIMPLES
DROP POLICY IF EXISTS "Company data access" ON public.users;
DROP POLICY IF EXISTS "Users can view own company data" ON public.users;
DROP POLICY IF EXISTS "Users can view users from their company" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.users;
DROP POLICY IF EXISTS "admin_delete_all" ON public.users;
DROP POLICY IF EXISTS "admin_insert_all" ON public.users;
DROP POLICY IF EXISTS "admin_select_all" ON public.users;
DROP POLICY IF EXISTS "admin_update_all" ON public.users;
DROP POLICY IF EXISTS "user_insert_own" ON public.users;
DROP POLICY IF EXISTS "user_select_own" ON public.users;
DROP POLICY IF EXISTS "user_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert" ON public.users;
DROP POLICY IF EXISTS "users_select_admin" ON public.users;
DROP POLICY IF EXISTS "users_update_admin" ON public.users;

-- 6. CRIAR POLÍTICAS RLS SIMPLES E EFICAZES PARA USERS
CREATE POLICY "users_select_policy" ON public.users
FOR SELECT USING (
    auth_user_id = auth.uid() OR                    -- Próprio usuário
    public.is_current_user_master_admin() OR        -- Master admin vê todos
    (public.get_current_user_role() = 'admin' AND   -- Admin vê usuários da mesma empresa
     company_id = public.get_current_user_company_id())
);

CREATE POLICY "users_insert_policy" ON public.users
FOR INSERT WITH CHECK (
    auth_user_id = auth.uid() OR                    -- Próprio usuário pode se inserir
    public.is_current_user_master_admin() OR        -- Master admin pode inserir qualquer um
    public.get_current_user_role() = 'admin'        -- Admin pode inserir usuários
);

CREATE POLICY "users_update_policy" ON public.users
FOR UPDATE USING (
    auth_user_id = auth.uid() OR                    -- Próprio usuário
    public.is_current_user_master_admin() OR        -- Master admin atualiza todos
    (public.get_current_user_role() = 'admin' AND   -- Admin atualiza usuários da mesma empresa
     company_id = public.get_current_user_company_id())
);

CREATE POLICY "users_delete_policy" ON public.users
FOR DELETE USING (
    public.is_current_user_master_admin() OR        -- Apenas master admin pode deletar
    (public.get_current_user_role() = 'admin' AND   -- Admin pode deletar usuários da mesma empresa
     company_id = public.get_current_user_company_id() AND
     auth_user_id != auth.uid())                    -- Não pode deletar a si mesmo
);

-- 7. SIMPLIFICAR POLÍTICAS RLS PARA OUTRAS TABELAS
-- Accounts
DROP POLICY IF EXISTS "Company data access" ON public.accounts;
CREATE POLICY "accounts_company_policy" ON public.accounts
FOR ALL USING (
    public.is_current_user_master_admin() OR
    company_id = public.get_current_user_company_id()
);

-- Categories  
DROP POLICY IF EXISTS "Company data access" ON public.categories;
CREATE POLICY "categories_company_policy" ON public.categories
FOR ALL USING (
    public.is_current_user_master_admin() OR
    company_id = public.get_current_user_company_id()
);

-- Entries
DROP POLICY IF EXISTS "Company data access" ON public.entries;
DROP POLICY IF EXISTS "Users can manage own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can view own entries" ON public.entries;
CREATE POLICY "entries_company_policy" ON public.entries
FOR ALL USING (
    public.is_current_user_master_admin() OR
    company_id = public.get_current_user_company_id()
);

-- Expenses
DROP POLICY IF EXISTS "Company data access" ON public.expenses;
CREATE POLICY "expenses_company_policy" ON public.expenses
FOR ALL USING (
    public.is_current_user_master_admin() OR
    company_id = public.get_current_user_company_id()
);

-- Companies
DROP POLICY IF EXISTS "Company data access" ON public.companies;
DROP POLICY IF EXISTS "Users can update own company" ON public.companies;
DROP POLICY IF EXISTS "Users can view own company" ON public.companies;
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
CREATE POLICY "companies_access_policy" ON public.companies
FOR ALL USING (
    public.is_current_user_master_admin() OR
    id = public.get_current_user_company_id()
);

-- Audit Logs
DROP POLICY IF EXISTS "Company data access" ON public.audit_logs;
CREATE POLICY "audit_logs_company_policy" ON public.audit_logs
FOR ALL USING (
    public.is_current_user_master_admin() OR
    company_id = public.get_current_user_company_id()
);

-- Generated Reports
DROP POLICY IF EXISTS "Company data access" ON public.generated_reports;
CREATE POLICY "generated_reports_company_policy" ON public.generated_reports
FOR ALL USING (
    public.is_current_user_master_admin() OR
    company_id = public.get_current_user_company_id()
);

-- System Settings
DROP POLICY IF EXISTS "Company data access" ON public.system_settings;
CREATE POLICY "system_settings_company_policy" ON public.system_settings
FOR ALL USING (
    public.is_current_user_master_admin() OR
    company_id = public.get_current_user_company_id()
);

-- 8. VERIFICAR CONFIGURAÇÃO FINAL
SELECT 
    'USUÁRIO SINCRONIZADO' as status,
    u.email,
    u.role,
    u.is_master_admin,
    u.auth_user_id,
    u.company_id,
    CASE 
        WHEN u.auth_user_id IS NOT NULL THEN '✅ CONFIGURADO'
        ELSE '❌ PROBLEMA'
    END as auth_status
FROM public.users u
WHERE u.email = 'financeiro@conectell.com.br';