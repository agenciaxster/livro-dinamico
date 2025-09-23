# Solução para Erro: "Failed to create user: Database error creating new user"

## Problema
Ao tentar criar um usuário no Supabase Auth Dashboard, aparece o erro:
```
Failed to create user: Database error creating new userFailed
```

## Solução Passo a Passo

### 1. Execute o Script SQL Simplificado

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para o seu projeto
3. Navegue até **SQL Editor**
4. Copie e cole o conteúdo do arquivo `database/simple_auth_fix.sql`
5. Clique em **Run** para executar o script

### 2. Verificar Configurações de Autenticação

1. No Supabase Dashboard, vá para **Authentication** > **Settings**
2. Verifique se as seguintes configurações estão corretas:
   - **Enable email confirmations**: Pode estar desabilitado para testes
   - **Enable phone confirmations**: Desabilitado
   - **Enable custom SMTP**: Opcional

### 3. Tentar Criar Usuário Novamente

1. Vá para **Authentication** > **Users**
2. Clique em **Add user**
3. Preencha:
   - **Email**: admin@conectell.com.br
   - **Password**: admin123
   - **Email Confirm**: ✅ Marque como confirmado
   - **Auto Confirm User**: ✅ Marque esta opção
4. Clique em **Create user**

### 4. Verificar se o Usuário foi Criado

1. Vá para **Table Editor** > **users**
2. Verifique se o usuário apareceu na tabela
3. Se necessário, edite o registro:
   - **is_master_admin**: true
   - **role**: admin
   - **status**: active

## Soluções Alternativas

### Se ainda der erro, tente:

1. **Desabilitar RLS temporariamente**:
   ```sql
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   ```

2. **Criar usuário manualmente**:
   ```sql
   -- Primeiro, crie no auth.users (substitua os valores)
   INSERT INTO auth.users (
     instance_id,
     id,
     aud,
     role,
     email,
     encrypted_password,
     email_confirmed_at,
     created_at,
     updated_at,
     confirmation_token,
     email_change,
     email_change_token_new,
     recovery_token
   ) VALUES (
     '00000000-0000-0000-0000-000000000000',
     gen_random_uuid(),
     'authenticated',
     'authenticated',
     'admin@conectell.com.br',
     crypt('admin123', gen_salt('bf')),
     now(),
     now(),
     now(),
     '',
     '',
     '',
     ''
   );
   ```

3. **Reabilitar RLS**:
   ```sql
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
   ```

## Verificação Final

Após resolver o problema:

1. Acesse `http://localhost:8081`
2. Tente fazer login com:
   - **Email**: admin@conectell.com.br
   - **Senha**: admin123
3. Verifique se o login funciona corretamente

## Logs para Diagnóstico

Se o problema persistir, verifique os logs:

1. No Supabase Dashboard, vá para **Logs**
2. Procure por erros relacionados a:
   - `auth.users`
   - `public.users`
   - `handle_new_user`
   - `trigger`