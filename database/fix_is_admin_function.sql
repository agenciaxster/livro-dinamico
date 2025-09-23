-- =====================================================
-- CORREÇÃO ESPECÍFICA PARA FUNÇÃO IS_ADMIN
-- =====================================================
-- Execute este script para corrigir o erro da função is_admin

-- 1. REMOVER FUNÇÃO EXISTENTE SE HOUVER PROBLEMA
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.is_admin();

-- 2. CRIAR FUNÇÃO IS_ADMIN CORRIGIDA
CREATE OR REPLACE FUNCTION public.is_admin(user_auth_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
    -- Verificar se o usuário é admin ou master admin
    RETURN EXISTS (
        SELECT 1 
        FROM public.users 
        WHERE auth_user_id = user_auth_id 
        AND (role = 'admin' OR is_master_admin = true)
        AND status = 'active'
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, retornar false
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TESTAR A FUNÇÃO COM O USUÁRIO ADMIN
DO $$
DECLARE
    admin_result boolean;
    user_auth_id uuid;
BEGIN
    -- Buscar o auth_user_id do usuário
    SELECT auth_user_id INTO user_auth_id 
    FROM public.users 
    WHERE email = 'contato@conectell.com.br';
    
    IF user_auth_id IS NOT NULL THEN
        -- Testar a função is_admin
        SELECT public.is_admin(user_auth_id) INTO admin_result;
        RAISE NOTICE 'Usuário: contato@conectell.com.br';
        RAISE NOTICE 'Auth User ID: %', user_auth_id;
        RAISE NOTICE 'Função is_admin retornou: %', admin_result;
        
        -- Testar também sem parâmetro (usando auth.uid())
        RAISE NOTICE 'Testando is_admin() sem parâmetro...';
        -- Nota: Este teste só funcionará se executado em contexto autenticado
        
    ELSE
        RAISE NOTICE 'ERRO: auth_user_id não encontrado para contato@conectell.com.br';
        RAISE NOTICE 'Execute primeiro o script fix_admin_login.sql';
    END IF;
END $$;

-- 4. VERIFICAR DADOS DO USUÁRIO
SELECT 
    'DADOS DO USUÁRIO ADMIN' as secao,
    u.email,
    u.role,
    u.status,
    u.is_master_admin,
    u.auth_user_id,
    au.email_confirmed_at,
    CASE 
        WHEN u.auth_user_id IS NOT NULL AND au.email_confirmed_at IS NOT NULL 
        THEN '✅ CONFIGURADO CORRETAMENTE'
        ELSE '❌ PROBLEMA NA CONFIGURAÇÃO'
    END as status_config
FROM public.users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.email = 'contato@conectell.com.br';

-- 5. TESTAR FUNÇÃO COM DIFERENTES CENÁRIOS
SELECT 
    'TESTE DA FUNÇÃO IS_ADMIN' as secao,
    email,
    role,
    is_master_admin,
    status,
    public.is_admin(auth_user_id) as resultado_is_admin
FROM public.users 
WHERE email = 'contato@conectell.com.br';

-- 6. RESULTADO FINAL
SELECT 
    '🎉 FUNÇÃO IS_ADMIN CORRIGIDA' as status,
    'A função agora deve funcionar corretamente com tipos UUID' as resultado;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Verifique se não há mais erros de tipo
-- 3. Execute novamente o script fix_admin_login.sql se necessário
-- 4. Teste o login na aplicação