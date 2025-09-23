-- =====================================================
-- SCRIPT PARA DEFINIR USUÁRIO COMO ADMIN
-- Email: contato@conectell.com.br
-- =====================================================

-- Verificar se o usuário existe na tabela users
DO $$
DECLARE
    user_exists BOOLEAN;
    user_id_found UUID;
    current_role TEXT;
BEGIN
    -- Verificar se o usuário existe
    SELECT EXISTS(
        SELECT 1 FROM public.users 
        WHERE email = 'contato@conectell.com.br'
    ) INTO user_exists;
    
    IF user_exists THEN
        -- Obter informações atuais do usuário
        SELECT id, role INTO user_id_found, current_role
        FROM public.users 
        WHERE email = 'contato@conectell.com.br';
        
        RAISE NOTICE 'Usuário encontrado: %', 'contato@conectell.com.br';
        RAISE NOTICE 'ID do usuário: %', user_id_found;
        RAISE NOTICE 'Role atual: %', current_role;
        
        -- Atualizar para admin se não for admin
        IF current_role != 'admin' THEN
            UPDATE public.users 
            SET 
                role = 'admin',
                updated_at = NOW()
            WHERE email = 'contato@conectell.com.br';
            
            RAISE NOTICE 'Usuário % alterado de % para admin com sucesso!', 'contato@conectell.com.br', current_role;
        ELSE
            RAISE NOTICE 'Usuário % já é admin!', 'contato@conectell.com.br';
        END IF;
    ELSE
        RAISE WARNING 'Usuário % não encontrado na tabela users!', 'contato@conectell.com.br';
        RAISE NOTICE 'Verifique se o usuário foi criado através do Supabase Auth';
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Mostrar informações finais do usuário
DO $$
DECLARE
    user_info RECORD;
BEGIN
    SELECT id, email, name, role, created_at, updated_at
    INTO user_info
    FROM public.users 
    WHERE email = 'contato@conectell.com.br';
    
    IF FOUND THEN
        RAISE NOTICE '=================================================';
        RAISE NOTICE 'INFORMAÇÕES DO USUÁRIO ADMIN:';
        RAISE NOTICE '=================================================';
        RAISE NOTICE 'ID: %', user_info.id;
        RAISE NOTICE 'Email: %', user_info.email;
        RAISE NOTICE 'Nome: %', user_info.name;
        RAISE NOTICE 'Role: %', user_info.role;
        RAISE NOTICE 'Criado em: %', user_info.created_at;
        RAISE NOTICE 'Atualizado em: %', user_info.updated_at;
        RAISE NOTICE '=================================================';
    END IF;
END $$;

-- =====================================================
-- TESTE DA FUNÇÃO is_admin()
-- =====================================================

-- Verificar se a função is_admin() está funcionando
-- (Este teste só funcionará se você estiver logado como este usuário)
DO $$
BEGIN
    RAISE NOTICE 'Para testar a função is_admin():';
    RAISE NOTICE '1. Faça login com contato@conectell.com.br';
    RAISE NOTICE '2. Execute: SELECT public.is_admin();';
    RAISE NOTICE '3. Deve retornar TRUE se tudo estiver correto';
END $$;

-- =====================================================
-- INSTRUÇÕES ADICIONAIS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. ✅ Usuário definido como admin';
    RAISE NOTICE '2. 🔐 Faça login com contato@conectell.com.br';
    RAISE NOTICE '3. 🧪 Teste as funcionalidades administrativas';
    RAISE NOTICE '4. 📊 Verifique se pode acessar dados de todas as empresas';
    RAISE NOTICE '';
    RAISE NOTICE 'OBSERVAÇÃO: Se o usuário não existir, ele precisa:';
    RAISE NOTICE '- Fazer o primeiro login via Supabase Auth';
    RAISE NOTICE '- O trigger handle_new_user() criará o registro automaticamente';
    RAISE NOTICE '- Depois execute este script novamente';
END $$;