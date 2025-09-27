-- Criar usuário admin master de forma mais simples
-- Primeiro, verificar se já existe e deletar se necessário
DELETE FROM public.users WHERE email = 'financeiro@conectell.com.br';

-- Inserir diretamente na tabela public.users sem auth_user_id por enquanto
INSERT INTO public.users (
  name,
  email,
  role,
  status,
  is_master_admin,
  company_id,
  created_at,
  updated_at
) VALUES (
  'Admin Master',
  'financeiro@conectell.com.br',
  'admin',
  'active',
  true,
  '550e8400-e29b-41d4-a716-446655440000',
  NOW(),
  NOW()
);