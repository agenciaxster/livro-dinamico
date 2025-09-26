-- Criar um usuário admin master no banco de dados
-- Primeiro, vamos inserir uma empresa padrão
INSERT INTO public.companies (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Conectell')
ON CONFLICT (id) DO NOTHING;

-- Inserir usuário admin master
INSERT INTO public.users (
  id,
  auth_user_id,
  name,
  email,
  role,
  status,
  company_id,
  is_master_admin,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  NULL, -- Será preenchido quando o usuário fizer login
  'Admin Master',
  'financeiro@conectell.com.br',
  'admin',
  'active',
  '00000000-0000-0000-0000-000000000001',
  true,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  company_id = EXCLUDED.company_id,
  is_master_admin = EXCLUDED.is_master_admin,
  updated_at = now();