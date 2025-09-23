-- =====================================================
-- DADOS INICIAIS PARA O BANCO DE DADOS
-- =====================================================

-- =====================================================
-- 1. INSERIR EMPRESA PRINCIPAL
-- =====================================================
INSERT INTO companies (id, name, phone, email, address, cnpj, razao_social, website) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Conectell Fibra Óptica',
    '(33) 98832-0504',
    'contato@conectell.com.br',
    'Av. Pres. Castelo Branco - Virgem da Lapa, MG',
    '12.345.678/0001-90',
    'Conectell Telecomunicações LTDA',
    'https://conectell.com.br'
);

-- =====================================================
-- 2. INSERIR USUÁRIO MASTER ADMIN
-- =====================================================
INSERT INTO users (id, company_id, name, email, password_hash, role, status, is_master_admin) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'Administrador Master',
    'admin@conectell.com.br',
    crypt('admin123', gen_salt('bf')), -- Senha: admin123
    'admin',
    'active',
    true
);

-- =====================================================
-- 3. INSERIR USUÁRIOS ADICIONAIS
-- =====================================================
INSERT INTO users (id, company_id, name, email, password_hash, role, status) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'João Silva',
    'joao.silva@conectell.com.br',
    crypt('joao123', gen_salt('bf')),
    'admin',
    'active'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    'Maria Santos',
    'maria.santos@conectell.com.br',
    crypt('maria123', gen_salt('bf')),
    'user',
    'active'
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440000',
    'Pedro Costa',
    'pedro.costa@conectell.com.br',
    crypt('pedro123', gen_salt('bf')),
    'viewer',
    'inactive'
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440000',
    'Ana Oliveira',
    'ana.oliveira@conectell.com.br',
    crypt('ana123', gen_salt('bf')),
    'user',
    'pending'
),
(
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440000',
    'Carlos Ferreira',
    'carlos.ferreira@conectell.com.br',
    crypt('carlos123', gen_salt('bf')),
    'admin',
    'active'
);

-- =====================================================
-- 4. INSERIR CATEGORIAS DE RECEITA
-- =====================================================
INSERT INTO categories (id, company_id, name, description, color, icon, type) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440000',
    'Salário',
    'Salários e remunerações',
    '#10B981',
    '💰',
    'income'
),
(
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440000',
    'Freelance',
    'Trabalhos freelance e projetos',
    '#3B82F6',
    '💻',
    'income'
),
(
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440000',
    'Investimentos',
    'Rendimentos de investimentos',
    '#8B5CF6',
    '📈',
    'income'
),
(
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440000',
    'Vendas',
    'Receitas de vendas',
    '#F59E0B',
    '🛒',
    'income'
),
(
    '550e8400-e29b-41d4-a716-446655440014',
    '550e8400-e29b-41d4-a716-446655440000',
    'Outros',
    'Outras receitas',
    '#6B7280',
    '📋',
    'income'
);

-- =====================================================
-- 5. INSERIR CATEGORIAS DE DESPESA
-- =====================================================
INSERT INTO categories (id, company_id, name, description, color, icon, type) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440000',
    'Alimentação',
    'Gastos com comida e bebidas',
    '#EF4444',
    '🍽️',
    'expense'
),
(
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440000',
    'Transporte',
    'Combustível, transporte público, etc.',
    '#F97316',
    '🚗',
    'expense'
),
(
    '550e8400-e29b-41d4-a716-446655440022',
    '550e8400-e29b-41d4-a716-446655440000',
    'Moradia',
    'Aluguel, condomínio, etc.',
    '#8B5CF6',
    '🏠',
    'expense'
),
(
    '550e8400-e29b-41d4-a716-446655440023',
    '550e8400-e29b-41d4-a716-446655440000',
    'Saúde',
    'Medicamentos, consultas médicas',
    '#06B6D4',
    '🏥',
    'expense'
),
(
    '550e8400-e29b-41d4-a716-446655440024',
    '550e8400-e29b-41d4-a716-446655440000',
    'Educação',
    'Cursos, livros, material escolar',
    '#10B981',
    '📚',
    'expense'
),
(
    '550e8400-e29b-41d4-a716-446655440025',
    '550e8400-e29b-41d4-a716-446655440000',
    'Lazer',
    'Entretenimento e diversão',
    '#F59E0B',
    '🎮',
    'expense'
),
(
    '550e8400-e29b-41d4-a716-446655440026',
    '550e8400-e29b-41d4-a716-446655440000',
    'Compras',
    'Compras diversas',
    '#EC4899',
    '🛍️',
    'expense'
),
(
    '550e8400-e29b-41d4-a716-446655440027',
    '550e8400-e29b-41d4-a716-446655440000',
    'Outros',
    'Outras despesas',
    '#6B7280',
    '📋',
    'expense'
);

-- =====================================================
-- 6. INSERIR CONTAS
-- =====================================================
INSERT INTO accounts (id, company_id, name, type, bank, account_number, balance, description) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440000',
    'Conta Corrente Principal',
    'checking',
    'Banco do Brasil',
    '12345-6',
    15000.00,
    'Conta principal para movimentações diárias'
),
(
    '550e8400-e29b-41d4-a716-446655440031',
    '550e8400-e29b-41d4-a716-446655440000',
    'Poupança Empresarial',
    'savings',
    'Caixa Econômica Federal',
    '98765-4',
    50000.00,
    'Reserva de emergência da empresa'
),
(
    '550e8400-e29b-41d4-a716-446655440032',
    '550e8400-e29b-41d4-a716-446655440000',
    'Cartão Corporativo',
    'credit',
    'Itaú',
    '****-1234',
    -2500.00,
    'Cartão para despesas corporativas'
),
(
    '550e8400-e29b-41d4-a716-446655440033',
    '550e8400-e29b-41d4-a716-446655440000',
    'Investimentos CDB',
    'investment',
    'Bradesco',
    '55555-1',
    100000.00,
    'Aplicação em CDB para crescimento do capital'
);

-- =====================================================
-- 7. INSERIR ENTRADAS (RECEITAS)
-- =====================================================
INSERT INTO entries (id, company_id, account_id, category_id, user_id, description, amount, entry_date) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440040',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440002',
    'Salário mensal',
    5000.00,
    '2024-01-15'
),
(
    '550e8400-e29b-41d4-a716-446655440041',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440003',
    'Projeto freelance - Website',
    1500.00,
    '2024-01-10'
),
(
    '550e8400-e29b-41d4-a716-446655440042',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440033',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440001',
    'Dividendos de ações',
    250.00,
    '2024-01-08'
),
(
    '550e8400-e29b-41d4-a716-446655440043',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440006',
    'Venda de produto',
    800.00,
    '2024-01-12'
);

-- =====================================================
-- 8. INSERIR SAÍDAS (DESPESAS)
-- =====================================================
INSERT INTO expenses (id, company_id, account_id, category_id, user_id, description, amount, expense_date) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440050',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440002',
    'Supermercado - compras da semana',
    350.00,
    '2024-01-15'
),
(
    '550e8400-e29b-41d4-a716-446655440051',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440032',
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440003',
    'Combustível',
    120.00,
    '2024-01-14'
),
(
    '550e8400-e29b-41d4-a716-446655440052',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440022',
    '550e8400-e29b-41d4-a716-446655440001',
    'Aluguel do apartamento',
    1200.00,
    '2024-01-10'
),
(
    '550e8400-e29b-41d4-a716-446655440053',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440023',
    '550e8400-e29b-41d4-a716-446655440006',
    'Consulta médica',
    180.00,
    '2024-01-08'
);

-- =====================================================
-- 9. INSERIR CONFIGURAÇÕES DO SISTEMA
-- =====================================================
INSERT INTO system_settings (company_id, setting_key, setting_value, description) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'system_name',
    '"Livro Dinâmico - Conectell"',
    'Nome do sistema'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'theme',
    '"light"',
    'Tema padrão do sistema'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'session_timeout',
    '30',
    'Timeout da sessão em minutos'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'maintenance_mode',
    'false',
    'Modo de manutenção'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'email_notifications',
    'true',
    'Notificações por email'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'backup_frequency',
    '"daily"',
    'Frequência de backup'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'max_file_size',
    '10',
    'Tamanho máximo de arquivo em MB'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'currency',
    '"BRL"',
    'Moeda padrão'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'date_format',
    '"DD/MM/YYYY"',
    'Formato de data'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'timezone',
    '"America/Sao_Paulo"',
    'Fuso horário'
);

-- =====================================================
-- 10. ATUALIZAR SENHAS DOS USUÁRIOS (OPCIONAL)
-- =====================================================
-- Atualizar last_password_change para todos os usuários
UPDATE users SET last_password_change = NOW() - INTERVAL '30 days' WHERE email = 'pedro.costa@conectell.com.br';
UPDATE users SET password_expired = true WHERE email = 'pedro.costa@conectell.com.br';

-- =====================================================
-- 11. INSERIR ALGUNS LOGS DE AUDITORIA
-- =====================================================
INSERT INTO audit_logs (company_id, user_id, table_name, record_id, action, new_values) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'companies',
    '550e8400-e29b-41d4-a716-446655440000',
    'INSERT',
    '{"name": "Conectell Fibra Óptica", "email": "contato@conectell.com.br"}'::jsonb
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'users',
    '550e8400-e29b-41d4-a716-446655440001',
    'INSERT',
    '{"name": "Administrador Master", "email": "admin@conectell.com.br", "role": "admin"}'::jsonb
);

-- =====================================================
-- VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se os dados foram inseridos corretamente
SELECT 'Companies' as table_name, COUNT(*) as count FROM companies
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Accounts', COUNT(*) FROM accounts
UNION ALL
SELECT 'Entries', COUNT(*) FROM entries
UNION ALL
SELECT 'Expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'Settings', COUNT(*) FROM system_settings
UNION ALL
SELECT 'Audit Logs', COUNT(*) FROM audit_logs;

-- Verificar saldos das contas
SELECT 
    a.name,
    a.balance,
    COALESCE(e.total_entries, 0) as total_entries,
    COALESCE(ex.total_expenses, 0) as total_expenses,
    (COALESCE(e.total_entries, 0) - COALESCE(ex.total_expenses, 0)) as calculated_balance
FROM accounts a
LEFT JOIN (
    SELECT account_id, SUM(amount) as total_entries 
    FROM entries 
    GROUP BY account_id
) e ON a.id = e.account_id
LEFT JOIN (
    SELECT account_id, SUM(amount) as total_expenses 
    FROM expenses 
    GROUP BY account_id
) ex ON a.id = ex.account_id;