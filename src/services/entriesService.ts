import { supabase } from '../lib/supabase';

export interface Entry {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  account_id: string;
  company_id: string;
  date: string;
  notes?: string;
  tags?: string[];
  is_recurring: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurring_end_date?: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  account?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface CreateEntryData {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  account_id: string;
  company_id: string;
  date: string;
  notes?: string;
  tags?: string[];
  is_recurring?: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurring_end_date?: string;
}

export interface UpdateEntryData {
  description?: string;
  amount?: number;
  type?: 'income' | 'expense';
  category_id?: string;
  account_id?: string;
  date?: string;
  notes?: string;
  tags?: string[];
  is_recurring?: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurring_end_date?: string;
}

export interface EntriesFilter {
  type?: 'income' | 'expense';
  category_id?: string;
  account_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface EntriesStats {
  total_income: number;
  total_expense: number;
  net_income: number;
  entries_count: number;
  avg_transaction: number;
}

class EntriesService {
  async getEntries(companyId: string, filter?: EntriesFilter): Promise<Entry[]> {
    let query = supabase
      .from('entries')
      .select(`
        *,
        category:categories(id, name, color, icon),
        account:accounts(id, name, type)
      `)
      .eq('company_id', companyId)
      .order('date', { ascending: false });

    if (filter?.type) {
      query = query.eq('type', filter.type);
    }

    if (filter?.category_id) {
      query = query.eq('category_id', filter.category_id);
    }

    if (filter?.account_id) {
      query = query.eq('account_id', filter.account_id);
    }

    if (filter?.date_from) {
      query = query.gte('date', filter.date_from);
    }

    if (filter?.date_to) {
      query = query.lte('date', filter.date_to);
    }

    if (filter?.search) {
      query = query.or(`description.ilike.%${filter.search}%,notes.ilike.%${filter.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar entradas:', error);
      throw new Error('Erro ao buscar entradas');
    }

    return data || [];
  }

  async getEntryById(id: string): Promise<Entry | null> {
    const { data, error } = await supabase
      .from('entries')
      .select(`
        *,
        category:categories(id, name, color, icon),
        account:accounts(id, name, type)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar entrada:', error);
      throw new Error('Erro ao buscar entrada');
    }

    return data;
  }

  async createEntry(entryData: CreateEntryData): Promise<Entry> {
    const { data, error } = await supabase
      .from('entries')
      .insert([{
        ...entryData,
        is_recurring: entryData.is_recurring || false
      }])
      .select(`
        *,
        category:categories(id, name, color, icon),
        account:accounts(id, name, type)
      `)
      .single();

    if (error) {
      console.error('Erro ao criar entrada:', error);
      throw new Error('Erro ao criar entrada');
    }

    // Atualizar saldo da conta
    await this.updateAccountBalance(entryData.account_id, entryData.amount, entryData.type);

    return data;
  }

  async updateEntry(id: string, entryData: UpdateEntryData): Promise<Entry> {
    // Buscar entrada atual para calcular diferença no saldo
    const currentEntry = await this.getEntryById(id);
    if (!currentEntry) {
      throw new Error('Entrada não encontrada');
    }

    const { data, error } = await supabase
      .from('entries')
      .update(entryData)
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, color, icon),
        account:accounts(id, name, type)
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar entrada:', error);
      throw new Error('Erro ao atualizar entrada');
    }

    // Atualizar saldo da conta se necessário
    if (entryData.amount !== undefined || entryData.type !== undefined || entryData.account_id !== undefined) {
      // Reverter o valor anterior
      await this.updateAccountBalance(
        currentEntry.account_id, 
        -currentEntry.amount, 
        currentEntry.type
      );

      // Aplicar o novo valor
      await this.updateAccountBalance(
        entryData.account_id || currentEntry.account_id,
        entryData.amount || currentEntry.amount,
        entryData.type || currentEntry.type
      );
    }

    return data;
  }

  async deleteEntry(id: string): Promise<void> {
    // Buscar entrada para reverter o saldo
    const entry = await this.getEntryById(id);
    if (!entry) {
      throw new Error('Entrada não encontrada');
    }

    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir entrada:', error);
      throw new Error('Erro ao excluir entrada');
    }

    // Reverter saldo da conta
    await this.updateAccountBalance(entry.account_id, -entry.amount, entry.type);
  }

  async getEntriesStats(companyId: string, dateFrom?: string, dateTo?: string): Promise<EntriesStats> {
    let query = supabase
      .from('entries')
      .select('amount, type')
      .eq('company_id', companyId);

    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('date', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Erro ao buscar estatísticas');
    }

    const entries = data || [];
    const totalIncome = entries
      .filter(entry => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalExpense = entries
      .filter(entry => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      net_income: totalIncome - totalExpense,
      entries_count: entries.length,
      avg_transaction: entries.length > 0 ? (totalIncome + totalExpense) / entries.length : 0
    };
  }

  async getEntriesByCategory(companyId: string, dateFrom?: string, dateTo?: string) {
    let query = supabase
      .from('entries')
      .select(`
        amount,
        type,
        category:categories(id, name, color)
      `)
      .eq('company_id', companyId);

    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('date', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar entradas por categoria:', error);
      throw new Error('Erro ao buscar entradas por categoria');
    }

    // Agrupar por categoria
    interface CategoryStat {
      id: string;
      name: string;
      color: string;
      income: number;
      expense: number;
      total: number;
      count: number;
    }

    const categoryStats = (data || []).reduce((acc: Record<string, CategoryStat>, entry: any) => {
      const categoryId = entry.category?.id || 'uncategorized';
      const categoryName = entry.category?.name || 'Sem categoria';
      const categoryColor = entry.category?.color || '#gray';

      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          name: categoryName,
          color: categoryColor,
          income: 0,
          expense: 0,
          total: 0,
          count: 0
        };
      }

      if (entry.type === 'income') {
        acc[categoryId].income += entry.amount;
      } else {
        acc[categoryId].expense += entry.amount;
      }

      acc[categoryId].total += entry.amount;
      acc[categoryId].count += 1;

      return acc;
    }, {});

    return Object.values(categoryStats);
  }

  private async updateAccountBalance(accountId: string, amount: number, type: 'income' | 'expense'): Promise<void> {
    // Buscar saldo atual da conta
    const { data: account, error: fetchError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar conta:', fetchError);
      throw new Error('Erro ao buscar conta');
    }

    // Calcular novo saldo
    const currentBalance = account.balance || 0;
    const balanceChange = type === 'income' ? amount : -amount;
    const newBalance = currentBalance + balanceChange;

    // Atualizar saldo
    const { error: updateError } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', accountId);

    if (updateError) {
      console.error('Erro ao atualizar saldo:', updateError);
      throw new Error('Erro ao atualizar saldo da conta');
    }
  }

  async getRecurringEntries(companyId: string): Promise<Entry[]> {
    const { data, error } = await supabase
      .from('entries')
      .select(`
        *,
        category:categories(id, name, color, icon),
        account:accounts(id, name, type)
      `)
      .eq('company_id', companyId)
      .eq('is_recurring', true)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar entradas recorrentes:', error);
      throw new Error('Erro ao buscar entradas recorrentes');
    }

    return data || [];
  }

  async duplicateEntry(id: string, newDate: string): Promise<Entry> {
    const originalEntry = await this.getEntryById(id);
    if (!originalEntry) {
      throw new Error('Entrada não encontrada');
    }

    const duplicateData: CreateEntryData = {
      description: originalEntry.description,
      amount: originalEntry.amount,
      type: originalEntry.type,
      category_id: originalEntry.category_id,
      account_id: originalEntry.account_id,
      company_id: originalEntry.company_id,
      date: newDate,
      notes: originalEntry.notes,
      tags: originalEntry.tags,
      is_recurring: originalEntry.is_recurring,
      recurring_frequency: originalEntry.recurring_frequency,
      recurring_end_date: originalEntry.recurring_end_date
    };

    return this.createEntry(duplicateData);
  }
}

export const entriesService = new EntriesService();