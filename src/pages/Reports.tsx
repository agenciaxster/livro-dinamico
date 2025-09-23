import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar, FileText, Download, Clock, User, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, FileBarChart, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";

// Interfaces
interface ReportData {
  id: string;
  title: string;
  description: string;
  type: "financial" | "entries" | "expenses" | "accounts" | "categories";
  icon: React.ReactNode;
  data: Record<string, unknown>[];
  summary: {
    total: number;
    count: number;
    average: number;
  };
}

interface ReportFilter {
  type: string;
  dateFrom: string;
  dateTo: string;
  category: string;
  status: string;
}

interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  generatedAt: string;
  generatedBy: string;
  fileName: string;
}

const Reports: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [filters, setFilters] = useState<ReportFilter>({
    type: "",
    dateFrom: "",
    dateTo: "",
    category: "",
    status: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [currentUser] = useState("João Silva"); // Simulando usuário logado
  
  // Estados para modais CRUD
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);
  const [editingReport, setEditingReport] = useState<GeneratedReport | null>(null);
  
  // Estados para visualização de tipos de relatório
  const [isViewReportTypeDialogOpen, setIsViewReportTypeDialogOpen] = useState(false);
  const [selectedReportTypeModal, setSelectedReportTypeModal] = useState<ReportData | null>(null);

  // Função para traduzir tipos de relatório
  const translateReportType = (type: string): string => {
    const translations: { [key: string]: string } = {
      "financial": "FINANCEIRO",
      "entries": "ENTRADAS", 
      "expenses": "SAÍDAS",
      "accounts": "CONTAS",
      "categories": "CATEGORIAS"
    };
    return translations[type] || type.toUpperCase();
  };

  // Função para visualizar tipos de relatório
  const handleViewReportType = (reportType: ReportData) => {
    setSelectedReportTypeModal(reportType);
    setIsViewReportTypeDialogOpen(true);
  };

  // Funções CRUD para relatórios gerados
  const handleViewReport = (report: GeneratedReport) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const handleEditReport = (report: GeneratedReport) => {
    setEditingReport({ ...report });
    setIsEditDialogOpen(true);
  };

  const handleDeleteReport = (report: GeneratedReport) => {
    setSelectedReport(report);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteReport = () => {
    if (selectedReport) {
      setGeneratedReports(prev => prev.filter(report => report.id !== selectedReport.id));
      setIsDeleteDialogOpen(false);
      setSelectedReport(null);
    }
  };

  const saveEditedReport = () => {
    if (editingReport) {
      setGeneratedReports(prev => 
        prev.map(report => 
          report.id === editingReport.id ? editingReport : report
        )
      );
      setIsEditDialogOpen(false);
      setEditingReport(null);
    }
  };

  // Mock data para diferentes tipos de relatórios
  const reportTypes: ReportData[] = [
    {
      id: "financial",
      title: "Relatório Financeiro Geral",
      description: "Visão completa das finanças da empresa",
      type: "financial",
      icon: <DollarSign className="h-6 w-6" />,
      data: [],
      summary: { total: 125000, count: 245, average: 510.20 }
    },
    {
      id: "entries",
      title: "Relatório de Entradas",
      description: "Análise detalhada das receitas",
      type: "entries",
      icon: <TrendingUp className="h-6 w-6" />,
      data: [],
      summary: { total: 85000, count: 120, average: 708.33 }
    },
    {
      id: "expenses",
      title: "Relatório de Saídas",
      description: "Controle de gastos e despesas",
      type: "expenses",
      icon: <TrendingDown className="h-6 w-6" />,
      data: [],
      summary: { total: 40000, count: 125, average: 320.00 }
    },
    {
      id: "accounts",
      title: "Relatório de Contas",
      description: "Status e movimentação das contas",
      type: "accounts",
      icon: <BarChart3 className="h-6 w-6" />,
      data: [],
      summary: { total: 4, count: 4, average: 31250 }
    },
    {
      id: "categories",
      title: "Relatório por Categorias",
      description: "Análise por categorias de transações",
      type: "categories",
      icon: <PieChart className="h-6 w-6" />,
      data: [],
      summary: { total: 12, count: 245, average: 20.42 }
    }
  ];

  // Função para gerar PDF sofisticado
  const generatePDF = async (reportType: ReportData) => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      
      // Configurações de cores
      const primaryColor = [59, 130, 246]; // Blue-500
      const secondaryColor = [107, 114, 128]; // Gray-500
      const accentColor = [239, 68, 68]; // Red-500
      
      // Header sofisticado
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Logo (simulado)
      pdf.setFillColor(255, 255, 255);
      pdf.circle(20, 20, 12, 'F');
      pdf.setTextColor(59, 130, 246);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("C", 16, 25);
      
      // Título da empresa
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("CONECTELL", 40, 20);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Sistema de Gestão Financeira", 40, 28);
      
      // Data e hora de geração
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR');
      const timeStr = now.toLocaleTimeString('pt-BR');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.text(`Gerado em: ${dateStr} às ${timeStr}`, pageWidth - 80, 20);
      pdf.text(`Por: ${currentUser}`, pageWidth - 80, 28);
      
      // Título do relatório
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text(reportType.title, 20, 60);
      
      // Descrição
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...secondaryColor);
      pdf.text(reportType.description, 20, 70);
      
      // Linha separadora
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(0.5);
      pdf.line(20, 75, pageWidth - 20, 75);
      
      // Informações do período
      let yPosition = 90;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("Período do Relatório", 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...secondaryColor);
      const fromDate = filters.dateFrom || "01/01/2024";
      const toDate = filters.dateTo || dateStr;
      pdf.text(`De: ${fromDate} até ${toDate}`, 20, yPosition);
      
      // Resumo executivo
      yPosition += 20;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("Resumo Executivo", 20, yPosition);
      
      // Cards de resumo
      yPosition += 15;
      const cardWidth = (pageWidth - 60) / 3;
      
      // Card 1 - Total
      pdf.setFillColor(249, 250, 251);
      pdf.rect(20, yPosition, cardWidth, 30, 'F');
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(20, yPosition, cardWidth, 30);
      
      pdf.setFontSize(10);
      pdf.setTextColor(...secondaryColor);
      pdf.text("VALOR TOTAL", 25, yPosition + 10);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...accentColor);
      pdf.text(`R$ ${reportType.summary.total.toLocaleString('pt-BR')}`, 25, yPosition + 22);
      
      // Card 2 - Quantidade
      const card2X = 30 + cardWidth;
      pdf.setFillColor(249, 250, 251);
      pdf.rect(card2X, yPosition, cardWidth, 30, 'F');
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(card2X, yPosition, cardWidth, 30);
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...secondaryColor);
      pdf.text("QUANTIDADE", card2X + 5, yPosition + 10);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...primaryColor);
      pdf.text(`${reportType.summary.count}`, card2X + 5, yPosition + 22);
      
      // Card 3 - Média
      const card3X = 40 + cardWidth * 2;
      pdf.setFillColor(249, 250, 251);
      pdf.rect(card3X, yPosition, cardWidth, 30, 'F');
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(card3X, yPosition, cardWidth, 30);
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...secondaryColor);
      pdf.text("VALOR MÉDIO", card3X + 5, yPosition + 10);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(34, 197, 94);
      pdf.text(`R$ ${reportType.summary.average.toLocaleString('pt-BR')}`, card3X + 5, yPosition + 22);
      
      // Filtros aplicados
      yPosition += 50;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("Filtros Aplicados", 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...secondaryColor);
      
      if (filters.category && filters.category !== "todas") {
        pdf.text(`• Categoria: ${filters.category}`, 25, yPosition);
        yPosition += 8;
      }
      if (filters.status && filters.status !== "todos") {
        pdf.text(`• Status: ${filters.status}`, 25, yPosition);
        yPosition += 8;
      }
      if ((!filters.category || filters.category === "todas") && (!filters.status || filters.status === "todos")) {
        pdf.text("• Nenhum filtro específico aplicado", 25, yPosition);
        yPosition += 8;
      }
      
      // Observações
      yPosition += 15;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("Observações", 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...secondaryColor);
      pdf.text("• Este relatório foi gerado automaticamente pelo sistema.", 25, yPosition);
      yPosition += 8;
      pdf.text("• Os dados apresentados refletem as informações disponíveis no momento da geração.", 25, yPosition);
      yPosition += 8;
      pdf.text("• Para dúvidas ou esclarecimentos, entre em contato com o setor financeiro.", 25, yPosition);
      
      // Footer sofisticado
      const footerY = pageHeight - 30;
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, footerY, pageWidth, 30, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text("CONECTELL - Sistema de Gestão Financeira", 20, footerY + 10);
      pdf.text(`Relatório gerado por ${currentUser} em ${dateStr} às ${timeStr}`, 20, footerY + 18);
      
      pdf.setTextColor(255, 255, 255);
      pdf.text(`Página 1 de 1`, pageWidth - 40, footerY + 14);
      
      // Salvar e abrir PDF
      const fileName = `relatorio-${reportType.type}-${dateStr.replace(/\//g, '-')}-${timeStr.replace(/:/g, '-')}.pdf`;
      pdf.save(fileName);
      
      // Adicionar à lista de relatórios gerados
      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        title: reportType.title,
        type: reportType.type,
        generatedAt: `${dateStr} ${timeStr}`,
        generatedBy: currentUser,
        fileName
      };
      
      setGeneratedReports(prev => [newReport, ...prev]);
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Gere e exporte relatórios detalhados do sistema</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <User className="h-4 w-4" />
          <span>{currentUser}</span>
          <Separator orientation="vertical" className="h-4" />
          <Clock className="h-4 w-4" />
          <span>{new Date().toLocaleString('pt-BR')}</span>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros de Relatório
          </CardTitle>
          <CardDescription>
            Configure os parâmetros para personalizar seu relatório
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Data Inicial</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Data Final</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors">
                    {report.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resumo rápido */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="font-semibold text-sm">R$ {report.summary.total.toLocaleString('pt-BR')}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Itens</div>
                  <div className="font-semibold text-sm">{report.summary.count}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Média</div>
                  <div className="font-semibold text-sm">R$ {report.summary.average.toLocaleString('pt-BR')}</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleViewReportType(report)}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
                <Button 
                  onClick={() => generatePDF(report)}
                  disabled={isGenerating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Gerar PDF
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Histórico de Relatórios Gerados */}
      {generatedReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5" />
              Relatórios Gerados Recentemente
            </CardTitle>
            <CardDescription>
              Histórico dos últimos relatórios exportados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generatedReports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">{report.title}</div>
                      <div className="text-sm text-gray-500">
                        Gerado por {report.generatedBy} em {report.generatedAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {translateReportType(report.type)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewReport(report)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditReport(report)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteReport(report)}>
                          <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                          <span className="text-red-500">Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Visualização de Tipo de Relatório */}
      <Dialog open={isViewReportTypeDialogOpen} onOpenChange={setIsViewReportTypeDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visualizar Relatório - {selectedReportTypeModal?.title}
            </DialogTitle>
            <DialogDescription>
              Detalhes e preview do relatório selecionado
            </DialogDescription>
          </DialogHeader>
          {selectedReportTypeModal && (
            <div className="space-y-6">
              {/* Informações do Relatório */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tipo de Relatório</Label>
                  <p className="text-sm text-gray-700">{selectedReportTypeModal.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Descrição</Label>
                  <p className="text-sm text-gray-700">{selectedReportTypeModal.description}</p>
                </div>
              </div>

              {/* Resumo Estatístico */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Resumo Estatístico</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Total</span>
                    </div>
                    <p className="text-lg font-bold text-blue-900">
                      R$ {selectedReportTypeModal.summary.total.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Itens</span>
                    </div>
                    <p className="text-lg font-bold text-green-900">
                      {selectedReportTypeModal.summary.count}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Média</span>
                    </div>
                    <p className="text-lg font-bold text-purple-900">
                      R$ {selectedReportTypeModal.summary.average.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview dos Dados */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Preview dos Dados</Label>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-700">
                      Últimas {selectedReportTypeModal.summary.count} entradas
                    </p>
                  </div>
                  <div className="p-4 space-y-2 max-h-40 overflow-y-auto">
                    {Array.from({ length: Math.min(5, selectedReportTypeModal.summary.count) }, (_, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">
                          Item {i + 1} - {selectedReportTypeModal.title}
                        </span>
                        <span className="text-sm font-medium">
                          R$ {(selectedReportTypeModal.summary.average * (0.8 + Math.random() * 0.4)).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewReportTypeDialogOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              setIsViewReportTypeDialogOpen(false);
              if (selectedReportTypeModal) generatePDF(selectedReportTypeModal);
            }}>
              <Download className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visualizar Relatório
            </DialogTitle>
            <DialogDescription>
              Detalhes do relatório gerado
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Título</Label>
                  <p className="text-sm text-gray-700">{selectedReport.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <Badge variant="outline" className="text-xs">
                    {translateReportType(selectedReport.type)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Gerado por</Label>
                  <p className="text-sm text-gray-700">{selectedReport.generatedBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data de geração</Label>
                  <p className="text-sm text-gray-700">{selectedReport.generatedAt}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Filtros aplicados</Label>
                <p className="text-sm text-gray-700">{selectedReport.filters}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Relatório
            </DialogTitle>
            <DialogDescription>
              Edite as informações do relatório
            </DialogDescription>
          </DialogHeader>
          {editingReport && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editingReport.title}
                  onChange={(e) => setEditingReport({...editingReport, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-filters">Filtros aplicados</Label>
                <Input
                  id="edit-filters"
                  value={editingReport.filters}
                  onChange={(e) => setEditingReport({...editingReport, filters: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveEditedReport}>
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o relatório "{selectedReport?.title}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteReport}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Reports;