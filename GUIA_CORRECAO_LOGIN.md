# 🔧 Guia de Correção - Problema de Login Admin

## 🚨 Problema Identificado
O usuário `contato@conectell.com.br` não consegue fazer login. Este guia resolve os problemas mais comuns.

## 📋 Passo a Passo para Correção

### 1. 🔍 Diagnóstico Inicial
Execute o script de diagnóstico no **Supabase SQL Editor**:
```sql
-- Copie e cole o conteúdo do arquivo:
database/debug_login_complete.sql
```

### 2. 🏥 Correção Automática
Execute o script de correção no **Supabase SQL Editor**:
```sql
-- Copie e cole o conteúdo do arquivo:
database/fix_admin_login.sql
```

### 3. 👤 Verificar/Criar Usuário no Supabase Auth

#### Se o usuário NÃO EXISTE no Supabase Auth:
1. Acesse o **Supabase Dashboard**
2. Vá para **Authentication > Users**
3. Clique em **"Add user"**
4. Preencha:
   - **Email**: `contato@conectell.com.br`
   - **Password**: (sua senha segura)
   - **Email Confirm**: ✅ **MARCAR COMO CONFIRMADO**
5. Clique em **"Create user"**

#### Se o usuário EXISTE mas email não está confirmado:
1. No **Authentication > Users**
2. Encontre o usuário `contato@conectell.com.br`
3. Clique nos **3 pontos** > **"Send confirmation"**
4. OU execute no SQL Editor:
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'contato@conectell.com.br';
```

### 4. 🔗 Verificar Vinculação das Tabelas
Execute no **SQL Editor** para verificar se está tudo conectado:
```sql
SELECT 
    au.email as auth_email,
    au.email_confirmed_at,
    pu.email as public_email,
    pu.role,
    pu.status,
    pu.is_master_admin,
    CASE 
        WHEN au.id = pu.auth_user_id THEN '✅ VINCULADO'
        ELSE '❌ PROBLEMA NA VINCULAÇÃO'
    END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.auth_user_id
WHERE au.email = 'contato@conectell.com.br';
```

### 5. 🧪 Teste de Login
1. Acesse a aplicação: `http://localhost:8080` (dev) ou `http://localhost:4173` (prod)
2. Tente fazer login com:
   - **Email**: `contato@conectell.com.br`
   - **Password**: (a senha que você definiu)

## 🔍 Problemas Comuns e Soluções

### ❌ Erro: "Email ou senha incorretos"
**Causa**: Email não confirmado ou usuário não existe no auth.users
**Solução**: Seguir passos 3 e 4 acima

### ❌ Erro: "Usuário não encontrado no sistema"
**Causa**: Usuário existe no auth.users mas não na tabela public.users
**Solução**: Execute o script `fix_admin_login.sql`

### ❌ Erro: "Usuário inativo ou pendente"
**Causa**: Status do usuário não está como 'active'
**Solução**: Execute no SQL Editor:
```sql
UPDATE public.users 
SET status = 'active', role = 'admin', is_master_admin = true
WHERE email = 'contato@conectell.com.br';
```

### ❌ Erro: "function is_admin(unknown) does not exist"
**Causa**: Problema de tipo na função is_admin
**Solução**: Execute o script específico:
```sql
-- Copie e cole o conteúdo de: database/fix_is_admin_function.sql
```

### ❌ Erro: "Erro interno do servidor"
**Causa**: Problema na vinculação auth_user_id
**Solução**: Execute no SQL Editor:
```sql
UPDATE public.users 
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'contato@conectell.com.br')
WHERE email = 'contato@conectell.com.br';
```

## 🎯 Verificação Final

Execute este comando para confirmar que tudo está funcionando:
```sql
SELECT 
    '🎉 STATUS FINAL' as resultado,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users au
            JOIN public.users pu ON au.id = pu.auth_user_id
            WHERE au.email = 'contato@conectell.com.br'
            AND au.email_confirmed_at IS NOT NULL
            AND pu.status = 'active'
            AND pu.role = 'admin'
        ) THEN '✅ USUÁRIO ADMIN CONFIGURADO CORRETAMENTE'
        ELSE '❌ AINDA HÁ PROBLEMAS - EXECUTE O DIAGNÓSTICO NOVAMENTE'
    END as status;
```

## 📞 Suporte Adicional

Se o problema persistir:

1. **Execute o diagnóstico completo**:
   ```bash
   # No SQL Editor do Supabase
   \i database/debug_login_complete.sql
   ```

2. **Verifique os logs do navegador**:
   - Abra F12 > Console
   - Tente fazer login
   - Copie qualquer erro que aparecer

3. **Verifique as variáveis de ambiente**:
   ```bash
   # Verifique se estão corretas no arquivo .env
   VITE_SUPABASE_URL=https://udrtuxppnisvbtuzvujr.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 🚀 Próximos Passos Após Correção

1. ✅ Teste o login admin
2. ✅ Verifique se pode acessar todas as funcionalidades
3. ✅ Teste criação de outros usuários
4. ✅ Verifique se as políticas RLS estão funcionando
5. ✅ Faça backup das configurações funcionais

---

**⚠️ IMPORTANTE**: Sempre execute os scripts em ambiente de desenvolvimento primeiro, depois em produção.