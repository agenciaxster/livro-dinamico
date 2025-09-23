import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Edit3, 
  Save, 
  X,
  ExternalLink,
  Navigation,
  Clock,
  Users,
  Wifi,
  Shield
} from 'lucide-react';

interface CompanyInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  cnpj: string;
  razaoSocial: string;
  website: string;
}

const Company: React.FC = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "Conectell Fibra Óptica",
    phone: "(33) 98832-0504",
    email: "contato@conectell.com.br",
    address: "Av. Pres. Castelo Branco - Virgem da Lapa, MG",
    cnpj: "",
    razaoSocial: "",
    website: "https://conectell.com.br"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<CompanyInfo>(companyInfo);

  const handleEdit = () => {
    setEditForm(companyInfo);
    setIsEditing(true);
  };

  const handleSave = () => {
    setCompanyInfo(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(companyInfo);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof CompanyInfo, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const openGoogleMaps = () => {
    const address = encodeURIComponent(companyInfo.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  const openWebsite = () => {
    window.open(companyInfo.website, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            {companyInfo.name}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Conectando você ao futuro com tecnologia de fibra óptica de alta qualidade
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações da Empresa */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Principal */}
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Building2 className="h-6 w-6 text-blue-600" />
                      Informações da Empresa
                    </CardTitle>
                    <CardDescription>
                      Dados principais da Conectell Fibra Óptica
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={handleEdit} variant="outline" size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Telefone</Label>
                        <p className="text-lg font-semibold">{companyInfo.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Mail className="h-5 w-5 text-green-600" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</Label>
                        <p className="text-lg font-semibold">{companyInfo.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <MapPin className="h-5 w-5 text-purple-600 mt-1" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Endereço</Label>
                        <p className="text-lg font-semibold">{companyInfo.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <Globe className="h-5 w-5 text-orange-600" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</Label>
                        <p className="text-lg font-semibold">{companyInfo.website}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Campos Editáveis */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Edit3 className="h-5 w-5" />
                    Informações Administrativas
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      {isEditing ? (
                        <Input
                          id="cnpj"
                          value={editForm.cnpj}
                          onChange={(e) => handleInputChange('cnpj', e.target.value)}
                          placeholder="00.000.000/0000-00"
                          className="font-mono"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <p className="font-mono text-lg">
                            {companyInfo.cnpj || "Não informado"}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="razaoSocial">Razão Social</Label>
                      {isEditing ? (
                        <Input
                          id="razaoSocial"
                          value={editForm.razaoSocial}
                          onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                          placeholder="Razão Social da Empresa"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <p className="text-lg">
                            {companyInfo.razaoSocial || "Não informado"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Serviços */}
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-blue-600" />
                  Nossos Serviços
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                    <Wifi className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Internet Fibra</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Alta velocidade e estabilidade</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                    <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Segurança</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Conexão segura e confiável</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Suporte 24h</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Atendimento especializado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mapa e Links */}
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Google Maps Embed */}
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3736.8!2d-42.3!3d-17.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDQ4JzAwLjAiUyA0MsKwMTgnMDAuMCJX!5e0!3m2!1spt-BR!2sbr!4v1"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização Conectell"
                  />
                </div>
                
                {/* Botões de Ação */}
                <div className="space-y-3">
                  <Button 
                    onClick={openGoogleMaps} 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Ver no Google Maps
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  
                  <Button 
                    onClick={openWebsite} 
                    variant="outline" 
                    className="w-full border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visitar Site
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Horário de Funcionamento */}
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Horário de Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Segunda - Sexta</span>
                    <Badge variant="outline">08:00 - 18:00</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Sábado</span>
                    <Badge variant="outline">08:00 - 12:00</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Domingo</span>
                    <Badge variant="secondary">Fechado</Badge>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      <Clock className="h-3 w-3 mr-1" />
                      Suporte 24h disponível
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Company;