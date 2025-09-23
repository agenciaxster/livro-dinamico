-- =====================================================
-- SCRIPT DE VERIFICAÇÃO RLS (ROW LEVEL SECURITY)
-- =====================================================

-- 1. VERIFICAR SE RLS ESTÁ HABILITADO
-- =====================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Desabilitado'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'companies', 'entries')
ORDER BY tablename;

-- 2. VERIFICAR POLÍTICAS EXISTENTES
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command_type,
    CASE 
        WHEN qual IS NOT NULL THEN '✅ Política Configurada'
        ELSE '❌ Política Sem Condição'
    END as policy_status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. VERIFICAR FUNÇÕES DE SEGURANÇA
-- =====================================================
SELECT 
    routine_name,
    routine_type,
    security_type,
    CASE 
        WHEN routine_name = 'handle_new_user' THEN '✅ Função de Criação de Usuário'
        WHEN routine_name = 'is_admin' THEN '✅ Função de Verificação Admin'
        ELSE '📋 Outra Função'
    END as function_purpose
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'is_admin')
ORDER BY routine_name;

-- 4. VERIFICAR TRIGGERS
-- =====================================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    CASE 
        WHEN trigger_name = 'on_auth_user_created' THEN '✅ Trigger de Criação Automática'
        ELSE '📋 Outro Trigger'
    END as trigger_purpose
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
OR (trigger_schema = 'auth' AND trigger_name = 'on_auth_user_created')
ORDER BY trigger_name;

-- 5. VERIFICAR ÍNDICES DE PERFORMANCE
-- =====================================================
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef,
    CASE 
        WHEN indexname LIKE '%auth_user_id%' THEN '✅ Índice de Autenticação'
        WHEN indexname LIKE '%user_id%' THEN '✅ Índice de Usuário'
        WHEN indexname LIKE '%email%' THEN '✅ Índice de Email'
        ELSE '📋 Outro Índice'
    END as index_purpose
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'companies', 'entries')
AND indexname NOT LIKE '%pkey'
ORDER BY tablename, indexname;

-- 6. VERIFICAR INTEGRIDADE DOS DADOS
-- =====================================================

-- Contar usuários
SELECT 
    'public.users' as tabela,
    COUNT(*) as total_registros,
    COUNT(auth_user_id) as com_auth_id,
    COUNT(*) - COUNT(auth_user_id) as sem_auth_id
FROM public.users
UNION ALL
SELECT 
    'auth.users' as tabela,
    COUNT(*) as total_registros,
    COUNT(id) as com_auth_id,
    0 as sem_auth_id
FROM auth.users;

-- 7. VERIFICAR PERMISSÕES
-- =====================================================
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type,
    is_grantable,
    CASE 
        WHEN grantee = 'authenticated' THEN '✅ Usuário Autenticado'
        WHEN grantee = 'anon' THEN '⚠️ Usuário Anônimo'
        ELSE '📋 Outro Role'
    END as role_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'companies', 'entries')
ORDER BY table_name, grantee, privilege_type;

-- 8. TESTE DE SEGURANÇA (SIMULAÇÃO)
-- =====================================================

-- Verificar se existe função de teste
DO $$
BEGIN
    -- Verificar se as funções essenciais existem
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        RAISE WARNING '❌ Função handle_new_user não encontrada!';
    ELSE
        RAISE NOTICE '✅ Função handle_new_user encontrada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
        RAISE WARNING '❌ Função is_admin não encontrada!';
    ELSE
        RAISE NOTICE '✅ Função is_admin encontrada';
    END IF;
    
    -- Verificar se o trigger existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
    ) THEN
        RAISE WARNING '❌ Trigger on_auth_user_created não encontrado!';
    ELSE
        RAISE NOTICE '✅ Trigger on_auth_user_created encontrado';
    END IF;
END $$;

-- =====================================================
-- RESUMO DA VERIFICAÇÃO
-- =====================================================

SELECT 
    '🔒 VERIFICAÇÃO DE SEGURANÇA CONCLUÍDA' as status,
    'Verifique os resultados acima para garantir que tudo está configurado corretamente' as instrucoes;