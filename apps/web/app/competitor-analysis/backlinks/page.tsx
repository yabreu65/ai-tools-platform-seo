'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { Link, TrendingUp, TrendingDown, Target, Download, Filter, Eye, AlertCircle, Lightbulb, ExternalLink, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const BacklinkAnalysis = () => {
  const [domains, setDomains] = useState(['']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [filters, setFilters] = useState({
    minDomainRating: 30,
    linkTypes: ['dofollow', 'nofollow'],
    includeNew: true,
    includeLost: true
  });

  // Mock data para backlinks
  const mockBacklinkData = {
    summary: {
      totalBacklinks: 1247,
      uniqueDomains: 456,
      dofollowLinks: 987,
      nofollowLinks: 260,
      newBacklinks: 23,
      lostBacklinks: 8,
      avgDomainRating: 58,
      highStrengthLinks: 234,
      opportunities: 45,
      backlinkGaps: 12
    },
    backlinks: [
      {
        id: 'bl_1',
        sourceDomain: 'techcrunch.com',
        sourceUrl: 'https://techcrunch.com/seo-tools-review',
        targetUrl: 'https://example.com/tools',
        anchorText: 'best seo tools',
        linkType: 'dofollow',
        domainRating: 85,
        traffic: 5000,
        firstSeen: '2024-01-15',
        lastSeen: '2024-01-20',
        status: 'active',
        linkStrength: 'high'
      },
      {
        id: 'bl_2',
        sourceDomain: 'searchengineland.com',
        sourceUrl: 'https://searchengineland.com/keyword-research-guide',
        targetUrl: 'https://example.com/keyword-research',
        anchorText: 'keyword research tool',
        linkType: 'dofollow',
        domainRating: 78,
        traffic: 3200,
        firstSeen: '2024-01-10',
        lastSeen: '2024-01-18',
        status: 'active',
        linkStrength: 'high'
      },
      {
        id: 'bl_3',
        sourceDomain: 'moz.com',
        sourceUrl: 'https://moz.com/blog/seo-audit-checklist',
        targetUrl: 'https://example.com/audit',
        anchorText: 'seo audit',
        linkType: 'dofollow',
        domainRating: 82,
        traffic: 2800,
        firstSeen: '2024-01-05',
        lastSeen: '2024-01-15',
        status: 'new',
        linkStrength: 'high'
      }
    ],
    opportunities: [
      {
        domain: 'hubspot.com',
        domainRating: 88,
        traffic: 125000,
        relevanceScore: 92,
        linkingToCompetitors: ['competitor1.com', 'competitor2.com'],
        potentialAnchorTexts: ['marketing tools', 'seo software'],
        contactInfo: {
          email: 'partnerships@hubspot.com',
          social: ['https://twitter.com/hubspot']
        },
        difficulty: 'hard'
      },
      {
        domain: 'contentmarketinginstitute.com',
        domainRating: 72,
        traffic: 45000,
        relevanceScore: 85,
        linkingToCompetitors: ['competitor1.com'],
        potentialAnchorTexts: ['content optimization', 'seo tools'],
        contactInfo: {
          email: 'editor@contentmarketinginstitute.com',
          social: ['https://twitter.com/cmicontent']
        },
        difficulty: 'medium'
      },
      {
        domain: 'marketingland.com',
        domainRating: 68,
        traffic: 38000,
        relevanceScore: 78,
        linkingToCompetitors: ['competitor2.com'],
        potentialAnchorTexts: ['digital marketing', 'seo analysis'],
        contactInfo: {
          email: 'tips@marketingland.com'
        },
        difficulty: 'medium'
      }
    ],
    backlinkGaps: [
      {
        sourceDomain: 'semrush.com',
        domainRating: 84,
        linkingTo: ['competitor1.com', 'competitor2.com'],
        notLinkingTo: ['example.com'],
        opportunity: 'high',
        anchorTexts: ['seo tools', 'competitor analysis']
      },
      {
        sourceDomain: 'ahrefs.com',
        domainRating: 86,
        linkingTo: ['competitor1.com'],
        notLinkingTo: ['example.com', 'competitor2.com'],
        opportunity: 'high',
        anchorTexts: ['backlink analysis', 'seo software']
      }
    ]
  };

  const linkStrengthColors = {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#ef4444'
  };

  const difficultyColors = {
    easy: '#10b981',
    medium: '#f59e0b',
    hard: '#ef4444'
  };

  const domainRatingDistribution = [
    { range: '0-30', count: 45, color: '#ef4444' },
    { range: '31-50', count: 123, color: '#f59e0b' },
    { range: '51-70', count: 189, color: '#84cc16' },
    { range: '71-90', count: 89, color: '#10b981' },
    { range: '91-100', count: 12, color: '#059669' }
  ];

  const linkTypeDistribution = [
    { name: 'Dofollow', value: mockBacklinkData.summary.dofollowLinks, color: '#3b82f6' },
    { name: 'Nofollow', value: mockBacklinkData.summary.nofollowLinks, color: '#6b7280' }
  ];

  const monthlyTrend = [
    { month: 'Ene', gained: 45, lost: 12 },
    { month: 'Feb', gained: 52, lost: 8 },
    { month: 'Mar', gained: 38, lost: 15 },
    { month: 'Abr', gained: 67, lost: 6 },
    { month: 'May', gained: 43, lost: 11 },
    { month: 'Jun', gained: 58, lost: 9 }
  ];

  const handleAnalyze = async () => {
    const validDomains = domains.filter(d => d.trim());
    if (validDomains.length === 0) {
      toast.error('Debes agregar al menos un dominio válido');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const analysisData = {
        domains: validDomains,
        filters: {
          minDomainRating: filters.minDomainRating,
          linkTypes: filters.linkTypes,
          includeNew: filters.includeNew,
          includeLost: filters.includeLost
        }
      };

      const response = await fetch('/api/competitor-analysis/backlinks/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al analizar backlinks');
      }

      const result = await response.json();
      
      // Simular tiempo de procesamiento para mejor UX
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      setAnalysisComplete(true);
      toast.success('Análisis de backlinks completado');
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al realizar el análisis');
      console.error('Backlinks analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addDomain = () => {
    if (domains.length < 5) {
      setDomains([...domains, '']);
    }
  };

  const removeDomain = (index: number) => {
    if (domains.length > 1) {
      setDomains(domains.filter((_, i) => i !== index));
    }
  };

  const updateDomain = (index: number, value: string) => {
    const newDomains = [...domains];
    newDomains[index] = value;
    setDomains(newDomains);
  };

  const getStrengthBadge = (strength: string) => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[strength as keyof typeof colors]}>
        {strength === 'high' ? 'Alta' : strength === 'medium' ? 'Media' : 'Baja'}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[difficulty as keyof typeof colors]}>
        {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Difícil'}
      </Badge>
    );
  };

  const getOpportunityBadge = (opportunity: string) => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[opportunity as keyof typeof colors]}>
        {opportunity === 'high' ? 'Alta' : opportunity === 'medium' ? 'Media' : 'Baja'}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análisis de Backlinks</h1>
          <p className="text-gray-600 mt-2">Analiza el perfil de backlinks y encuentra oportunidades</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Datos
        </Button>
      </div>

      {!analysisComplete ? (
        /* Formulario de Configuración */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Configurar Análisis
            </CardTitle>
            <CardDescription>
              Configura los dominios y filtros para el análisis de backlinks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dominios */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Dominios a Analizar</Label>
              {domains.map((domain, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Dominio ${index + 1} (ej: example.com)`}
                    value={domain}
                    onChange={(e) => updateDomain(index, e.target.value)}
                    className="flex-1"
                  />
                  {domains.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDomain(index)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              ))}
              {domains.length < 5 && (
                <Button variant="outline" onClick={addDomain}>
                  + Agregar Dominio
                </Button>
              )}
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Domain Rating Mínimo</Label>
                <Input
                  type="number"
                  value={filters.minDomainRating}
                  onChange={(e) => setFilters({...filters, minDomainRating: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipos de Enlaces</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dofollow"
                      checked={filters.linkTypes.includes('dofollow')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({...filters, linkTypes: [...filters.linkTypes, 'dofollow']});
                        } else {
                          setFilters({...filters, linkTypes: filters.linkTypes.filter(t => t !== 'dofollow')});
                        }
                      }}
                    />
                    <Label htmlFor="dofollow">Dofollow</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="nofollow"
                      checked={filters.linkTypes.includes('nofollow')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({...filters, linkTypes: [...filters.linkTypes, 'nofollow']});
                        } else {
                          setFilters({...filters, linkTypes: filters.linkTypes.filter(t => t !== 'nofollow')});
                        }
                      }}
                    />
                    <Label htmlFor="nofollow">Nofollow</Label>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="new"
                  checked={filters.includeNew}
                  onCheckedChange={(checked) => setFilters({...filters, includeNew: !!checked})}
                />
                <Label htmlFor="new">Incluir Nuevos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lost"
                  checked={filters.includeLost}
                  onCheckedChange={(checked) => setFilters({...filters, includeLost: !!checked})}
                />
                <Label htmlFor="lost">Incluir Perdidos</Label>
              </div>
            </div>

            {/* Botón de Análisis */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || domains.filter(d => d.trim()).length === 0}
                className="px-8 py-3 text-lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analizando...
                  </>
                ) : (
                  <>
                    <Link className="h-5 w-5 mr-2" />
                    Iniciar Análisis
                  </>
                )}
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-3">
                <div className="text-center text-sm text-gray-600">
                  Analizando perfil de backlinks...
                </div>
                <Progress value={75} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Resultados del Análisis */
        <div className="space-y-6">
          {/* Métricas de Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Backlinks</p>
                    <p className="text-2xl font-bold text-gray-900">{mockBacklinkData.summary.totalBacklinks.toLocaleString()}</p>
                  </div>
                  <Link className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dominios Únicos</p>
                    <p className="text-2xl font-bold text-green-600">{mockBacklinkData.summary.uniqueDomains}</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Oportunidades</p>
                    <p className="text-2xl font-bold text-orange-600">{mockBacklinkData.summary.opportunities}</p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">DR Promedio</p>
                    <p className="text-2xl font-bold text-purple-600">{mockBacklinkData.summary.avgDomainRating}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de Análisis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Domain Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={domainRatingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipos de Enlaces</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={linkTypeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}`}
                    >
                      {linkTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tendencia Mensual */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Backlinks</CardTitle>
              <CardDescription>Enlaces ganados vs perdidos por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="gained" stroke="#10b981" strokeWidth={2} name="Ganados" />
                  <Line type="monotone" dataKey="lost" stroke="#ef4444" strokeWidth={2} name="Perdidos" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabs de Resultados */}
          <Tabs defaultValue="backlinks" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="backlinks">Backlinks ({mockBacklinkData.backlinks.length})</TabsTrigger>
              <TabsTrigger value="opportunities">Oportunidades ({mockBacklinkData.opportunities.length})</TabsTrigger>
              <TabsTrigger value="gaps">Gaps ({mockBacklinkData.backlinkGaps.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="backlinks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Perfil de Backlinks</CardTitle>
                  <CardDescription>Enlaces entrantes detectados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Dominio Origen</th>
                          <th className="text-left p-2">Anchor Text</th>
                          <th className="text-left p-2">DR</th>
                          <th className="text-left p-2">Tipo</th>
                          <th className="text-left p-2">Tráfico</th>
                          <th className="text-left p-2">Estado</th>
                          <th className="text-left p-2">Fuerza</th>
                          <th className="text-left p-2">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockBacklinkData.backlinks.map((backlink, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{backlink.sourceDomain}</span>
                                <ExternalLink className="h-3 w-3 text-gray-400" />
                              </div>
                            </td>
                            <td className="p-2 max-w-xs truncate">{backlink.anchorText}</td>
                            <td className="p-2">
                              <Badge variant={backlink.domainRating > 70 ? 'default' : backlink.domainRating > 50 ? 'secondary' : 'destructive'}>
                                {backlink.domainRating}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge variant={backlink.linkType === 'dofollow' ? 'default' : 'secondary'}>
                                {backlink.linkType}
                              </Badge>
                            </td>
                            <td className="p-2">{backlink.traffic.toLocaleString()}</td>
                            <td className="p-2">
                              <Badge variant={backlink.status === 'new' ? 'default' : backlink.status === 'active' ? 'secondary' : 'destructive'}>
                                {backlink.status === 'new' ? 'Nuevo' : backlink.status === 'active' ? 'Activo' : 'Perdido'}
                              </Badge>
                            </td>
                            <td className="p-2">{getStrengthBadge(backlink.linkStrength)}</td>
                            <td className="p-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Oportunidades de Link Building</CardTitle>
                  <CardDescription>Sitios web que podrían enlazarte</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockBacklinkData.opportunities.map((opportunity, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium text-lg">{opportunity.domain}</h4>
                            <Badge variant="outline">DR {opportunity.domainRating}</Badge>
                            {getDifficultyBadge(opportunity.difficulty)}
                          </div>
                          <div className="flex gap-2">
                            {opportunity.contactInfo?.email && (
                              <Button variant="outline" size="sm">
                                <Mail className="h-4 w-4 mr-1" />
                                Contactar
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Visitar
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Tráfico:</span>
                            <span className="ml-2 font-medium">{opportunity.traffic.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Relevancia:</span>
                            <span className="ml-2 font-medium">{opportunity.relevanceScore}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Enlaces a:</span>
                            <span className="ml-2 font-medium">{opportunity.linkingToCompetitors.length} competidores</span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <span className="text-gray-600">Anchor texts sugeridos:</span>
                          <div className="flex gap-2 mt-1">
                            {opportunity.potentialAnchorTexts.map((anchor, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {anchor}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {opportunity.contactInfo && (
                          <div className="mt-3 text-sm">
                            <span className="text-gray-600">Contacto:</span>
                            <span className="ml-2">{opportunity.contactInfo.email}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gaps" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gaps de Backlinks</CardTitle>
                  <CardDescription>Sitios que enlazan a competidores pero no a ti</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockBacklinkData.backlinkGaps.map((gap, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium text-lg">{gap.sourceDomain}</h4>
                            <Badge variant="outline">DR {gap.domainRating}</Badge>
                            {getOpportunityBadge(gap.opportunity)}
                          </div>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Analizar
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Enlaza a:</span>
                            <div className="mt-1">
                              {gap.linkingTo.map((domain, i) => (
                                <Badge key={i} variant="secondary" className="text-xs mr-1">
                                  {domain}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">No enlaza a:</span>
                            <div className="mt-1">
                              {gap.notLinkingTo.map((domain, i) => (
                                <Badge key={i} variant="destructive" className="text-xs mr-1">
                                  {domain}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-sm">
                          <span className="text-gray-600">Anchor texts usados:</span>
                          <div className="flex gap-2 mt-1">
                            {gap.anchorTexts.map((anchor, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {anchor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default BacklinkAnalysis;