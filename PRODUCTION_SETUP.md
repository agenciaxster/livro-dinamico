# 🚀 Guia de Configuração para Produção - Livro Dinâmico

## 📋 Checklist de Produção

### 1. ⚙️ Configuração do Banco de Dados

**Execute o script SQL de produção:**
```sql
-- No Supabase SQL Editor, execute:
\i database/production_setup_tested.sql
```

**Ou copie e cole o conteúdo do arquivo:**
- `database/production_setup_tested.sql`
- (Versão corrigida sem erros de sintaxe)

### 2. 🔐 Configurações de Autenticação no Supabase

**No Dashboard do Supabase > Authentication > Settings:**

#### URL Configuration:
- **Site URL:** `https://seu-dominio.com`
- **Redirect URLs:** 
  - `https://seu-dominio.com/reset-password`
  - `https://seu-dominio.com/auth/callback`

#### Email Templates:
Configure os templates em **Authentication > Email Templates:**

**Confirm Signup:**
```html
<h2>Confirme seu cadastro</h2>
<p>Clique no link abaixo para confirmar sua conta:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Conta</a></p>
```

**Reset Password:**
```html
<h2>Redefinir Senha</h2>
<p>Clique no link abaixo para redefinir sua senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
<p>Se você não solicitou esta alteração, ignore este email.</p>
```

### 3. 🌐 Variáveis de Ambiente

**Atualize o arquivo `.env.production`:**
```env
VITE_SUPABASE_URL=https://udrtuxppnisvbtuzvujr.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
VITE_APP_ENV=production
VITE_SITE_URL=https://seu-dominio.com
VITE_REDIRECT_URL=https://seu-dominio.com/reset-password
```

### 4. 🔒 Configurações de Segurança

#### Row Level Security (RLS):
✅ Habilitado em todas as tabelas principais
✅ Políticas configuradas para usuários e admins
✅ Isolamento de dados por usuário

#### Políticas Implementadas:
- **Users:** Usuários veem apenas seus próprios dados
- **Companies:** Acesso restrito ao proprietário
- **Entries:** Lançamentos isolados por usuário
- **Admin:** Acesso total para administradores

### 5. 📊 Verificações de Integridade

**Execute estas consultas para verificar:**

```sql
-- Verificar usuários
SELECT COUNT(*) as total_users FROM public.users;
SELECT COUNT(*) as auth_users FROM auth.users;

-- Verificar RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Verificar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 6. 🧪 Testes de Produção

#### Fluxo de Autenticação:
1. **Registro de usuário**
   - [ ] Criar conta com email/senha
   - [ ] Verificar criação automática na tabela `users`
   - [ ] Confirmar email (se habilitado)

2. **Login/Logout**
   - [ ] Login com credenciais válidas
   - [ ] Logout e limpeza de sessão
   - [ ] Redirecionamentos corretos

3. **Recuperação de Senha**
   - [ ] Solicitar reset de senha
   - [ ] Receber email com link
   - [ ] Redefinir senha com sucesso
   - [ ] Login com nova senha

4. **Autorização**
   - [ ] Usuário vê apenas seus dados
   - [ ] Admin vê todos os dados
   - [ ] Tentativas de acesso negadas corretamente

### 7. 🚀 Deploy

#### Build para Produção:
```bash
npm run build
```

#### Variáveis de Ambiente no Servidor:
Certifique-se de configurar as variáveis no seu provedor de hosting:
- Vercel: `vercel.json` ou dashboard
- Netlify: `netlify.toml` ou dashboard
- Outros: Arquivo `.env.production`

### 8. 📈 Monitoramento

#### Logs do Supabase:
- Monitore logs de autenticação
- Verifique erros de RLS
- Acompanhe performance das queries

#### Métricas Importantes:
- Taxa de registro de usuários
- Tempo de resposta das APIs
- Erros de autenticação
- Uso do banco de dados

### 9. 🔧 Manutenção

#### Backup Regular:
```sql
-- Backup das tabelas principais
pg_dump -h seu-host -U postgres -t public.users > backup_users.sql
pg_dump -h seu-host -U postgres -t public.companies > backup_companies.sql
pg_dump -h seu-host -U postgres -t public.entries > backup_entries.sql
```

#### Limpeza Periódica:
```sql
-- Remover sessões expiradas (executar semanalmente)
DELETE FROM auth.sessions WHERE expires_at < NOW();

-- Verificar usuários órfãos
SELECT * FROM public.users WHERE auth_user_id NOT IN (SELECT id FROM auth.users);
```

### 10. 🆘 Troubleshooting

#### Problemas Comuns:

**Erro "Database error creating new user":**
- Verificar se o trigger `on_auth_user_created` está ativo
- Confirmar se a função `handle_new_user()` existe
- Verificar permissões da tabela `users`

**RLS bloqueando acesso:**
- Verificar se as políticas estão corretas
- Confirmar se o usuário está autenticado
- Verificar se `auth.uid()` retorna valor válido

**Email não enviado:**
- Verificar configurações SMTP no Supabase
- Confirmar templates de email
- Verificar URLs de redirecionamento

---

## ✅ Checklist Final

- [ ] Script SQL executado com sucesso
- [ ] Configurações de autenticação atualizadas
- [ ] Templates de email configurados
- [ ] Variáveis de ambiente definidas
- [ ] RLS habilitado e testado
- [ ] Fluxo de autenticação testado
- [ ] Build de produção gerado
- [ ] Deploy realizado
- [ ] Monitoramento configurado

**🎉 Parabéns! Seu sistema está pronto para produção!**