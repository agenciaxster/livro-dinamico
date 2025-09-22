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
  BarChart3
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

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
  { title: "Contas", url: "/contas", icon: CreditCard },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
];

const managementItems = [
  { title: "Usuários", url: "/usuarios", icon: Users },
  { title: "Empresa", url: "/empresa", icon: Building2 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-soft rounded-lg mx-2" 
      : "hover:bg-accent/10 transition-all duration-200 rounded-lg mx-2 hover:shadow-soft";

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r border-border/50`}
      collapsible="icon"
    >
      <SidebarContent className="bg-gradient-sidebar border-r border-border/50">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-border/50">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-medium">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h2 className="font-bold text-lg text-foreground">Livro Caixa</h2>
                <p className="text-sm text-muted-foreground">Sistema Financeiro</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="px-3">
          <SidebarGroupLabel className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ${collapsed ? "sr-only" : ""}`}>
            Navegação Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses} end>
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

        {/* Management Section */}
        <SidebarGroup className="px-3">
          <SidebarGroupLabel className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ${collapsed ? "sr-only" : ""}`}>
            Gerenciamento  
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses}>
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
      </SidebarContent>
    </Sidebar>
  );
}