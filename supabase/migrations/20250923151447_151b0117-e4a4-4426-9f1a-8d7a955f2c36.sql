-- Resetar senha do usuário admin
UPDATE auth.users 
SET 
  encrypted_password = crypt('admin123', gen_salt('bf')),
  email_confirmed_at = now(),
  confirmed_at = now()
WHERE email = 'contato@conectell.com.br';