# 👑 Configuração de Usuário Admin - Livro Dinâmico

## 🎯 Objetivo
Transformar o usuário `contato@conectell.com.br` em administrador do sistema.

## 📋 Scripts Criados

### 1. Script Principal: `set_admin_user.sql`
**Localização:** `database/set_admin_user.sql`

**Funcionalidades:**
- ✅ Verifica se o usuário existe na tabela `users`
- ✅ Mostra informações atuais do usuário
- ✅ Altera o `role` para `'admin'`
- ✅ Atualiza o timestamp `updated_at`
- ✅ Fornece feedback detalhado do processo

### 2. Script de Verificação: `check_admin_status.sql`
**Localização:** `database/check_admin_status.sql`

**Funcionalidades:**
- 🔍 Verifica informações do usuário na tabela `users`
- 🔍 Verifica se existe na tabela `auth.users`
- 🔍 Confirma a vinculação entre as tabelas
- 🔍 Lista todos os admins do sistema
- 🔍 Mostra estatísticas de administradores

## 🚀 Como Usar

### Passo 1: Execute o Script Principal
```sql
-- No Supabase SQL Editor, copie e cole o conteúdo de:
-- database/set_admin_user.sql
```

### Passo 2: Verifique o Resultado
```sql
-- Execute o script de verificação:
-- database/check_admin_status.sql
```

### Passo 3: Teste a Função Admin
```sql
-- Após fazer login como contato@conectell.com.br, execute:
SELECT public.is_admin();
-- Deve retornar: true
```

## 📊 Estrutura de Roles

### Roles Disponíveis:
- `'admin'` - Administrador completo
- `'user'` - Usuário padrão
- `'viewer'` - Apenas visualização
- `'cliente'` - Cliente externo

### Privilégios do Admin:
- ✅ Ver todos os usuários do sistema
- ✅ Atualizar qualquer usuário
- ✅ Deletar usuários
- ✅ Acessar dados de todas as empresas
- ✅ Função `is_admin()` retorna `true`

## 🔧 Troubleshooting

### Problema: Usuário não encontrado
**Causa:** O usuário ainda não fez login via Supabase Auth

**Solução:**
1. O usuário deve fazer o primeiro login em: `https://seuapp.com/login`
2. O trigger `handle_new_user()` criará automaticamente o registro
3. Execute o script `set_admin_user.sql` novamente

### Problema: Usuário existe mas não é admin
**Causa:** O script não foi executado ou houve erro

**Solução:**
1. Execute `check_admin_status.sql` para verificar o status atual
2. Execute `set_admin_user.sql` novamente
3. Verifique os logs do Supabase para erros

### Problema: Função is_admin() retorna false
**Causa:** Possível problema na vinculação auth_user_id

**Solução:**
1. Execute `check_admin_status.sql` para verificar a vinculação
2. Verifique se `auth_user_id` está correto na tabela `users`
3. Se necessário, execute o script de produção completo

## 📝 Logs Esperados

### Ao executar `set_admin_user.sql`:
```
NOTICE: Usuário encontrado: contato@conectell.com.br
NOTICE: ID do usuário: [uuid]
NOTICE: Role atual: user
NOTICE: Usuário contato@conectell.com.br alterado de user para admin com sucesso!
NOTICE: =================================================
NOTICE: INFORMAÇÕES DO USUÁRIO ADMIN:
NOTICE: =================================================
NOTICE: ID: [uuid]
NOTICE: Email: contato@conectell.com.br
NOTICE: Nome: [nome]
NOTICE: Role: admin
NOTICE: Criado em: [timestamp]
NOTICE: Atualizado em: [timestamp]
NOTICE: =================================================
```

### Ao executar `check_admin_status.sql`:
```
INFORMAÇÕES DO USUÁRIO | id | email | name | role | ✅ É ADMIN | created_at | updated_at
USUÁRIO NO SUPABASE AUTH | auth_id | email | email_confirmed_at | auth_created_at
RELAÇÃO ENTRE TABELAS | user_id | email | admin | auth_user_id | auth_id | ✅ VINCULADO CORRETAMENTE
```

## 🔐 Segurança

### Políticas RLS Aplicadas:
- **Admins podem ver todos os usuários**
- **Admins podem atualizar todos os usuários**
- **Admins podem deletar usuários**
- **Função `is_admin()` verifica privilégios**

### Verificações de Segurança:
- ✅ Apenas usuários autenticados podem executar funções admin
- ✅ RLS protege dados sensíveis
- ✅ Logs de auditoria para mudanças de role
- ✅ Vinculação segura com Supabase Auth

## 📞 Suporte

### Se o usuário ainda não aparecer como admin:

1. **Verifique se o usuário existe:**
   ```sql
   SELECT * FROM public.users WHERE email = 'contato@conectell.com.br';
   ```

2. **Verifique se existe no Supabase Auth:**
   ```sql
   SELECT * FROM auth.users WHERE email = 'contato@conectell.com.br';
   ```

3. **Force a criação se necessário:**
   - Usuário deve fazer login uma vez
   - Ou execute o script de produção completo

4. **Verifique permissões:**
   ```sql
   SELECT public.is_admin(); -- Deve retornar true quando logado como admin
   ```

---

## ✅ Status Final

**Usuário:** `contato@conectell.com.br`
**Status:** 👑 **ADMIN CONFIGURADO**
**Scripts:** ✅ **PRONTOS PARA EXECUÇÃO**
**Documentação:** ✅ **COMPLETA**

### Próximos Passos:
1. Execute `database/set_admin_user.sql` no Supabase
2. Verifique com `database/check_admin_status.sql`
3. Teste fazendo login como admin
4. Confirme acesso às funcionalidades administrativas