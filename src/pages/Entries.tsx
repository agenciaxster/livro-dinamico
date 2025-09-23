import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, TrendingUp, Calendar, DollarSign, Tag, FileText, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { entriesService, Entry } from '@/services/entriesService';
import { categoriesService } from '@/services/categoriesService';
import { accountsService } from '@/services/accountsService';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  id: string;
  name: string;
  color: string;
  type: 'income' | 'expense';
  is_active: boolean;
}

interface Account {
  id: string;
  name: string;
  type: string;
}

const Entries: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<Entry | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    account: '',
    type: 'income' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, [user, loadData]);

  const loadData = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);
      setError(null);

      const [entriesData, categoriesData, accountsData] = await Promise.all([
        entriesService.getEntries(user.company_id),
        categoriesService.getCategories(user.company_id),
        accountsService.getAccounts(user.company_id)
      ]);

      setEntries(entriesData);
      setCategories(categoriesData.filter(cat => cat.is_active));
      setAccounts(accountsData.filter(acc => acc.is_active));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [user?.company_id]);

  // Estados para sidebar e filtros avançados
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { toast } = useToast();

  // Filtrar e ordenar entradas
  const filteredAndSortedEntries = entries
    .filter(entry => {
      const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (entry.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || entry.category?.name === selectedCategory;
      
      // Filtro por data
      const entryDate = new Date(entry.date);
      const matchesDateStart = !dateRange.start || entryDate >= new Date(dateRange.start);
      const matchesDateEnd = !dateRange.end || entryDate <= new Date(dateRange.end);
      
      // Filtro por valor
      const matchesAmountMin = !amountRange.min || entry.amount >= parseFloat(amountRange.min);
      const matchesAmountMax = !amountRange.max || entry.amount <= parseFloat(amountRange.max);
      
      return matchesSearch && matchesCategory && matchesDateStart && matchesDateEnd && matchesAmountMin && matchesAmountMax;
    })
    .sort((a, b) => {
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
  const totalPages = Math.ceil(filteredAndSortedEntries.length / itemsPerPage);
  const paginatedEntries = filteredAndSortedEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Manter compatibilidade com código existente
  const filteredEntries = filteredAndSortedEntries;

  // Calcular estatísticas
  const totalEntries = entries.length;
  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const thisMonthEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
  });
  const thisMonthAmount = thisMonthEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.company_id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description || !formData.amount || !formData.category || !formData.account) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const entryData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category_id: formData.category,
        account_id: formData.account,
        company_id: user.company_id,
        date: formData.date,
        notes: formData.notes || undefined
      };

      if (editingEntry) {
        await entriesService.updateEntry(editingEntry.id, entryData);
        toast({
          title: "Sucesso",
          description: "Entrada atualizada com sucesso!",
        });
      } else {
        await entriesService.createEntry(entryData);
        toast({
          title: "Sucesso",
          description: "Entrada criada com sucesso!",
        });
      }

      await loadData();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar entrada:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar entrada. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Funções para controle da sidebar
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setDateRange({ start: '', end: '' });
    setAmountRange({ min: '', max: '' });
    setCurrentPage(1);
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  const handleView = (entry: Entry) => {
    setViewingEntry(entry);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setFormData({
      description: entry.description,
      amount: entry.amount.toString(),
      category: entry.category_id,
      account: entry.account_id,
      type: entry.type,
      date: entry.date,
      notes: entry.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await entriesService.deleteEntry(id);
      await loadData();
      toast({
        title: "Sucesso",
        description: "Entrada excluída com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir entrada:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir entrada. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const generatePDF = (entry: Entry) => {
    const doc = new jsPDF();
    
    // Configurações do documento
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Cores
    const primaryColor = '#4F46E5';
    const secondaryColor = '#6B7280';
    const successColor = '#10B981';
    
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
    doc.text('COMPROVANTE DE ENTRADA', 20, 60);
    
    // Linha separadora
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(1);
    doc.line(20, 65, pageWidth - 20, 65);
    
    // Informações da entrada
    let yPosition = 85;
    
    // ID da transação
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('ID da Transação:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(entry.id, 70, yPosition);
    
    yPosition += 20;
    
    // Descrição
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('DESCRIÇÃO:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(entry.description, 20, yPosition + 10);
    
    yPosition += 35;
    
    // Valor
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('VALOR:', 20, yPosition);
    doc.setTextColor(16, 185, 129); // successColor
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(entry.amount), 20, yPosition + 12);
    
    yPosition += 35;
    
    // Categoria
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('CATEGORIA:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(entry.category, 20, yPosition + 10);
    
    yPosition += 35;
    
    // Data
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('DATA:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(formatDate(entry.date), 20, yPosition + 10);
    
    yPosition += 35;
    
    // Data de criação
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Criado em:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.text(new Date(entry.createdAt).toLocaleString('pt-BR'), 70, yPosition);
    
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
      account: '',
      type: 'income',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setEditingEntry(null);
    setIsDialogOpen(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando entradas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription className="flex items-center justify-between">
          {error}
          <Button variant="outline" size="sm" onClick={() => setError(null)}>
            Fechar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-6 p-4 lg:p-0">
      {/* Sidebar */}
      <div className="w-full lg:w-80 lg:flex-shrink-0 space-y-4 lg:space-y-6">
        {/* Header da Sidebar */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Filtros e Controles</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Organize e filtre suas entradas</p>
        </div>

        {/* Estatísticas Resumidas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
              <span className="font-semibold">{totalEntries}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Filtradas</span>
              <span className="font-semibold text-blue-600">{filteredEntries.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Valor Total</span>
              <span className="font-semibold text-green-600">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Este Mês</span>
              <span className="font-semibold text-green-600">{formatCurrency(thisMonthAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Filtros Avançados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca */}
            <div>
              <Label className="text-xs">Buscar</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Descrição ou categoria..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); resetPagination(); }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categoria */}
            <div>
              <Label className="text-xs">Categoria</Label>
              <Select value={selectedCategory} onValueChange={(value) => { setSelectedCategory(value); resetPagination(); }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todas" />
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

            {/* Período */}
            <div>
              <Label className="text-xs">Período</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input
                  type="date"
                  placeholder="De"
                  value={dateRange.start}
                  onChange={(e) => { setDateRange({...dateRange, start: e.target.value}); resetPagination(); }}
                />
                <Input
                  type="date"
                  placeholder="Até"
                  value={dateRange.end}
                  onChange={(e) => { setDateRange({...dateRange, end: e.target.value}); resetPagination(); }}
                />
              </div>
            </div>

            {/* Valor */}
            <div>
              <Label className="text-xs">Valor (R$)</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="Mín"
                  value={amountRange.min}
                  onChange={(e) => { setAmountRange({...amountRange, min: e.target.value}); resetPagination(); }}
                />
                <Input
                  type="number"
                  placeholder="Máx"
                  value={amountRange.max}
                  onChange={(e) => { setAmountRange({...amountRange, max: e.target.value}); resetPagination(); }}
                />
              </div>
            </div>

            {/* Ordenação */}
            <div>
              <Label className="text-xs">Ordenar por</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Select value={sortBy} onValueChange={(value: 'date' | 'amount' | 'description') => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Data</SelectItem>
                    <SelectItem value="amount">Valor</SelectItem>
                    <SelectItem value="description">Descrição</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Decrescente</SelectItem>
                    <SelectItem value="asc">Crescente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botão Limpar */}
            <Button 
              variant="outline" 
              onClick={clearAllFilters}
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 space-y-4 lg:space-y-6 min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Entradas</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie suas receitas e entradas financeiras</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Entrada
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Editar Entrada' : 'Nova Entrada'}</DialogTitle>
              <DialogDescription>
                {editingEntry ? 'Edite os dados da entrada.' : 'Adicione uma nova entrada financeira. Todos os campos são obrigatórios.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Ex: Salário mensal, Freelance..."
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Valor *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Entrada</SelectItem>
                      <SelectItem value="expense">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(cat => cat.type === formData.type)
                        .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
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
                <div className="grid gap-2">
                  <Label htmlFor="account">Conta *</Label>
                  <Select value={formData.account} onValueChange={(value) => setFormData({...formData, account: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Observações adicionais (opcional)"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingEntry ? 'Atualizar' : 'Criar'} Entrada
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de Visualização */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto mx-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Entrada</DialogTitle>
              <DialogDescription>
                Visualize todas as informações desta entrada financeira.
              </DialogDescription>
            </DialogHeader>
            {viewingEntry && (
              <div className="grid gap-6 py-4">
                <div className="grid gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Descrição</Label>
                    <p className="text-base font-medium mt-1">{viewingEntry.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={viewingEntry.type === 'income' ? 'default' : 'destructive'}>
                          {viewingEntry.type === 'income' ? 'Entrada' : 'Saída'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Valor</Label>
                      <p className={`text-xl font-bold mt-1 ${
                        viewingEntry.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {viewingEntry.type === 'income' ? '+' : '-'}{formatCurrency(viewingEntry.amount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: viewingEntry.category?.color }}
                      />
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Categoria</Label>
                        <p className="text-base font-medium">{viewingEntry.category?.name}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Conta</Label>
                      <p className="text-base font-medium mt-1">{viewingEntry.account?.name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Data</Label>
                    <p className="text-base font-medium mt-1">{formatDate(viewingEntry.date)}</p>
                  </div>
                  
                  {viewingEntry.notes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Observações</Label>
                      <p className="text-base font-medium mt-1">{viewingEntry.notes}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-mono">{viewingEntry.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Criado em</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {new Date(viewingEntry.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="w-full sm:w-auto">
                Fechar
              </Button>
              {viewingEntry && (
                <>
                  <Button onClick={() => generatePDF(viewingEntry)} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEdit(viewingEntry);
                  }} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

        {/* Lista de Entradas com Paginação */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Lista de Entradas</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredEntries.length)} - {Math.min(currentPage * itemsPerPage, filteredEntries.length)} de {filteredEntries.length}</span>
            </div>
          </div>

      {/* Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Entradas</CardTitle>
          <CardDescription>
            {filteredEntries.length} entrada(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Nenhuma entrada encontrada</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Tente ajustar os filtros de busca.' 
                  : 'Comece criando sua primeira entrada.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-4">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: entry.category?.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {entry.description}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                        <Badge variant={entry.type === 'income' ? 'default' : 'destructive'} className="text-xs w-fit">
                          {entry.type === 'income' ? 'Entrada' : 'Saída'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs w-fit">
                          {entry.category?.name}
                        </Badge>
                        <Badge variant="outline" className="text-xs w-fit">
                          {entry.account?.name}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <span className={`text-lg font-semibold text-center sm:text-right ${
                      entry.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                    </span>
                    <div className="flex space-x-2 justify-center sm:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(entry)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {filteredEntries.length > itemsPerPage && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                Página {currentPage} de {Math.ceil(filteredEntries.length / itemsPerPage)}
              </div>
              <div className="flex items-center space-x-2 overflow-x-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Anterior</span>
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(3, Math.ceil(filteredEntries.length / itemsPerPage)) }, (_, i) => {
                    const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
                    let pageNumber;
                    
                    if (totalPages <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 2) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 1) {
                      pageNumber = totalPages - 2 + i;
                    } else {
                      pageNumber = currentPage - 1 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className="w-8 h-8 p-0 flex-shrink-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(Math.ceil(filteredEntries.length / itemsPerPage), currentPage + 1))}
                  disabled={currentPage === Math.ceil(filteredEntries.length / itemsPerPage)}
                  className="flex-shrink-0"
                >
                  <span className="hidden sm:inline mr-1">Próxima</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
        </div>
      </div>
    </div>
  );
};

export default Entries;
