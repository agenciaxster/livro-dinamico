-- =====================================================
-- TESTE RÁPIDO DE CONFIGURAÇÃO
-- Execute este script para verificar se tudo está OK
-- =====================================================

-- Verificar se as tabelas existem
SELECT 
    'users' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
         THEN '✅ Existe' 
         ELSE '❌ Não existe' 
    END as status
UNION ALL
SELECT 
    'companies' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') 
         THEN '✅ Existe' 
         ELSE '❌ Não existe' 
    END as status
UNION ALL
SELECT 
    'entries' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'entries') 
         THEN '✅ Existe' 
         ELSE '❌ Não existe' 
    END as status
UNION ALL
SELECT 
    'categories' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') 
         THEN '✅ Existe' 
         ELSE '❌ Não existe' 
    END as status
UNION ALL
SELECT 
    'accounts' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts') 
         THEN '✅ Existe' 
         ELSE '❌ Não existe' 
    END as status
UNION ALL
SELECT 
    'expenses' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expenses') 
         THEN '✅ Existe' 
         ELSE '❌ Não existe' 
    END as status;

-- Verificar se RLS está habilitado
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '✅ RLS Habilitado' ELSE '❌ RLS Desabilitado' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'companies', 'entries', 'categories', 'accounts', 'expenses')
ORDER BY tablename;

-- Verificar se as funções existem
SELECT 
    'handle_new_user' as funcao,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') 
         THEN '✅ Existe' 
         ELSE '❌ Não existe' 
    END as status
UNION ALL
SELECT 
    'is_admin' as funcao,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') 
         THEN '✅ Existe' 
         ELSE '❌ Não existe' 
    END as status;

-- Verificar se o trigger existe
SELECT 
    'on_auth_user_created' as trigger_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
    ) THEN '✅ Existe' ELSE '❌ Não existe' END as status;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    '✅ Política ativa' as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'companies', 'entries', 'categories', 'accounts', 'expenses')
ORDER BY tablename, policyname;

-- Verificar índices importantes
SELECT 
    indexname,
    tablename,
    '✅ Índice criado' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Resumo final
SELECT 
    '🎉 TESTE CONCLUÍDO' as resultado,
    'Verifique os resultados acima' as instrucoes;