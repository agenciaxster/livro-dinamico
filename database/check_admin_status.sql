-- =====================================================
-- VERIFICAÇÃO RÁPIDA DO STATUS DE ADMIN
-- Email: contato@conectell.com.br
-- =====================================================

-- Verificar informações do usuário
SELECT 
    'INFORMAÇÕES DO USUÁRIO' as tipo,
    id,
    email,
    name,
    role,
    CASE 
        WHEN role = 'admin' THEN '✅ É ADMIN'
        ELSE '❌ NÃO É ADMIN'
    END as status_admin,
    created_at,
    updated_at
FROM public.users 
WHERE email = 'contato@conectell.com.br';

-- Verificar se existe na tabela auth.users também
SELECT 
    'USUÁRIO NO SUPABASE AUTH' as tipo,
    id as auth_id,
    email,
    email_confirmed_at,
    created_at as auth_created_at
FROM auth.users 
WHERE email = 'contato@conectell.com.br';

-- Verificar relação entre as tabelas
SELECT 
    'RELAÇÃO ENTRE TABELAS' as tipo,
    u.id as user_id,
    u.email,
    u.role,
    u.auth_user_id,
    au.id as auth_id,
    CASE 
        WHEN u.auth_user_id = au.id THEN '✅ VINCULADO CORRETAMENTE'
        ELSE '❌ PROBLEMA NA VINCULAÇÃO'
    END as vinculacao_status
FROM public.users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.email = 'contato@conectell.com.br';

-- Contar total de admins no sistema
SELECT 
    'TOTAL DE ADMINS NO SISTEMA' as info,
    COUNT(*) as total_admins
FROM public.users 
WHERE role = 'admin';

-- Listar todos os admins
SELECT 
    'LISTA DE TODOS OS ADMINS' as tipo,
    email,
    name,
    role,
    created_at
FROM public.users 
WHERE role = 'admin'
ORDER BY created_at;