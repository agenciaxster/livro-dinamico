-- =====================================================
-- SCRIPT DE CORREÇÃO AUTOMÁTICA PARA LOGIN ADMIN
-- =====================================================
-- Execute este script APÓS executar o debug_login_complete.sql

-- 1. CONFIRMAR EMAIL SE NÃO ESTIVER CONFIRMADO
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'contato@conectell.com.br' 
AND email_confirmed_at IS NULL;

-- Verificar se foi atualizado
SELECT 
    'EMAIL CONFIRMADO' as status,
    email,
    email_confirmed_at
FROM auth.users 
WHERE email = 'contato@conectell.com.br';

-- 2. CRIAR USUÁRIO NA TABELA PUBLIC.USERS SE NÃO EXISTIR
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

-- 3. ATUALIZAR AUTH_USER_ID SE ESTIVER NULO OU INCORRETO
UPDATE public.users 
SET 
    auth_user_id = (SELECT id FROM auth.users WHERE email = 'contato@conectell.com.br'),
    updated_at = NOW()
WHERE email = 'contato@conectell.com.br' 
AND (
    auth_user_id IS NULL 
    OR auth_user_id != (SELECT id FROM auth.users WHERE email = 'contato@conectell.com.br')
);

-- 4. GARANTIR QUE O USUÁRIO SEJA ADMIN E ESTEJA ATIVO
UPDATE public.users 
SET 
    role = 'admin',
    status = 'active',
    is_master_admin = true,
    updated_at = NOW()
WHERE email = 'contato@conectell.com.br';

-- 5. VERIFICAR SE A EMPRESA PADRÃO EXISTE
INSERT INTO public.companies (
    id,
    name,
    is_active,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Conectell',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 6. VERIFICAÇÃO FINAL
SELECT 
    'VERIFICAÇÃO FINAL' as secao,
    au.email as auth_email,
    au.email_confirmed_at,
    pu.email as public_email,
    pu.role,
    pu.status,
    pu.is_master_admin,
    pu.auth_user_id,
    CASE 
        WHEN au.id = pu.auth_user_id AND au.email_confirmed_at IS NOT NULL AND pu.status = 'active' AND pu.role = 'admin'
        THEN '✅ USUÁRIO CONFIGURADO CORRETAMENTE'
        ELSE '❌ AINDA HÁ PROBLEMAS'
    END as resultado
FROM auth.users au
JOIN public.users pu ON au.id = pu.auth_user_id
WHERE au.email = 'contato@conectell.com.br';

-- 7. TESTAR A FUNÇÃO IS_ADMIN (se existir)
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
        -- Testar se a função is_admin existe e funciona
        IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
            -- Usar cast explícito para UUID
            EXECUTE format('SELECT is_admin(%L::uuid)', user_auth_id) INTO admin_result;
            RAISE NOTICE 'Função is_admin retornou: %', admin_result;
        ELSE
            RAISE NOTICE 'Função is_admin não encontrada';
        END IF;
    ELSE
        RAISE NOTICE 'auth_user_id não encontrado para o usuário';
    END IF;
END $$;

-- 8. CRIAR FUNÇÃO IS_ADMIN SE NÃO EXISTIR
CREATE OR REPLACE FUNCTION public.is_admin(user_auth_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.users 
        WHERE auth_user_id = user_auth_id 
        AND (role = 'admin' OR is_master_admin = true)
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. VERIFICAR POLÍTICAS RLS
-- Recriar políticas básicas se necessário
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_user_id = auth.uid() 
            AND (role = 'admin' OR is_master_admin = true)
            AND status = 'active'
        )
    );

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can manage users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_user_id = auth.uid() 
            AND (role = 'admin' OR is_master_admin = true)
            AND status = 'active'
        )
    );

-- 10. RESULTADO FINAL
SELECT 
    '🎉 CORREÇÃO CONCLUÍDA' as status,
    'Execute o debug_login_complete.sql novamente para verificar se tudo está funcionando' as proximos_passos;

-- =====================================================
-- INSTRUÇÕES PARA TESTE
-- =====================================================
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Vá para Authentication > Users no dashboard
-- 3. Verifique se o usuário contato@conectell.com.br existe e está confirmado
-- 4. Se não existir, clique em "Add user" e crie com:
--    - Email: contato@conectell.com.br
--    - Password: (sua senha)
--    - Email Confirm: ✅ (marcar como confirmado)
-- 5. Teste o login na aplicação
-- 6. Se ainda não funcionar, execute debug_login_complete.sql para mais detalhes