-- Corrigir search_path nas funções para segurança
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    company_uuid uuid;
BEGIN
    -- Buscar ou criar empresa padrão
    SELECT id INTO company_uuid FROM public.companies WHERE name = 'Conectell' LIMIT 1;
    
    IF company_uuid IS NULL THEN
        INSERT INTO public.companies (id, name, created_at, updated_at)
        VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Conectell', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
        company_uuid := '550e8400-e29b-41d4-a716-446655440000';
    END IF;

    -- Inserir ou atualizar usuário na tabela public.users
    INSERT INTO public.users (
        auth_user_id,
        email,
        name,
        role,
        status,
        is_master_admin,
        company_id,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        'active',
        COALESCE((NEW.raw_user_meta_data->>'is_master_admin')::boolean, false),
        company_uuid,
        NOW(),
        NOW()
    ) ON CONFLICT (email) DO UPDATE SET
        auth_user_id = NEW.id,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;