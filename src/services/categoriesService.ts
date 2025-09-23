import { supabase } from '../lib/supabase'

export interface Category {
  id: string
  companyId?: string
  name: string
  description?: string
  color: string
  icon?: string
  type: 'income' | 'expense'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryData {
  name: string
  description?: string
  color: string
  icon?: string
  type: 'income' | 'expense'
  companyId?: string
}

export interface UpdateCategoryData {
  name?: string
  description?: string
  color?: string
  icon?: string
  type?: 'income' | 'expense'
  isActive?: boolean
}

class CategoriesService {
  // Buscar todas as categorias
  async getCategories(companyId?: string, type?: 'income' | 'expense'): Promise<{ categories: Category[]; error: string | null }> {
    try {
      let query = supabase.from('categories').select('*').eq('is_active', true)
      
      if (companyId) {
        query = query.eq('company_id', companyId)
      }
      
      if (type) {
        query = query.eq('type', type)
      }

      const { data, error } = await query.order('name')

      if (error) {
        return { categories: [], error: 'Erro ao buscar categorias' }
      }

      const categories: Category[] = data.map(item => ({
        id: item.id,
        companyId: item.company_id,
        name: item.name,
        description: item.description,
        color: item.color,
        icon: item.icon,
        type: item.type,
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }))

      return { categories, error: null }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      return { categories: [], error: 'Erro interno do servidor' }
    }
  }

  // Buscar categoria por ID
  async getCategoryById(id: string): Promise<{ category: Category | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        return { category: null, error: 'Categoria não encontrada' }
      }

      const category: Category = {
        id: data.id,
        companyId: data.company_id,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        type: data.type,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { category, error: null }
    } catch (error) {
      console.error('Erro ao buscar categoria:', error)
      return { category: null, error: 'Erro interno do servidor' }
    }
  }

  // Criar nova categoria
  async createCategory(data: CreateCategoryData): Promise<{ category: Category | null; error: string | null }> {
    try {
      // Verificar se já existe categoria com o mesmo nome
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('name', data.name)
        .eq('type', data.type)
        .eq('company_id', data.companyId || null)
        .single()

      if (existing) {
        return { category: null, error: 'Já existe uma categoria com este nome' }
      }

      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({
          name: data.name,
          description: data.description,
          color: data.color,
          icon: data.icon,
          type: data.type,
          company_id: data.companyId,
          is_active: true
        })
        .select()
        .single()

      if (error || !newCategory) {
        return { category: null, error: 'Erro ao criar categoria' }
      }

      const category: Category = {
        id: newCategory.id,
        companyId: newCategory.company_id,
        name: newCategory.name,
        description: newCategory.description,
        color: newCategory.color,
        icon: newCategory.icon,
        type: newCategory.type,
        isActive: newCategory.is_active,
        createdAt: newCategory.created_at,
        updatedAt: newCategory.updated_at
      }

      return { category, error: null }
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      return { category: null, error: 'Erro interno do servidor' }
    }
  }

  // Atualizar categoria
  async updateCategory(id: string, data: UpdateCategoryData): Promise<{ category: Category | null; error: string | null }> {
    try {
      const updateData: Partial<Category> & { updated_at: string } = {
        updated_at: new Date().toISOString()
      }

      if (data.name) updateData.name = data.name
      if (data.description !== undefined) updateData.description = data.description
      if (data.color) updateData.color = data.color
      if (data.icon !== undefined) updateData.icon = data.icon
      if (data.type) updateData.type = data.type
      if (data.isActive !== undefined) updateData.is_active = data.isActive

      const { data: updatedCategory, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error || !updatedCategory) {
        return { category: null, error: 'Erro ao atualizar categoria' }
      }

      const category: Category = {
        id: updatedCategory.id,
        companyId: updatedCategory.company_id,
        name: updatedCategory.name,
        description: updatedCategory.description,
        color: updatedCategory.color,
        icon: updatedCategory.icon,
        type: updatedCategory.type,
        isActive: updatedCategory.is_active,
        createdAt: updatedCategory.created_at,
        updatedAt: updatedCategory.updated_at
      }

      return { category, error: null }
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
      return { category: null, error: 'Erro interno do servidor' }
    }
  }

  // Deletar categoria (soft delete)
  async deleteCategory(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Verificar se a categoria está sendo usada
      const { data: entriesUsing } = await supabase
        .from('entries')
        .select('id')
        .eq('category_id', id)
        .limit(1)

      const { data: expensesUsing } = await supabase
        .from('expenses')
        .select('id')
        .eq('category_id', id)
        .limit(1)

      if (entriesUsing?.length || expensesUsing?.length) {
        return { success: false, error: 'Não é possível excluir categoria que está sendo usada' }
      }

      const { error } = await supabase
        .from('categories')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        return { success: false, error: 'Erro ao excluir categoria' }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  // Buscar categorias por tipo
  async getCategoriesByType(type: 'income' | 'expense', companyId?: string): Promise<{ categories: Category[]; error: string | null }> {
    return this.getCategories(companyId, type)
  }

  // Buscar estatísticas das categorias
  async getCategoriesStats(companyId?: string): Promise<{ stats: {
    total: number;
    active: number;
    inactive: number;
    income: number;
    expense: number;
  } | null; error: string | null }> {
    try {
      let query = supabase.from('categories').select('type, is_active')
      
      if (companyId) {
        query = query.eq('company_id', companyId)
      }

      const { data, error } = await query

      if (error) {
        return { stats: null, error: 'Erro ao buscar estatísticas' }
      }

      const stats = {
        total: data.length,
        active: data.filter(c => c.is_active).length,
        inactive: data.filter(c => !c.is_active).length,
        income: data.filter(c => c.type === 'income' && c.is_active).length,
        expense: data.filter(c => c.type === 'expense' && c.is_active).length
      }

      return { stats, error: null }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return { stats: null, error: 'Erro interno do servidor' }
    }
  }

  // Buscar categorias mais usadas
  async getMostUsedCategories(companyId?: string, limit: number = 5): Promise<{ categories: Category[]; error: string | null }> {
    try {
      // Esta query seria mais complexa no mundo real, aqui é uma versão simplificada
      let query = supabase
        .from('categories')
        .select(`
          *,
          entries:entries(count),
          expenses:expenses(count)
        `)
        .eq('is_active', true)

      if (companyId) {
        query = query.eq('company_id', companyId)
      }

      const { data, error } = await query.limit(limit)

      if (error) {
        return { categories: [], error: 'Erro ao buscar categorias mais usadas' }
      }

      return { categories: data || [], error: null }
    } catch (error) {
      console.error('Erro ao buscar categorias mais usadas:', error)
      return { categories: [], error: 'Erro interno do servidor' }
    }
  }
}

export const categoriesService = new CategoriesService()
export default categoriesService