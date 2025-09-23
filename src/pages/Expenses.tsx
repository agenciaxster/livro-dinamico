import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, TrendingDown, Calendar, DollarSign, Tag, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  categoryColor: string;
  date: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  type: 'income' | 'expense';
  isActive: boolean;
}

// Mock data para categorias de despesa
const mockCategories: Category[] = [
  { id: '1', name: 'Alimentação', color: '#EF4444', type: 'expense', isActive: true },
  { id: '2', name: 'Transporte', color: '#F97316', type: 'expense', isActive: true },
  { id: '3', name: 'Moradia', color: '#8B5CF6', type: 'expense', isActive: true },
  { id: '4', name: 'Saúde', color: '#06B6D4', type: 'expense', isActive: true },
  { id: '5', name: 'Educação', color: '#10B981', type: 'expense', isActive: true },
  { id: '6', name: 'Lazer', color: '#F59E0B', type: 'expense', isActive: true },
  { id: '7', name: 'Compras', color: '#EC4899', type: 'expense', isActive: true },
  { id: '8', name: 'Outros', color: '#6B7280', type: 'expense', isActive: true },
];

// Mock data para saídas
const mockExpenses: Expense[] = [
  {
    id: '1',
    description: 'Supermercado - compras da semana',
    amount: 350.00,
    category: 'Alimentação',
    categoryColor: '#EF4444',
    date: '2024-01-15',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    description: 'Combustível',
    amount: 120.00,
    category: 'Transporte',
    categoryColor: '#F97316',
    date: '2024-01-14',
    createdAt: '2024-01-14T14:30:00Z'
  },
  {
    id: '3',
    description: 'Aluguel do apartamento',
    amount: 1200.00,
    category: 'Moradia',
    categoryColor: '#8B5CF6',
    date: '2024-01-10',
    createdAt: '2024-01-10T09:15:00Z'
  },
  {
    id: '4',
    description: 'Consulta médica',
    amount: 180.00,
    category: 'Saúde',
    categoryColor: '#06B6D4',
    date: '2024-01-08',
    createdAt: '2024-01-08T16:45:00Z'
  }
];

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [categories] = useState<Category[]>(mockCategories.filter(cat => cat.type === 'expense' && cat.isActive));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Novos estados para filtros avançados e paginação
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { toast } = useToast();

  // Filtrar e ordenar saídas
  const filteredAndSortedExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    
    // Filtro por data
    const matchesDateRange = (!dateRange.start || expense.date >= dateRange.start) &&
                            (!dateRange.end || expense.date <= dateRange.end);
    
    // Filtro por valor
    const matchesAmountRange = (!amountRange.min || expense.amount >= parseFloat(amountRange.min)) &&
                              (!amountRange.max || expense.amount <= parseFloat(amountRange.max));
    
    return matchesSearch && matchesCategory && matchesDateRange && matchesAmountRange;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'description':
        comparison = a.description.localeCompare(b.description);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredAndSortedExpenses.slice(startIndex, endIndex);

  // Manter compatibilidade com código existente
  const filteredExpenses = filteredAndSortedExpenses;

  // Calcular estatísticas
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
  });
  const thisMonthAmount = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const selectedCat = categories.find(cat => cat.name === formData.category);
    if (!selectedCat) {
      toast({
        title: "Erro",
        description: "Categoria selecionada não encontrada.",
        variant: "destructive",
      });
      return;
    }

    const expenseData: Expense = {
      id: editingExpense ? editingExpense.id : Date.now().toString(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      categoryColor: selectedCat.color,
      date: formData.date,
      createdAt: editingExpense ? editingExpense.createdAt : new Date().toISOString()
    };

    if (editingExpense) {
      setExpenses(expenses.map(expense => expense.id === editingExpense.id ? expenseData : expense));
      toast({
        title: "Sucesso",
        description: "Saída atualizada com sucesso!",
      });
    } else {
      setExpenses([expenseData, ...expenses]);
      toast({
        title: "Sucesso",
        description: "Saída criada com sucesso!",
      });
    }

    resetForm();
  };

  const handleView = (expense: Expense) => {
    setViewingExpense(expense);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
    toast({
      title: "Sucesso",
      description: "Saída excluída com sucesso!",
    });
  };

  const generatePDF = (expense: Expense) => {
    const doc = new jsPDF();
    
    // Configurações do documento
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Cores
    const primaryColor = '#4F46E5';
    const secondaryColor = '#6B7280';
    const dangerColor = '#DC2626';
    
    // Header com logo e título
    doc.setFillColor(79, 70, 229); // primaryColor
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Título do documento
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CONECTELL', 20, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Soluções Financeiras', 20, 32);
    
    // Título do relatório
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPROVANTE DE SAÍDA', 20, 60);
    
    // Linha separadora
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(1);
    doc.line(20, 65, pageWidth - 20, 65);
    
    // Informações da saída
    let yPosition = 85;
    
    // ID da transação
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('ID da Transação:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(expense.id, 70, yPosition);
    
    yPosition += 20;
    
    // Descrição
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('DESCRIÇÃO:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(expense.description, 20, yPosition + 10);
    
    yPosition += 35;
    
    // Valor
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('VALOR:', 20, yPosition);
    doc.setTextColor(220, 38, 38); // dangerColor
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(expense.amount), 20, yPosition + 12);
    
    yPosition += 35;
    
    // Categoria
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('CATEGORIA:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(expense.category, 20, yPosition + 10);
    
    yPosition += 35;
    
    // Data
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('DATA:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(formatDate(expense.date), 20, yPosition + 10);
    
    yPosition += 35;
    
    // Data de criação
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Criado em:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.text(new Date(expense.createdAt).toLocaleString('pt-BR'), 70, yPosition);
    
    // Footer
    const footerY = pageHeight - 30;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);
    
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Este documento foi gerado automaticamente pelo sistema Conectell', 20, footerY);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, footerY + 8);
    
    // Abrir PDF no navegador
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    
    toast({
      title: "PDF Gerado",
      description: "O comprovante foi gerado e aberto em uma nova aba.",
    });
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingExpense(null);
    setIsDialogOpen(false);
  };

  // Funções de controle dos filtros avançados
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setDateRange({ start: '', end: '' });
    setAmountRange({ min: '', max: '' });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (field: 'date' | 'amount' | 'description') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="p-6 space-y-6">



      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Saídas</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie suas despesas e saídas financeiras</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Saída
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">{editingExpense ? 'Editar Saída' : 'Nova Saída'}</DialogTitle>
              <DialogDescription className="text-sm">
                {editingExpense ? 'Edite os dados da saída.' : 'Adicione uma nova saída ao sistema.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="description" className="sm:text-right text-sm">Descrição *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Ex: Supermercado, Combustível..."
                    className="sm:col-span-3 h-9 text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="amount" className="sm:text-right text-sm">Valor *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0,00"
                    className="sm:col-span-3 h-9 text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="category" className="sm:text-right text-sm">Categoria *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="sm:col-span-3 h-9 text-sm">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="date" className="sm:text-right text-sm">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="sm:col-span-3 h-9 text-sm"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  {editingExpense ? 'Atualizar' : 'Criar'} Saída
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de Visualização */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Detalhes da Saída</DialogTitle>
              <DialogDescription className="text-sm">
                Visualize todas as informações desta saída financeira.
              </DialogDescription>
            </DialogHeader>
            {viewingExpense && (
              <div className="grid gap-4 lg:gap-6 py-4">
                <div className="grid gap-3 lg:gap-4">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div 
                      className="w-3 h-3 lg:w-4 lg:h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: viewingExpense.categoryColor }}
                    />
                    <div>
                      <Label className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">Categoria</Label>
                      <p className="text-sm lg:text-base font-medium">{viewingExpense.category}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">Descrição</Label>
                    <p className="text-sm lg:text-base font-medium mt-1 break-words">{viewingExpense.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                    <div>
                      <Label className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">Valor</Label>
                      <p className="text-lg lg:text-xl font-bold text-red-600 mt-1">{formatCurrency(viewingExpense.amount)}</p>
                    </div>
                    <div>
                      <Label className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">Data</Label>
                      <p className="text-sm lg:text-base font-medium mt-1">{formatDate(viewingExpense.date)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                    <div>
                      <Label className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">ID</Label>
                      <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 mt-1 font-mono break-all">{viewingExpense.id}</p>
                    </div>
                    <div>
                      <Label className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">Criado em</Label>
                      <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {new Date(viewingExpense.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Fechar
              </Button>
              {viewingExpense && (
                <Button onClick={() => generatePDF(viewingExpense)} className="bg-red-600 hover:bg-red-700">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              )}
              {viewingExpense && (
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEdit(viewingExpense);
                }} className="bg-blue-600 hover:bg-blue-700">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Layout Principal com Sidebar */}
      <div className="flex flex-col xl:flex-row gap-4 lg:gap-6">
        {/* Sidebar - Filtros e Estatísticas */}
        <div className="w-full xl:w-80 space-y-4 lg:space-y-6">
          {/* Estatísticas Resumidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-red-600">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="text-center p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-red-600">{totalExpenses}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-red-600">{filteredExpenses.length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Filtradas</div>
                </div>
              </div>
              <div className="space-y-1 lg:space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Valor Total:</span>
                  <span className="text-xs sm:text-sm font-semibold text-red-600">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Este Mês:</span>
                  <span className="text-xs sm:text-sm font-semibold text-red-600">{formatCurrency(thisMonthAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtros Avançados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Filtros e Controles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Busca */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Descrição ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Categoria */}
              <div>
                <Label className="text-xs sm:text-sm font-medium mb-2 block">Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Data */}
          <div>
            <Label className="text-xs sm:text-sm font-medium mb-2 block">Período</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label htmlFor="date-start" className="text-xs text-gray-600 dark:text-gray-400">Data Inicial</Label>
                <Input
                  id="date-start"
                  type="date"
                  placeholder="Data inicial"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="mt-1 h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="date-end" className="text-xs text-gray-600 dark:text-gray-400">Data Final</Label>
                <Input
                  id="date-end"
                  type="date"
                  placeholder="Data final"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="mt-1 h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Filtro por Valor */}
          <div>
            <Label className="text-xs sm:text-sm font-medium mb-2 block">Filtros por Valor</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label htmlFor="amount-min" className="text-xs text-gray-600 dark:text-gray-400">Valor Mínimo</Label>
                <Input
                  id="amount-min"
                  type="number"
                  step="0.01"
                  placeholder="R$ 0,00"
                  value={amountRange.min}
                  onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                  className="mt-1 h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="amount-max" className="text-xs text-gray-600 dark:text-gray-400">Valor Máximo</Label>
                <Input
                  id="amount-max"
                  type="number"
                  step="0.01"
                  placeholder="R$ 999,99"
                  value={amountRange.max}
                  onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                  className="mt-1 h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Ordenação */}
          <div>
            <Label className="text-xs sm:text-sm font-medium mb-2 block">Ordenar por</Label>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: 'date' | 'amount' | 'description') => setSortBy(value)}>
                <SelectTrigger className="flex-1 h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="amount">Valor</SelectItem>
                  <SelectItem value="description">Descrição</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 sm:px-3 h-8 sm:h-10 text-xs sm:text-sm"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {/* Botão Limpar Filtros */}
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="w-full h-8 sm:h-10 text-xs sm:text-sm"
          >
            <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Limpar Filtros
          </Button>
        </CardContent>
      </Card>
    </div>

    {/* Área Principal - Lista de Saídas */}
    <div className="flex-1 space-y-4 lg:space-y-6">

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Saídas</span>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Página {currentPage} de {totalPages} • {filteredExpenses.length} saída(s) encontrada(s)
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <TrendingDown className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Nenhuma saída encontrada</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || selectedCategory !== 'all' || dateRange.start || dateRange.end || amountRange.min || amountRange.max
                  ? 'Tente ajustar os filtros de busca.' 
                  : 'Comece criando sua primeira saída.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {paginatedExpenses.map((expense) => (
                  <Card key={expense.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {expense.category}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                              {formatDate(expense.date)}
                            </span>
                          </div>
                          <h3 className="font-medium text-sm mb-1 truncate">{expense.description}</h3>
                          <p className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
                            -{formatCurrency(expense.amount)}
                          </p>
                        </div>
                        <div className="flex gap-1 sm:gap-2 shrink-0 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(expense)}
                            className="text-blue-600 hover:text-blue-700 h-8 w-8 p-0 sm:h-9 sm:w-9"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0 sm:h-9 sm:w-9"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Controles de Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredExpenses.length)} de {filteredExpenses.length} resultados
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Anterior</span>
                      <span className="sm:hidden">‹</span>
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        if (pageNumber > totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Próximo</span>
                      <span className="sm:hidden">›</span>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  </div>
  );
}

export default Expenses;
