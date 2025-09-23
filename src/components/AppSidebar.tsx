import { useState } from "react";
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  FileText, 
  Settings, 
  Users, 
  Building2,
  CreditCard,
  BarChart3,
  Shield,
  Tag,
  LogOut
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Entradas", url: "/entradas", icon: TrendingUp },
  { title: "Saídas", url: "/saidas", icon: TrendingDown },
  { title: "Categorias", url: "/categorias", icon: Tag, adminOnly: true },
  { title: "Contas", url: "/contas", icon: CreditCard },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
];

const managementItems = [
  { title: "Usuários", url: "/usuarios", icon: Users, adminOnly: true },
  { title: "Empresa", url: "/empresa", icon: Building2, adminOnly: true },
  { title: "Configurações", url: "/configuracoes", icon: Settings, adminOnly: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  
  // Filtrar itens de navegação baseado no role do usuário
  const filteredNavigationItems = navigationItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );
  
  // Filtrar itens de gerenciamento baseado no role do usuário
  const filteredManagementItems = managementItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

  const isActive = (path: string) => currentPath === path;
  const getNavClasses = (isActive: boolean) => {
    if (isActive) {
      return "!bg-blue-600 !text-white hover:!bg-blue-700";
    }
    return "!text-slate-700 dark:!text-zinc-200 hover:!bg-slate-200 dark:hover:!bg-zinc-800";
  };

  const getNavStyle = (isActive: boolean) => {
    if (isActive) {
      return {
        backgroundColor: 'rgb(37, 99, 235)',
        color: 'white'
      };
    }
    return {
      color: 'rgb(51, 65, 85)',
      backgroundColor: 'transparent'
    };
  };

  return (
    <Sidebar
      variant="sidebar" 
      collapsible="icon"
      style={{
        backgroundColor: 'rgb(248, 250, 252)',
        borderRight: '1px solid rgb(226, 232, 240)'
      }}
      className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 dark:!bg-zinc-900 dark:border-zinc-800`}
    >
      <SidebarContent 
        style={{
          backgroundColor: 'rgb(248, 250, 252)',
          color: 'rgb(30, 41, 59)'
        }}
        className="dark:!bg-zinc-900 dark:!text-zinc-100"
      >
        {/* Logo/Brand */}
        <div 
          className="p-6 border-b bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
        >
          <div className={`flex items-center ${collapsed ? "justify-center" : "space-x-3"}`}>
            <BarChart3 className="w-8 h-8 flex-shrink-0" style={{ color: 'rgb(59, 130, 246)' }} />
            {!collapsed && (
              <div className="animate-fade-in">
                <h2 
                  className="font-bold text-lg text-slate-800 dark:text-zinc-100"
                >
                  Livro Caixa
                </h2>
                <p 
                  className="text-sm text-slate-600 dark:text-zinc-400"
                >
                  Sistema Financeiro
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="px-3 mt-6">
          <SidebarGroupLabel 
            style={{ color: 'rgb(71, 85, 105)' }}
            className={`text-xs font-semibold dark:!text-zinc-400 uppercase tracking-wider mb-4 ${collapsed ? "sr-only" : ""}`}
          >
            Navegação Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {filteredNavigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(isActive(item.url))}
                      style={getNavStyle(isActive(item.url))}
                      end
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <span className="animate-fade-in">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Section - Only show if user has admin items or is admin */}
        {filteredManagementItems.length > 0 && (
          <SidebarGroup className="px-3 mt-8">
            <SidebarGroupLabel 
              style={{ color: 'rgb(71, 85, 105)' }}
              className={`text-xs font-semibold dark:!text-zinc-400 uppercase tracking-wider mb-4 ${collapsed ? "sr-only" : ""}`}
            >
              {user?.role === 'admin' ? (
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Administração
                </div>
              ) : (
                'Gerenciamento'
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {filteredManagementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={getNavClasses(isActive(item.url))}
                        style={getNavStyle(isActive(item.url))}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && (
                          <span className="animate-fade-in">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Logout Section */}
        <SidebarGroup className="px-3 mt-auto mb-6">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button 
                    onClick={logout}
                    className="!text-red-600 hover:!bg-red-50 dark:hover:!bg-red-950/20 hover:!text-red-700 dark:!text-red-400 dark:hover:!text-red-300 w-full"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="animate-fade-in">Sair</span>
                    )}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}