-- =====================================================
-- DIAGNÓSTICO COMPLETO DO PROBLEMA DE LOGIN ADMIN
-- =====================================================
-- Execute este script no SQL Editor do Supabase para diagnosticar o problema

-- 1. VERIFICAR SE O USUÁRIO EXISTE NO SUPABASE AUTH
SELECT 
    'VERIFICAÇÃO AUTH.USERS' as secao,
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'contato@conectell.com.br';

-- 2. VERIFICAR SE O USUÁRIO EXISTE NA TABELA PUBLIC.USERS
SELECT 
    'VERIFICAÇÃO PUBLIC.USERS' as secao,
    id,
    auth_user_id,
    name,
    email,
    role,
    status,
    is_master_admin,
    company_id,
    created_at
FROM public.users 
WHERE email = 'contato@conectell.com.br';

-- 3. VERIFICAR VINCULAÇÃO ENTRE AS TABELAS
SELECT 
    'VINCULAÇÃO ENTRE TABELAS' as secao,
    au.id as auth_id,
    au.email as auth_email,
    au.email_confirmed_at,
    pu.id as public_id,
    pu.auth_user_id,
    pu.email as public_email,
    pu.role,
    pu.status,
    pu.is_master_admin,
    CASE 
        WHEN au.id = pu.auth_user_id THEN 'VINCULADO CORRETAMENTE'
        WHEN au.id IS NULL THEN 'USUÁRIO NÃO EXISTE NO AUTH'
        WHEN pu.auth_user_id IS NULL THEN 'AUTH_USER_ID NULO'
        ELSE 'VINCULAÇÃO INCORRETA'
    END as status_vinculacao
FROM auth.users au
FULL OUTER JOIN public.users pu ON au.id = pu.auth_user_id
WHERE au.email = 'contato@conectell.com.br' OR pu.email = 'contato@conectell.com.br';

-- 4. VERIFICAR SE O EMAIL ESTÁ CONFIRMADO
SELECT 
    'STATUS DE CONFIRMAÇÃO' as secao,
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'EMAIL CONFIRMADO'
        ELSE 'EMAIL NÃO CONFIRMADO - ESTE É O PROBLEMA!'
    END as status_confirmacao
FROM auth.users 
WHERE email = 'contato@conectell.com.br';

-- 5. VERIFICAR POLÍTICAS RLS NA TABELA USERS
SELECT 
    'POLÍTICAS RLS USERS' as secao,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- 6. TESTAR A FUNÇÃO IS_ADMIN (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
        -- Se a função existe, teste com o usuário
        RAISE NOTICE 'Testando função is_admin...';
    ELSE
        RAISE NOTICE 'Função is_admin não encontrada';
    END IF;
END $$;

-- 7. VERIFICAR OUTROS ADMINISTRADORES
SELECT 
    'OUTROS ADMINISTRADORES' as secao,
    pu.email,
    pu.role,
    pu.is_master_admin,
    pu.status,
    au.email_confirmed_at,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL THEN 'CONFIRMADO'
        ELSE 'NÃO CONFIRMADO'
    END as status_email
FROM public.users pu
LEFT JOIN auth.users au ON pu.auth_user_id = au.id
WHERE pu.role = 'admin' OR pu.is_master_admin = true;

-- 8. VERIFICAR ESTRUTURA DA TABELA USERS
SELECT 
    'ESTRUTURA TABELA USERS' as secao,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. VERIFICAR SE EXISTE TRIGGER PARA NOVOS USUÁRIOS
SELECT 
    'TRIGGERS NA TABELA AUTH.USERS' as secao,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND event_object_schema = 'auth';

-- 10. DIAGNÓSTICO FINAL E SOLUÇÕES
SELECT 
    'DIAGNÓSTICO FINAL' as secao,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'contato@conectell.com.br') 
        THEN 'PROBLEMA: Usuário não existe no Supabase Auth. SOLUÇÃO: Criar usuário no Authentication > Users do dashboard.'
        
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'contato@conectell.com.br' AND email_confirmed_at IS NULL)
        THEN 'PROBLEMA: Email não confirmado. SOLUÇÃO: Confirmar email no dashboard ou enviar link de confirmação.'
        
        WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'contato@conectell.com.br')
        THEN 'PROBLEMA: Usuário não existe na tabela public.users. SOLUÇÃO: Executar trigger ou criar manualmente.'
        
        WHEN EXISTS (
            SELECT 1 FROM public.users pu 
            LEFT JOIN auth.users au ON pu.auth_user_id = au.id 
            WHERE pu.email = 'contato@conectell.com.br' AND au.id IS NULL
        )
        THEN 'PROBLEMA: auth_user_id não vinculado. SOLUÇÃO: Atualizar auth_user_id na tabela public.users.'
        
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email = 'contato@conectell.com.br' AND status != 'active')
        THEN 'PROBLEMA: Usuário inativo. SOLUÇÃO: Ativar usuário na tabela public.users.'
        
        ELSE 'USUÁRIO PARECE ESTAR CONFIGURADO CORRETAMENTE. Verificar logs de erro no frontend.'
    END as diagnostico;

-- =====================================================
-- SCRIPTS DE CORREÇÃO AUTOMÁTICA
-- =====================================================

-- SCRIPT 1: Se o usuário não existe no auth.users, você precisa criar no dashboard
-- SCRIPT 2: Se o email não está confirmado, execute:
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'contato@conectell.com.br';

-- SCRIPT 3: Se o usuário não existe no public.users, execute:
/*
INSERT INTO public.users (
    auth_user_id,
    name,
    email,
    role,
    status,
    is_master_admin,
    company_id,
    created_at,
    updated_at
) 
SELECT 
    au.id,
    'Admin Conectell',
    'contato@conectell.com.br',
    'admin',
    'active',
    true,
    '550e8400-e29b-41d4-a716-446655440000', -- ID da empresa padrão
    NOW(),
    NOW()
FROM auth.users au 
WHERE au.email = 'contato@conectell.com.br'
AND NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'contato@conectell.com.br');
*/

-- SCRIPT 4: Se auth_user_id não está vinculado, execute:
/*
UPDATE public.users 
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'contato@conectell.com.br')
WHERE email = 'contato@conectell.com.br' AND auth_user_id IS NULL;
*/

-- SCRIPT 5: Se o usuário está inativo, execute:
/*
UPDATE public.users 
SET status = 'active', role = 'admin', is_master_admin = true
WHERE email = 'contato@conectell.com.br';
*/