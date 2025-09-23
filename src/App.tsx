import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import Entries from "./pages/Entries";
import Expenses from "./pages/Expenses";
import Accounts from "./pages/Accounts";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Company from "./pages/Company";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Dashboard />} />
        
        {/* Rotas com acesso restrito para clientes */}
        <Route 
          path="/entradas" 
          element={
            <ProtectedRoute>
              <Entries />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/saidas" 
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/contas" 
          element={
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/relatorios" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />
        
        {/* Rotas exclusivas para administradores */}
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute isAdmin={true}>
              <Users />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/empresa" 
          element={
            <ProtectedRoute isAdmin={true}>
              <Company />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/configuracoes" 
          element={
            <ProtectedRoute isAdmin={true}>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/categorias" 
          element={
            <ProtectedRoute isAdmin={true}>
              <Categories />
            </ProtectedRoute>
          } 
        />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

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
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
