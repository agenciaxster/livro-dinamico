# Configuração do Supabase Auth

## Passos para completar a integração

### 1. Executar o script SQL no Supabase

Execute o arquivo `database/fix_auth.sql` no seu banco de dados Supabase:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para o seu projeto
3. Navegue até **SQL Editor**
4. Copie e cole o conteúdo do arquivo `database/fix_auth.sql`
5. Execute o script

### 2. Criar usuário admin no Supabase Auth

Após executar o script SQL:

1. No Supabase Dashboard, vá para **Authentication** > **Users**
2. Clique em **Add user**
3. Preencha os dados:
   - **Email**: admin@conectell.com.br (ou outro email de sua preferência)
   - **Password**: admin123 (ou outra senha segura)
   - **Email Confirm**: Marque como confirmado
4. Clique em **Create user**

### 3. Atualizar o usuário na tabela users

Após criar o usuário no Auth:

1. Vá para **Table Editor** > **users**
2. Encontre o usuário criado (será criado automaticamente pelo trigger)
3. Edite o registro e defina:
   - **is_master_admin**: true
   - **role**: admin
   - **status**: active

### 4. Testar o login

1. Acesse a aplicação em `http://localhost:8080`
2. Faça login com as credenciais criadas
3. Verifique se o login funciona corretamente

## Mudanças realizadas

- ✅ Removido bcryptjs e dependências relacionadas
- ✅ Atualizado authService.ts para usar Supabase Auth nativo
- ✅ Atualizado AuthContext.tsx para nova assinatura de métodos
- ✅ Criado script SQL para migração da autenticação
- ✅ Adicionada coluna auth_user_id na tabela users
- ✅ Criado trigger para sincronização automática de usuários
- ✅ Atualizadas políticas RLS para usar auth.uid()

## Observações importantes

- O usuário `admin@conectell.com.br` foi removido da tabela users
- Agora todos os usuários devem ser criados através do Supabase Auth
- As senhas são gerenciadas pelo Supabase, não mais armazenadas com hash local
- O sistema mantém compatibilidade com usuários existentes através do fallback por email