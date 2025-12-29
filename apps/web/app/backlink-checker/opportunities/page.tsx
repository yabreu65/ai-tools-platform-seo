'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Search, ExternalLink, Mail, Download, Filter, Target, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

interface OpportunityRequest {
  domain: string;
  competitors: string[];
}

interface LinkOpportunity {
  id: string;
  domain: string;
  url: string;
  title: string;
  domainAuthority: number;
  pageAuthority: number;
  trustFlow: number;
  citationFlow: number;
  difficulty: number;
  relevanceScore: number;
  contactEmail?: string;
  socialMedia: {
    twitter?: string;
    linkedin?: string;
  };
  opportunityType: 'guest_post' | 'resource_page' | 'broken_link' | 'competitor_gap' | 'directory' | 'partnership';
  estimatedValue: number;
  lastUpdated: string;
  notes?: string;
}

interface OpportunityResponse {
  success: boolean;
  data?: {
    domain: string;
    analysisId: string;
    analysisDate: string;
    overview: {
      totalOpportunities: number;
      highPriorityOpportunities: number;
      easyAccessOpportunities: number;
      averageDifficulty: number;
      estimatedTotalValue: number;
    };
    opportunities: LinkOpportunity[];
    opportunityTypes: Array<{ type: string; count: number; avgDifficulty: number }>;
    difficultyVsAuthority: Array<{ difficulty: number; authority: number; count: number }>;
    competitorAnalysis: Array<{
      competitor: string;
      sharedOpportunities: number;
      uniqueOpportunities: number;
      avgDomainAuthority: number;
    }>;
  };
  message?: string;
}

export default function LinkOpportunitiesPage() {
  const [domain, setDomain] = useState('');
  const [competitors, setCompetitors] = useState<string[]>(['']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [opportunityData, setOpportunityData] = useState<OpportunityResponse['data'] | null>(null);
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'guest_post' | 'resource_page' | 'broken_link' | 'competitor_gap' | 'directory' | 'partnership'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const handleAnalyze = async () => {
    if (!domain) {
      toast.error('Por favor ingresa un dominio');
      return;
    }

    const validCompetitors = competitors.filter(c => c.trim() !== '');
    if (validCompetitors.length === 0) {
      toast.error('Por favor ingresa al menos un competidor');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const requestData: OpportunityRequest = { 
        domain, 
        competitors: validCompetitors 
      };

      const response = await fetch('/api/backlink-checker/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result: OpportunityResponse = await response.json();

      if (result.success && result.data) {
        setOpportunityData(result.data);
        toast.success('Análisis de oportunidades completado');
      } else {
        toast.error(result.message || 'Error en el análisis');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al analizar oportunidades');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addCompetitor = () => {
    setCompetitors([...competitors, '']);
  };

  const updateCompetitor = (index: number, value: string) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  const removeCompetitor = (index: number) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter((_, i) => i !== index));
    }
  };

  const filteredOpportunities = opportunityData?.opportunities.filter(opp => {
    const typeMatch = filterType === 'all' || opp.opportunityType === filterType;
    const difficultyMatch = filterDifficulty === 'all' || 
      (filterDifficulty === 'easy' && opp.difficulty <= 30) ||
      (filterDifficulty === 'medium' && opp.difficulty > 30 && opp.difficulty <= 70) ||
      (filterDifficulty === 'hard' && opp.difficulty > 70);
    
    return typeMatch && difficultyMatch;
  }) || [];

  const handleSelectOpportunity = (oppId: string) => {
    setSelectedOpportunities(prev => 
      prev.includes(oppId) 
        ? prev.filter(id => id !== oppId)
        : [...prev, oppId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOpportunities.length === filteredOpportunities.length) {
      setSelectedOpportunities([]);
    } else {
      setSelectedOpportunities(filteredOpportunities.map(opp => opp.id));
    }
  };

  const exportOpportunities = () => {
    if (selectedOpportunities.length === 0) {
      toast.error('Selecciona al menos una oportunidad para exportar');
      return;
    }

    const selectedData = filteredOpportunities.filter(opp => selectedOpportunities.includes(opp.id));
    const csvContent = [
      'Domain,URL,Title,DA,PA,Difficulty,Type,Contact Email,Estimated Value',
      ...selectedData.map(opp => 
        `${opp.domain},${opp.url},"${opp.title}",${opp.domainAuthority},${opp.pageAuthority},${opp.difficulty},${opp.opportunityType},${opp.contactEmail || ''},${opp.estimatedValue}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `link-opportunities-${domain}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`${selectedOpportunities.length} oportunidades exportadas`);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return 'bg-green-100 text-green-800 border-green-200';
    if (difficulty <= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 30) return 'Fácil';
    if (difficulty <= 70) return 'Medio';
    return 'Difícil';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'guest_post': 'Guest Post',
      'resource_page': 'Página de Recursos',
      'broken_link': 'Enlace Roto',
      'competitor_gap': 'Gap Competidor',
      'directory': 'Directorio',
      'partnership': 'Partnership'
    };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Oportunidades de Link Building</h1>
          <p className="text-muted-foreground">Encuentra y analiza oportunidades de enlaces de alta calidad</p>
        </div>
      </div>

      {/* Formulario de Análisis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Configurar Análisis
          </CardTitle>
          <CardDescription>
            Ingresa tu dominio y competidores para encontrar oportunidades de enlaces
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="domain">Tu Dominio</Label>
            <Input
              id="domain"
              placeholder="ejemplo.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>

          <div>
            <Label>Competidores</Label>
            <div className="space-y-2">
              {competitors.map((competitor, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`competidor${index + 1}.com`}
                    value={competitor}
                    onChange={(e) => updateCompetitor(index, e.target.value)}
                  />
                  {competitors.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCompetitor(index)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addCompetitor}>
                Agregar Competidor
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !domain}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analizando oportunidades...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Buscar Oportunidades
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados del Análisis */}
      {opportunityData && (
        <>
          {/* Métricas Principales */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{opportunityData.overview.totalOpportunities}</div>
                <p className="text-xs text-muted-foreground">Total Oportunidades</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{opportunityData.overview.highPriorityOpportunities}</div>
                <p className="text-xs text-muted-foreground">Alta Prioridad</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{opportunityData.overview.easyAccessOpportunities}</div>
                <p className="text-xs text-muted-foreground">Fácil Acceso</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{selectedOpportunities.length}</div>
                <p className="text-xs text-muted-foreground">Seleccionadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">${opportunityData.overview.estimatedTotalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Valor Estimado</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs de Contenido */}
          <Tabs defaultValue="opportunities" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
              <TabsTrigger value="analysis">Análisis</TabsTrigger>
              <TabsTrigger value="competitors">Competidores</TabsTrigger>
            </TabsList>

            <TabsContent value="opportunities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Oportunidades Encontradas ({filteredOpportunities.length})</span>
                    <div className="flex gap-2">
                      <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="px-3 py-1 border rounded-md text-sm"
                      >
                        <option value="all">Todos los tipos</option>
                        <option value="guest_post">Guest Post</option>
                        <option value="resource_page">Página de Recursos</option>
                        <option value="broken_link">Enlace Roto</option>
                        <option value="competitor_gap">Gap Competidor</option>
                        <option value="directory">Directorio</option>
                        <option value="partnership">Partnership</option>
                      </select>
                      <select 
                        value={filterDifficulty} 
                        onChange={(e) => setFilterDifficulty(e.target.value as any)}
                        className="px-3 py-1 border rounded-md text-sm"
                      >
                        <option value="all">Todas las dificultades</option>
                        <option value="easy">Fácil (≤30)</option>
                        <option value="medium">Medio (31-70)</option>
                        <option value="hard">Difícil (&gt;70)</option>
                      </select>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectedOpportunities.length === filteredOpportunities.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                      </Button>
                      <Button 
                        onClick={exportOpportunities}
                        disabled={selectedOpportunities.length === 0}
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar ({selectedOpportunities.length})
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredOpportunities.slice(0, 20).map((opportunity) => (
                      <div key={opportunity.id} className="flex items-start gap-3 p-4 border rounded-lg">
                        <Checkbox
                          checked={selectedOpportunities.includes(opportunity.id)}
                          onCheckedChange={() => handleSelectOpportunity(opportunity.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <a 
                              href={opportunity.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:underline truncate"
                            >
                              {opportunity.title}
                            </a>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 truncate">
                            {opportunity.domain}
                          </p>
                          <div className="flex gap-2 mb-2">
                            <Badge className={getDifficultyColor(opportunity.difficulty)}>
                              {getDifficultyLabel(opportunity.difficulty)}
                            </Badge>
                            <Badge variant="outline">
                              {getTypeLabel(opportunity.opportunityType)}
                            </Badge>
                            <Badge variant="secondary">
                              DA: {opportunity.domainAuthority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>PA: {opportunity.pageAuthority}</span>
                            <span>TF: {opportunity.trustFlow}</span>
                            <span>CF: {opportunity.citationFlow}</span>
                            <span>Relevancia: {opportunity.relevanceScore}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ${opportunity.estimatedValue}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            Valor estimado
                          </div>
                          <div className="flex gap-1">
                            {opportunity.contactEmail && (
                              <Button size="sm" variant="outline">
                                <Mail className="h-3 w-3 mr-1" />
                                Contactar
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tipos de Oportunidades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={opportunityData.opportunityTypes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dificultad vs Autoridad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={opportunityData.difficultyVsAuthority}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="difficulty" name="Dificultad" />
                        <YAxis dataKey="authority" name="Autoridad" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter dataKey="count" fill="#10b981" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="competitors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Competidores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {opportunityData.competitorAnalysis.map((competitor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{competitor.competitor}</div>
                          <div className="text-sm text-muted-foreground">
                            DA promedio: {competitor.avgDomainAuthority}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="font-medium text-blue-600">{competitor.sharedOpportunities}</span> compartidas
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-green-600">{competitor.uniqueOpportunities}</span> únicas
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
            <Button 
              onClick={exportOpportunities}
              disabled={selectedOpportunities.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Seleccionadas ({selectedOpportunities.length})
            </Button>
          </div>
        </>
      )}
    </div>
  );
}