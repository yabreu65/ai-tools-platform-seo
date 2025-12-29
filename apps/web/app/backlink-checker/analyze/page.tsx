'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, Download, AlertTriangle, ExternalLink, Filter, SortAsc, Eye, Shield, Target } from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisRequest {
  domain: string;
  includeSubdomains: boolean;
  maxBacklinks: number;
  includeNofollow: boolean;
  dataFreshness: 'live' | 'fresh' | 'cached';
}

interface BacklinkData {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  linkType: 'dofollow' | 'nofollow';
  domainAuthority: number;
  pageAuthority: number;
  trustFlow: number;
  firstSeen: string;
  lastSeen: string;
  status: 'active' | 'lost';
  linkQuality: 'good' | 'neutral' | 'toxic';
}

interface AnalysisResponse {
  success: boolean;
  data?: {
    domain: string;
    analysisId: string;
    analysisDate: string;
    overview: {
      totalBacklinks: number;
      referringDomains: number;
      domainAuthority: number;
      pageAuthority: number;
      trustFlow: number;
      citationFlow: number;
      organicKeywords: number;
      organicTraffic: number;
    };
    backlinks: BacklinkData[];
    trends: {
      backlinkGrowth: Array<{ month: string; backlinks: number; referringDomains: number }>;
      authorityTrend: Array<{ month: string; domainAuthority: number; pageAuthority: number }>;
    };
    anchorTextDistribution: Array<{ text: string; count: number; percentage: number }>;
    topReferringDomains: Array<{
      domain: string;
      backlinks: number;
      domainAuthority: number;
      firstSeen: string;
      linkTypes: { dofollow: number; nofollow: number };
    }>;
  };
  message?: string;
}

export default function BacklinkAnalyzePage() {
  const [domain, setDomain] = useState('');
  const [includeSubdomains, setIncludeSubdomains] = useState(true);
  const [maxBacklinks, setMaxBacklinks] = useState(1000);
  const [includeNofollow, setIncludeNofollow] = useState(true);
  const [dataFreshness, setDataFreshness] = useState<'live' | 'fresh' | 'cached'>('fresh');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse['data'] | null>(null);
  const [filterQuality, setFilterQuality] = useState<'all' | 'good' | 'neutral' | 'toxic'>('all');
  const [sortBy, setSortBy] = useState<'da' | 'pa' | 'tf' | 'date'>('da');

  const handleAnalysis = async () => {
    if (!domain) {
      toast.error('Por favor ingresa un dominio');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const requestData: AnalysisRequest = {
        domain,
        includeSubdomains,
        maxBacklinks,
        includeNofollow,
        dataFreshness
      };

      const response = await fetch('/api/backlink-checker/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result: AnalysisResponse = await response.json();

      if (result.success && result.data) {
        setAnalysisData(result.data);
        toast.success('Análisis completado exitosamente');
      } else {
        toast.error(result.message || 'Error en el análisis');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al realizar el análisis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredBacklinks = analysisData?.backlinks.filter(backlink => {
    if (filterQuality === 'all') return true;
    return backlink.linkQuality === filterQuality;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'da':
        return b.domainAuthority - a.domainAuthority;
      case 'pa':
        return b.pageAuthority - a.pageAuthority;
      case 'tf':
        return b.trustFlow - a.trustFlow;
      case 'date':
        return new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime();
      default:
        return 0;
    }
  }) || [];

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'good':
        return <Badge className="bg-green-100 text-green-800">Bueno</Badge>;
      case 'neutral':
        return <Badge className="bg-yellow-100 text-yellow-800">Neutral</Badge>;
      case 'toxic':
        return <Badge className="bg-red-100 text-red-800">Tóxico</Badge>;
      default:
        return <Badge>Desconocido</Badge>;
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análisis de Backlinks</h1>
          <p className="text-muted-foreground">Analiza el perfil completo de backlinks de cualquier dominio</p>
        </div>
      </div>

      {/* Formulario de Análisis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Configuración del Análisis
          </CardTitle>
          <CardDescription>
            Configura los parámetros para el análisis de backlinks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Dominio a Analizar</Label>
              <Input
                id="domain"
                placeholder="ejemplo.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxBacklinks">Máximo de Backlinks</Label>
              <Select value={maxBacklinks.toString()} onValueChange={(value) => setMaxBacklinks(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1,000</SelectItem>
                  <SelectItem value="5000">5,000</SelectItem>
                  <SelectItem value="10000">10,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="subdomains"
                checked={includeSubdomains}
                onCheckedChange={(checked) => setIncludeSubdomains(checked as boolean)}
              />
              <Label htmlFor="subdomains">Incluir subdominios</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nofollow"
                checked={includeNofollow}
                onCheckedChange={(checked) => setIncludeNofollow(checked as boolean)}
              />
              <Label htmlFor="nofollow">Incluir enlaces nofollow</Label>
            </div>
            <div className="space-y-2">
              <Label>Frescura de Datos</Label>
              <Select value={dataFreshness} onValueChange={(value: 'live' | 'fresh' | 'cached') => setDataFreshness(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">En vivo (más lento)</SelectItem>
                  <SelectItem value="fresh">Fresco (recomendado)</SelectItem>
                  <SelectItem value="cached">Cache (más rápido)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleAnalysis} 
            disabled={isAnalyzing || !domain}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analizando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Iniciar Análisis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progreso del Análisis */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analizando backlinks...</span>
                <span>Esto puede tomar unos minutos</span>
              </div>
              <Progress value={33} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados del Análisis */}
      {analysisData && (
        <>
          {/* Métricas Principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{analysisData.overview.totalBacklinks.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total Backlinks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{analysisData.overview.referringDomains.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Dominios Referentes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{analysisData.overview.domainAuthority}</div>
                <p className="text-xs text-muted-foreground">Domain Authority</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{analysisData.overview.trustFlow}</div>
                <p className="text-xs text-muted-foreground">Trust Flow</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs de Contenido */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
              <TabsTrigger value="anchors">Anchor Text</TabsTrigger>
              <TabsTrigger value="domains">Dominios</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Crecimiento de Backlinks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analysisData.trends.backlinkGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="backlinks" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tendencia de Autoridad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analysisData.trends.authorityTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="domainAuthority" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="backlinks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Lista de Backlinks ({filteredBacklinks.length})</span>
                    <div className="flex gap-2">
                      <Select value={filterQuality} onValueChange={(value: any) => setFilterQuality(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="good">Buenos</SelectItem>
                          <SelectItem value="neutral">Neutrales</SelectItem>
                          <SelectItem value="toxic">Tóxicos</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="da">DA</SelectItem>
                          <SelectItem value="pa">PA</SelectItem>
                          <SelectItem value="tf">TF</SelectItem>
                          <SelectItem value="date">Fecha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredBacklinks.slice(0, 20).map((backlink) => (
                      <div key={backlink.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <a 
                              href={backlink.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 hover:underline truncate"
                            >
                              {backlink.sourceUrl}
                            </a>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            Anchor: {backlink.anchorText}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={backlink.linkType === 'dofollow' ? 'default' : 'secondary'}>
                            {backlink.linkType}
                          </Badge>
                          {getQualityBadge(backlink.linkQuality)}
                          <div className="text-xs text-muted-foreground">
                            DA: {backlink.domainAuthority}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="anchors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Anchor Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={analysisData.anchorTextDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ text, percentage }) => `${text} (${percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analysisData.anchorTextDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="domains" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Dominios Referentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisData.topReferringDomains.slice(0, 15).map((domain, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{domain.domain}</div>
                          <div className="text-xs text-muted-foreground">
                            Primer enlace: {new Date(domain.firstSeen).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="font-medium">{domain.backlinks}</span> enlaces
                          </div>
                          <div className="text-sm">
                            DA: <span className="font-medium">{domain.domainAuthority}</span>
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
              <Download className="h-4 w-4 mr-2" />
              Exportar Resultados
            </Button>
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Auditar Enlaces Tóxicos
            </Button>
            <Button variant="outline">
              <Target className="h-4 w-4 mr-2" />
              Ver Oportunidades
            </Button>
          </div>
        </>
      )}
    </div>
  );
}