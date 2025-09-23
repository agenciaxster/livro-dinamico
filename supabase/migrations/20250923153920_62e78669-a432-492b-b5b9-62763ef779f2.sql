-- Criar admin user com senha específica
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
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
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('admin123', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW();

-- Atualizar usuário na tabela public.users para corresponder
INSERT INTO public.users (
  id,
  auth_user_id,
  name,
  email,
  role,
  status,
  is_master_admin,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'admin@conectell.com.br'),
  'Admin User',
  'admin@conectell.com.br',
  'admin',
  'active',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  auth_user_id = (SELECT id FROM auth.users WHERE email = 'admin@conectell.com.br'),
  role = 'admin',
  status = 'active',
  is_master_admin = true,
  updated_at = NOW();