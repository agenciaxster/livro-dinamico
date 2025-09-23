import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  BarChart3,
  Calendar,
  Shield,
  User,
  CreditCard,
  FileText,
  Building2,
  Users,
  ArrowUpRight,
  Activity,
  Target,
  Wallet
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Mock data for demonstration
const mockData = {
  balance: "R$ 45.320,50",
  income: "R$ 28.450,00",
  expenses: "R$ 12.130,50",
  profit: "R$ 16.319,50",
  incomeChange: "+12.5% em relação ao mês anterior",
  expenseChange: "+8.2% em relação ao mês anterior",
  profitChange: "+15.3% em relação ao mês anterior"
};

export function Dashboard() {
  const { user, isAdmin, isClient } = useAuth();
  const navigate = useNavigate();

  // Cards data with navigation
  const dashboardCards = [
    // Financial Overview Cards
    {
      id: 'balance',
      title: 'Saldo Atual',
      value: mockData.balance,
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
      value: mockData.income,
      change: mockData.incomeChange,
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
      value: mockData.expenses,
      change: mockData.expenseChange,
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
      value: mockData.profit,
      change: mockData.profitChange,
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
      value: '24',
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
      value: '8',
      icon: CreditCard,
      gradient: 'from-teal-500 to-cyan-600',
      bgGradient: 'from-teal-50 to-cyan-100 dark:from-teal-950/50 dark:to-cyan-950/50',
      borderColor: 'border-teal-200/50 dark:border-teal-800/50',
      shadowColor: 'hover:shadow-teal-500/20',
      description: 'Contas bancárias',
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
        icon: Building2,
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

  return (
    <div className="p-4 sm:p-6 space-y-8 bg-background min-h-screen">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-border/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-primary shadow-medium">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                    Dashboard Financeiro
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {isAdmin ? 'Administrador' : 'Cliente'}
                    </div>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
                    <span className="text-sm text-muted-foreground">
                      Bem-vindo, <span className="font-medium text-foreground">{user?.name}</span>
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
                {isAdmin 
                  ? 'Painel administrativo completo com controle total do sistema e análises avançadas'
                  : 'Acompanhe suas finanças em tempo real com insights inteligentes e relatórios detalhados'
                }
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/80 backdrop-blur-sm border border-border/50 px-4 py-3 rounded-xl shadow-soft">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Última atualização</span>
                <span className="font-medium text-foreground">hoje às 14:30</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-success/10 text-success border border-success/20 px-4 py-2 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                Sistema online
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Unified Modern Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {dashboardCards.map((card, index) => (
          <div
            key={card.id}
            onClick={card.onClick}
            className={`group relative overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${card.shadowColor} hover:shadow-2xl`}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            {/* Background with gradient */}
            <div className={`relative bg-gradient-to-br ${card.bgGradient} border ${card.borderColor} rounded-2xl p-6 h-full`}>
              {/* Animated background circle */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 dark:bg-black/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
              
              {/* Content */}
              <div className="relative flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-r ${card.gradient} rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-foreground transition-colors duration-300" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                    {card.title}
                  </h3>
                  <p className="text-2xl font-bold text-foreground mb-2">
                    {card.value}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {card.description}
                  </p>
                  
                  {card.change && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      card.changeType === 'positive' 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {card.changeType === 'positive' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {card.change}
                    </div>
                  )}
                </div>
                
                {/* Hover indicator */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-1 bg-gradient-to-r from-primary to-accent rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}