import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/entradas" element={<div className="p-6"><h1 className="text-2xl font-bold">Entradas</h1><p className="text-muted-foreground">Módulo em desenvolvimento</p></div>} />
            <Route path="/saidas" element={<div className="p-6"><h1 className="text-2xl font-bold">Saídas</h1><p className="text-muted-foreground">Módulo em desenvolvimento</p></div>} />
            <Route path="/contas" element={<div className="p-6"><h1 className="text-2xl font-bold">Contas</h1><p className="text-muted-foreground">Módulo em desenvolvimento</p></div>} />
            <Route path="/relatorios" element={<div className="p-6"><h1 className="text-2xl font-bold">Relatórios</h1><p className="text-muted-foreground">Módulo em desenvolvimento</p></div>} />
            <Route path="/usuarios" element={<div className="p-6"><h1 className="text-2xl font-bold">Usuários</h1><p className="text-muted-foreground">Módulo em desenvolvimento</p></div>} />
            <Route path="/empresa" element={<div className="p-6"><h1 className="text-2xl font-bold">Empresa</h1><p className="text-muted-foreground">Módulo em desenvolvimento</p></div>} />
            <Route path="/configuracoes" element={<div className="p-6"><h1 className="text-2xl font-bold">Configurações</h1><p className="text-muted-foreground">Módulo em desenvolvimento</p></div>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
