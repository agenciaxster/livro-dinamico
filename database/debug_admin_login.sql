-- =====================================================
-- DEBUG: PROBLEMA DE LOGIN DO ADMIN
-- Email: contato@conectell.com.br
-- =====================================================

-- 1. VERIFICAR SE O USUÁRIO EXISTE NO SUPABASE AUTH
-- =====================================================

SELECT 
    '🔍 VERIFICAÇÃO NO SUPABASE AUTH' as status,
    id,
    email,
    email_confirmed_at,
    phone_confirmed_at,
    confirmed_at,
    last_sign_in_at,
    created_at,
    updated_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ EMAIL CONFIRMADO'
        ELSE '❌ EMAIL NÃO CONFIRMADO'
    END as email_status,
    CASE 
        WHEN confirmed_at IS NOT NULL THEN '✅ CONTA CONFIRMADA'
        ELSE '❌ CONTA NÃO CONFIRMADA'
    END as conta_status
FROM auth.users 
WHERE email = 'contato@conectell.com.br';

-- 2. VERIFICAR SE O USUÁRIO EXISTE NA TABELA USERS
-- =====================================================

SELECT 
    '👤 VERIFICAÇÃO NA TABELA USERS' as status,
    id,
    email,
    name,
    role,
    auth_user_id,
    company_id,
    created_at,
    updated_at,
    CASE 
        WHEN role = 'admin' THEN '✅ É ADMIN'
        ELSE '❌ NÃO É ADMIN'
    END as admin_status
FROM public.users 
WHERE email = 'contato@conectell.com.br';

-- 3. VERIFICAR VINCULAÇÃO ENTRE AS TABELAS
-- =====================================================

SELECT 
    '🔗 VERIFICAÇÃO DE VINCULAÇÃO' as status,
    u.email,
    u.role,
    u.auth_user_id as user_auth_id,
    au.id as auth_real_id,
    CASE 
        WHEN u.auth_user_id = au.id THEN '✅ VINCULAÇÃO CORRETA'
        WHEN u.auth_user_id IS NULL THEN '❌ SEM VINCULAÇÃO'
        ELSE '❌ VINCULAÇÃO INCORRETA'
    END as vinculacao_status
FROM public.users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.email = 'contato@conectell.com.br';

-- 4. VERIFICAR CONFIGURAÇÕES DE AUTENTICAÇÃO
-- =====================================================

-- Verificar se RLS está habilitado
SELECT 
    '🛡️ VERIFICAÇÃO RLS' as status,
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESABILITADO'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'companies', 'entries')
ORDER BY tablename;

-- 5. VERIFICAR POLÍTICAS RLS PARA USERS
-- =====================================================

SELECT 
    '📋 POLÍTICAS RLS USERS' as status,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY policyname;

-- 6. TESTAR FUNÇÃO is_admin()
-- =====================================================

SELECT 
    '🧪 TESTE FUNÇÃO is_admin()' as status,
    'Esta função só funciona quando logado' as observacao;

-- Para testar quando logado:
-- SELECT public.is_admin() as resultado_is_admin;

-- 7. VERIFICAR SE HÁ OUTROS USUÁRIOS ADMIN
-- =====================================================

SELECT 
    '👥 OUTROS ADMINS NO SISTEMA' as status,
    COUNT(*) as total_admins
FROM public.users 
WHERE role = 'admin';

SELECT 
    '📝 LISTA DE ADMINS' as status,
    email,
    name,
    role,
    auth_user_id,
    created_at
FROM public.users 
WHERE role = 'admin'
ORDER BY created_at;

-- 8. DIAGNÓSTICO FINAL
-- =====================================================

DO $$
DECLARE
    auth_exists BOOLEAN;
    user_exists BOOLEAN;
    is_confirmed BOOLEAN;
    is_admin_role BOOLEAN;
    has_auth_link BOOLEAN;
BEGIN
    -- Verificar existência no auth
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'contato@conectell.com.br') INTO auth_exists;
    
    -- Verificar existência na tabela users
    SELECT EXISTS(SELECT 1 FROM public.users WHERE email = 'contato@conectell.com.br') INTO user_exists;
    
    -- Verificar se email está confirmado
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE email = 'contato@conectell.com.br' 
        AND email_confirmed_at IS NOT NULL
    ) INTO is_confirmed;
    
    -- Verificar se é admin
    SELECT EXISTS(
        SELECT 1 FROM public.users 
        WHERE email = 'contato@conectell.com.br' 
        AND role = 'admin'
    ) INTO is_admin_role;
    
    -- Verificar vinculação
    SELECT EXISTS(
        SELECT 1 FROM public.users u
        JOIN auth.users au ON u.auth_user_id = au.id
        WHERE u.email = 'contato@conectell.com.br'
    ) INTO has_auth_link;
    
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'DIAGNÓSTICO COMPLETO - contato@conectell.com.br';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Existe no Supabase Auth: %', CASE WHEN auth_exists THEN 'SIM' ELSE 'NÃO' END;
    RAISE NOTICE 'Existe na tabela users: %', CASE WHEN user_exists THEN 'SIM' ELSE 'NÃO' END;
    RAISE NOTICE 'Email confirmado: %', CASE WHEN is_confirmed THEN 'SIM' ELSE 'NÃO' END;
    RAISE NOTICE 'É admin: %', CASE WHEN is_admin_role THEN 'SIM' ELSE 'NÃO' END;
    RAISE NOTICE 'Vinculação correta: %', CASE WHEN has_auth_link THEN 'SIM' ELSE 'NÃO' END;
    RAISE NOTICE '=================================================';
    
    -- Sugestões baseadas no diagnóstico
    IF NOT auth_exists THEN
        RAISE NOTICE '❌ PROBLEMA: Usuário não existe no Supabase Auth';
        RAISE NOTICE '💡 SOLUÇÃO: Criar usuário no Supabase Dashboard ou via signup';
    END IF;
    
    IF auth_exists AND NOT is_confirmed THEN
        RAISE NOTICE '❌ PROBLEMA: Email não confirmado';
        RAISE NOTICE '💡 SOLUÇÃO: Confirmar email ou forçar confirmação no Dashboard';
    END IF;
    
    IF auth_exists AND NOT user_exists THEN
        RAISE NOTICE '❌ PROBLEMA: Usuário não existe na tabela users';
        RAISE NOTICE '💡 SOLUÇÃO: Trigger handle_new_user não funcionou, criar manualmente';
    END IF;
    
    IF user_exists AND NOT is_admin_role THEN
        RAISE NOTICE '❌ PROBLEMA: Usuário não é admin';
        RAISE NOTICE '💡 SOLUÇÃO: Execute o script set_admin_user.sql';
    END IF;
    
    IF NOT has_auth_link THEN
        RAISE NOTICE '❌ PROBLEMA: Vinculação incorreta entre tabelas';
        RAISE NOTICE '💡 SOLUÇÃO: Corrigir auth_user_id na tabela users';
    END IF;
    
    IF auth_exists AND is_confirmed AND user_exists AND is_admin_role AND has_auth_link THEN
        RAISE NOTICE '✅ TUDO CORRETO: Problema pode estar no frontend';
        RAISE NOTICE '💡 VERIFICAR: Configurações do Supabase no código';
    END IF;
END $$;