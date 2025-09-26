import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  CreditCard,
  Users,
  PieChart,
  Wallet,
  TrendingUp,
  TrendingDown,
  FileText,
  Settings,
  Building,
  Calendar,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  Target
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { entriesService } from "../services/entriesService";
import { accountsService } from "../services/accountsService";
import { categoriesService } from "../services/categoriesService";

interface DashboardData {
  balance: string;
  income: string;
  expenses: string;
  profit: string;
  incomeChange: string;
  expenseChange: string;
  profitChange: string;
  totalAccounts: number;
  totalCategories: number;
}

export function Dashboard() {
  const { user, isAdmin, isClient } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    balance: "R$ 0,00",
    income: "R$ 0,00",
    expenses: "R$ 0,00",
    profit: "R$ 0,00",
    incomeChange: "0% em relação ao mês anterior",
    expenseChange: "0% em relação ao mês anterior",
    profitChange: "0% em relação ao mês anterior",
    totalAccounts: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados em paralelo
      const [entriesResult, accountsResult, categoriesResult] = await Promise.all([
        entriesService.getEntries(),
        accountsService.getAccounts(),
        categoriesService.getCategories()
      ]);

      if (entriesResult.error || accountsResult.error || categoriesResult.error) {
        console.error('Erro ao buscar dados do dashboard');
        return;
      }

      const entries = entriesResult.entries || [];
      const accounts = accountsResult.accounts || [];
      const categories = categoriesResult.categories || [];

      // Calcular métricas
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const currentMonthEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      });

      const income = currentMonthEntries
        .filter(entry => entry.type === 'income')
        .reduce((sum, entry) => sum + Number(entry.amount), 0);
      
      const expenses = currentMonthEntries
        .filter(entry => entry.type === 'expense')
        .reduce((sum, entry) => sum + Number(entry.amount), 0);

      const balance = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
      const profit = income - expenses;

      // Formatação de valores
      const formatCurrency = (value: number) => 
        new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(value);

      setDashboardData({
        balance: formatCurrency(balance),
        income: formatCurrency(income),
        expenses: formatCurrency(expenses),
        profit: formatCurrency(profit),
        incomeChange: "Calculando...",
        expenseChange: "Calculando...",
        profitChange: "Calculando...",
        totalAccounts: accounts.length,
        totalCategories: categories.length
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cards data with navigation
  const dashboardCards = [
    // Financial Overview Cards
    {
      id: 'balance',
      title: 'Saldo Atual',
      value: dashboardData.balance,
      icon: Wallet,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50',
      borderColor: 'border-blue-200/50 dark:border-blue-800/50',
      shadowColor: 'hover:shadow-blue-500/20',
      description: 'Saldo disponível em conta',
      onClick: () => navigate('/contas'),
      category: 'financial'
    },
    {
      id: 'income',
      title: 'Total de Entradas',
      value: dashboardData.income,
      change: dashboardData.incomeChange,
      changeType: 'positive',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-100 dark:from-emerald-950/50 dark:to-green-950/50',
      borderColor: 'border-emerald-200/50 dark:border-emerald-800/50',
      shadowColor: 'hover:shadow-emerald-500/20',
      description: 'Receitas do período',
      onClick: () => navigate('/entradas'),
      category: 'financial'
    },
    {
      id: 'expenses',
      title: 'Total de Saídas',
      value: dashboardData.expenses,
      change: dashboardData.expenseChange,
      changeType: 'negative',
      icon: TrendingDown,
      gradient: 'from-red-500 to-rose-600',
      bgGradient: 'from-red-50 to-rose-100 dark:from-red-950/50 dark:to-rose-950/50',
      borderColor: 'border-red-200/50 dark:border-red-800/50',
      shadowColor: 'hover:shadow-red-500/20',
      description: 'Despesas do período',
      onClick: () => navigate('/despesas'),
      category: 'financial'
    },
    {
      id: 'profit',
      title: 'Lucro/Prejuízo',
      value: dashboardData.profit,
      change: dashboardData.profitChange,
      changeType: 'positive',
      icon: Activity,
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-100 dark:from-purple-950/50 dark:to-violet-950/50',
      borderColor: 'border-purple-200/50 dark:border-purple-800/50',
      shadowColor: 'hover:shadow-purple-500/20',
      description: 'Resultado líquido',
      onClick: () => navigate('/relatorios'),
      category: 'financial'
    },
    // Management Cards
    {
      id: 'categories',
      title: 'Categorias',
      value: dashboardData.totalCategories.toString(),
      icon: PieChart,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50',
      borderColor: 'border-amber-200/50 dark:border-amber-800/50',
      shadowColor: 'hover:shadow-amber-500/20',
      description: 'Categorias cadastradas',
      onClick: () => navigate('/categorias'),
      category: 'management'
    },
    {
      id: 'accounts',
      title: 'Contas',
      value: dashboardData.totalAccounts.toString(),
      icon: CreditCard,
      gradient: 'from-teal-500 to-cyan-600',
      bgGradient: 'from-teal-50 to-cyan-100 dark:from-teal-950/50 dark:to-cyan-950/50',
      borderColor: 'border-teal-200/50 dark:border-teal-800/50',
      shadowColor: 'hover:shadow-teal-500/20',
      description: 'Contas bancárias ativas',
      onClick: () => navigate('/contas'),
      category: 'management'
    },
    {
      id: 'reports',
      title: 'Relatórios',
      value: '12',
      icon: FileText,
      gradient: 'from-indigo-500 to-blue-600',
      bgGradient: 'from-indigo-50 to-blue-100 dark:from-indigo-950/50 dark:to-blue-950/50',
      borderColor: 'border-indigo-200/50 dark:border-indigo-800/50',
      shadowColor: 'hover:shadow-indigo-500/20',
      description: 'Relatórios gerados',
      onClick: () => navigate('/relatorios'),
      category: 'management'
    },
    {
      id: 'goals',
      title: 'Metas',
      value: '85%',
      icon: Target,
      gradient: 'from-pink-500 to-rose-600',
      bgGradient: 'from-pink-50 to-rose-100 dark:from-pink-950/50 dark:to-rose-950/50',
      borderColor: 'border-pink-200/50 dark:border-pink-800/50',
      shadowColor: 'hover:shadow-pink-500/20',
      description: 'Meta mensal atingida',
      onClick: () => navigate('/relatorios'),
      category: 'management'
    }
  ];

  // Add admin-only cards
  if (isAdmin) {
    dashboardCards.push(
      {
        id: 'users',
        title: 'Usuários',
        value: '1,247',
        icon: Users,
        gradient: 'from-slate-500 to-gray-600',
        bgGradient: 'from-slate-50 to-gray-100 dark:from-slate-950/50 dark:to-gray-950/50',
        borderColor: 'border-slate-200/50 dark:border-slate-800/50',
        shadowColor: 'hover:shadow-slate-500/20',
        description: 'Usuários cadastrados',
        onClick: () => navigate('/usuarios'),
        category: 'admin'
      },
      {
        id: 'company',
        title: 'Empresa',
        value: '1',
        icon: Building,
        gradient: 'from-emerald-500 to-teal-600',
        bgGradient: 'from-emerald-50 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50',
        borderColor: 'border-emerald-200/50 dark:border-emerald-800/50',
        shadowColor: 'hover:shadow-emerald-500/20',
        description: 'Dados da empresa',
        onClick: () => navigate('/empresa'),
        category: 'admin'
      }
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral do sistema financeiro
          </p>
        </div>
      </div>

      {/* Financial Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.filter(card => card.category === 'financial').map((card) => {
          const IconComponent = card.icon;
          return (
            <Card
              key={card.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${card.shadowColor} ${card.borderColor} ${card.bgGradient}`}
              onClick={card.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${card.gradient} p-2 text-white`}>
                  <IconComponent className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.change && (
                  <p className={`text-xs ${card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {card.change}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Management Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {dashboardCards.filter(card => card.category === 'management').map((card) => {
          const IconComponent = card.icon;
          return (
            <Card
              key={card.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${card.shadowColor} ${card.borderColor} ${card.bgGradient}`}
              onClick={card.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${card.gradient} p-2 text-white`}>
                  <IconComponent className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
