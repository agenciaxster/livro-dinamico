import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  BarChart3,
  Calendar
} from "lucide-react";
import { FinancialCard } from "./FinancialCard";
import { ChartCard } from "./ChartCard";

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
  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Financeiro</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral das suas finanças em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
          <Calendar className="w-4 h-4" />
          Última atualização: hoje às 14:30
        </div>
      </div>

      {/* Financial Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard
          title="Saldo Atual"
          value={mockData.balance}
          icon={DollarSign}
          className="bg-gradient-card"
        />
        <FinancialCard
          title="Total de Entradas"
          value={mockData.income}
          change={mockData.incomeChange}
          changeType="positive"
          icon={TrendingUp}
          className="bg-gradient-card"
        />
        <FinancialCard
          title="Total de Saídas"
          value={mockData.expenses}
          change={mockData.expenseChange}
          changeType="negative"
          icon={TrendingDown}
          className="bg-gradient-card"
        />
        <FinancialCard
          title="Lucro/Prejuízo"
          value={mockData.profit}
          change={mockData.profitChange}
          changeType="positive"
          icon={PieChart}
          className="bg-gradient-card"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Fluxo de Caixa - Últimos 6 Meses">
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Gráfico de Linha - Evolução do Fluxo de Caixa</p>
              <p className="text-xs mt-1">Dados serão carregados com integração ao backend</p>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Distribuição de Despesas por Categoria">
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center text-muted-foreground">
              <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Gráfico de Pizza - Categorias de Despesas</p>
              <p className="text-xs mt-1">Dados serão carregados com integração ao backend</p>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-success-light border border-success/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-success-foreground">Meta do Mês</h3>
              <p className="text-sm text-success/80">85% concluída - R$ 25.500,00</p>
            </div>
          </div>
        </div>

        <div className="bg-warning-light border border-warning/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-warning-foreground">Contas a Vencer</h3>
              <p className="text-sm text-warning/80">3 contas nos próximos 7 dias</p>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-primary">Relatórios</h3>
              <p className="text-sm text-primary/80">12 relatórios gerados este mês</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}