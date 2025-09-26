-- Create the users table with all necessary columns
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  company_id UUID,
  is_master_admin BOOLEAN DEFAULT false,
  avatar_url TEXT,
  phone TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the accounts table
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the entries table
CREATE TABLE public.entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL,
  account_id UUID REFERENCES public.accounts(id),
  category_id UUID REFERENCES public.categories(id),
  company_id UUID REFERENCES public.companies(id),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  company_id UUID REFERENCES public.companies(id),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create security definer functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_master_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_master_admin, false) FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Master admins can view all users" ON public.users
  FOR SELECT USING (public.is_current_user_master_admin());

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Master admins can update all users" ON public.users
  FOR UPDATE USING (public.is_current_user_master_admin());

-- Create RLS policies for other tables
CREATE POLICY "Users can view their company data" ON public.companies
  FOR SELECT USING (id = public.get_current_user_company_id() OR public.is_current_user_master_admin());

CREATE POLICY "Users can view their company accounts" ON public.accounts
  FOR SELECT USING (company_id = public.get_current_user_company_id() OR public.is_current_user_master_admin());

CREATE POLICY "Users can manage their company accounts" ON public.accounts
  FOR ALL USING (company_id = public.get_current_user_company_id() OR public.is_current_user_master_admin());

CREATE POLICY "Users can view their company categories" ON public.categories
  FOR SELECT USING (company_id = public.get_current_user_company_id() OR public.is_current_user_master_admin());

CREATE POLICY "Users can manage their company categories" ON public.categories
  FOR ALL USING (company_id = public.get_current_user_company_id() OR public.is_current_user_master_admin());

CREATE POLICY "Users can view their company entries" ON public.entries
  FOR SELECT USING (company_id = public.get_current_user_company_id() OR public.is_current_user_master_admin());

CREATE POLICY "Users can manage their company entries" ON public.entries
  FOR ALL USING (company_id = public.get_current_user_company_id() OR public.is_current_user_master_admin());

CREATE POLICY "Users can view their company expenses" ON public.expenses
  FOR SELECT USING (company_id = public.get_current_user_company_id() OR public.is_current_user_master_admin());

CREATE POLICY "Users can manage their company expenses" ON public.expenses
  FOR ALL USING (company_id = public.get_current_user_company_id() OR public.is_current_user_master_admin());

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON public.entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();