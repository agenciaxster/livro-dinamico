import { supabase } from '../lib/supabase';

export interface Account {
  id: string;
  company_id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance: number;
  currency: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountData {
  company_id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance?: number;
  currency?: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateAccountData {
  name?: string;
  type?: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance?: number;
  currency?: string;
  description?: string;
  is_active?: boolean;
}

export const accountsService = {
  // Buscar todas as contas de uma empresa
  async getAccounts(companyId: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Erro ao buscar contas: ${error.message}`);
    }

    return data || [];
  },

  // Buscar conta por ID
  async getAccountById(id: string): Promise<Account | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Conta não encontrada
      }
      throw new Error(`Erro ao buscar conta: ${error.message}`);
    }

    return data;
  },

  // Criar nova conta
  async createAccount(accountData: CreateAccountData): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        ...accountData,
        balance: accountData.balance || 0,
        currency: accountData.currency || 'BRL',
        is_active: accountData.is_active !== false
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar conta: ${error.message}`);
    }

    return data;
  },

  // Atualizar conta
  async updateAccount(id: string, accountData: UpdateAccountData): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .update(accountData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar conta: ${error.message}`);
    }

    return data;
  },

  // Excluir conta (soft delete)
  async deleteAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir conta: ${error.message}`);
    }
  },

  // Buscar contas por tipo
  async getAccountsByType(companyId: string, type: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('company_id', companyId)
      .eq('type', type)
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Erro ao buscar contas por tipo: ${error.message}`);
    }

    return data || [];
  },

  // Atualizar saldo da conta
  async updateBalance(id: string, newBalance: number): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar saldo: ${error.message}`);
    }

    return data;
  },

  // Obter estatísticas das contas
  async getAccountsStats(companyId: string) {
    const { data, error } = await supabase
      .from('accounts')
      .select('type, balance')
      .eq('company_id', companyId)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }

    const stats = {
      totalBalance: 0,
      accountsByType: {} as Record<string, { count: number; balance: number }>,
      totalAccounts: data?.length || 0
    };

    data?.forEach(account => {
      stats.totalBalance += account.balance || 0;
      
      if (!stats.accountsByType[account.type]) {
        stats.accountsByType[account.type] = { count: 0, balance: 0 };
      }
      
      stats.accountsByType[account.type].count++;
      stats.accountsByType[account.type].balance += account.balance || 0;
    });

    return stats;
  },

  // Transferir entre contas
  async transferBetweenAccounts(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description?: string
  ): Promise<void> {
    // Buscar contas
    const fromAccount = await this.getAccountById(fromAccountId);
    const toAccount = await this.getAccountById(toAccountId);

    if (!fromAccount || !toAccount) {
      throw new Error('Uma ou ambas as contas não foram encontradas');
    }

    if (fromAccount.balance < amount) {
      throw new Error('Saldo insuficiente na conta de origem');
    }

    // Atualizar saldos
    await this.updateBalance(fromAccountId, fromAccount.balance - amount);
    await this.updateBalance(toAccountId, toAccount.balance + amount);

    // TODO: Registrar a transferência na tabela de transações
    // Isso será implementado quando criarmos o serviço de transações
  }
};