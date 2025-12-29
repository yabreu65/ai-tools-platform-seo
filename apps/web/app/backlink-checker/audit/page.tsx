'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Shield, AlertTriangle, Download, ExternalLink, Filter, CheckCircle, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface AuditRequest {
  domain: string;
}

interface ToxicBacklink {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  toxicityScore: number;
  riskFactors: string[];
  domainAuthority: number;
  firstSeen: string;
  lastSeen: string;
  status: 'active' | 'lost';
}

interface AuditResponse {
  success: boolean;
  data?: {
    domain: string;
    auditId: string;
    auditDate: string;
    overview: {
      totalBacklinks: number;
      toxicBacklinks: number;
      overallToxicScore: number;
      toxicPercentage: number;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    };
    toxicBacklinks: ToxicBacklink[];
    riskDistribution: Array<{ risk: string; count: number; percentage: number }>;
    toxicityTrend: Array<{ month: string; toxicScore: number; toxicLinks: number }>;
    topToxicDomains: Array<{
      domain: string;
      toxicLinks: number;
      avgToxicityScore: number;
      riskFactors: string[];
    }>;
    recommendations: Array<{
      type: 'disavow' | 'contact' | 'monitor';
      priority: 'high' | 'medium' | 'low';
      description: string;
      affectedLinks: number;
    }>;
  };
  message?: string;
}

export default function ToxicAuditPage() {
  const [domain, setDomain] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditData, setAuditData] = useState<AuditResponse['data'] | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  const handleAudit = async () => {
    if (!domain) {
      toast.error('Por favor ingresa un dominio');
      return;
    }

    setIsAuditing(true);
    
    try {
      const requestData: AuditRequest = { domain };

      const response = await fetch('/api/backlink-checker/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result: AuditResponse = await response.json();

      if (result.success && result.data) {
        setAuditData(result.data);
        toast.success('Auditoría completada exitosamente');
      } else {
        toast.error(result.message || 'Error en la auditoría');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al realizar la auditoría');
    } finally {
      setIsAuditing(false);
    }
  };

  const filteredToxicLinks = auditData?.toxicBacklinks.filter(link => {
    if (filterRisk === 'all') return true;
    const score = link.toxicityScore;
    switch (filterRisk) {
      case 'low': return score >= 30 && score < 50;
      case 'medium': return score >= 50 && score < 70;
      case 'high': return score >= 70 && score < 90;
      case 'critical': return score >= 90;
      default: return true;
    }
  }) || [];

  const handleSelectLink = (linkId: string) => {
    setSelectedLinks(prev => 
      prev.includes(linkId) 
        ? prev.filter(id => id !== linkId)
        : [...prev, linkId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLinks.length === filteredToxicLinks.length) {
      setSelectedLinks([]);
    } else {
      setSelectedLinks(filteredToxicLinks.map(link => link.id));
    }
  };

  const generateDisavowFile = () => {
    if (selectedLinks.length === 0) {
      toast.error('Selecciona al menos un enlace para generar el archivo disavow');
      return;
    }
    
    const selectedBacklinks = filteredToxicLinks.filter(link => selectedLinks.includes(link.id));
    const disavowContent = selectedBacklinks.map(link => `# Toxic link - Score: ${link.toxicityScore}\ndomain:${new URL(link.sourceUrl).hostname}`).join('\n\n');
    
    const blob = new Blob([disavowContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disavow-${domain}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Archivo disavow generado con ${selectedLinks.length} dominios`);
  };

  const getRiskColor = (score: number) => {
    if (score >= 90) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 70) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 90) return 'Crítico';
    if (score >= 70) return 'Alto';
    if (score >= 50) return 'Medio';
    return 'Bajo';
  };

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auditoría de Enlaces Tóxicos</h1>
          <p className="text-muted-foreground">Identifica y analiza enlaces potencialmente dañinos para tu SEO</p>
        </div>
      </div>

      {/* Formulario de Auditoría */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Iniciar Auditoría
          </CardTitle>
          <CardDescription>
            Ingresa el dominio que deseas auditar para detectar enlaces tóxicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="domain">Dominio a Auditar</Label>
              <Input
                id="domain"
                placeholder="ejemplo.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAudit} 
                disabled={isAuditing || !domain}
              >
                {isAuditing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Auditando...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Iniciar Auditoría
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progreso de la Auditoría */}
      {isAuditing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analizando enlaces tóxicos...</span>
                <span>Esto puede tomar unos minutos</span>
              </div>
              <Progress value={45} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados de la Auditoría */}
      {auditData && (
        <>
          {/* Métricas Principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{auditData.overview.overallToxicScore}%</div>
                <p className="text-xs text-muted-foreground">Score Tóxico General</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{auditData.overview.toxicBacklinks.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Enlaces Tóxicos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{auditData.overview.toxicPercentage.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Porcentaje Tóxico</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Badge className={getRiskColor(auditData.overview.overallToxicScore)}>
                    {getRiskLabel(auditData.overview.overallToxicScore)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Nivel de Riesgo</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs de Contenido */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="toxic-links">Enlaces Tóxicos</TabsTrigger>
              <TabsTrigger value="domains">Dominios</TabsTrigger>
              <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Riesgo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={auditData.riskDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ risk, percentage }) => `${risk} (${percentage}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {auditData.riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tendencia de Toxicidad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={auditData.toxicityTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="toxicScore" stroke="#ef4444" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="toxic-links" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Enlaces Tóxicos Detectados ({filteredToxicLinks.length})</span>
                    <div className="flex gap-2">
                      <select 
                        value={filterRisk} 
                        onChange={(e) => setFilterRisk(e.target.value as any)}
                        className="px-3 py-1 border rounded-md text-sm"
                      >
                        <option value="all">Todos los riesgos</option>
                        <option value="critical">Crítico (90-100)</option>
                        <option value="high">Alto (70-89)</option>
                        <option value="medium">Medio (50-69)</option>
                        <option value="low">Bajo (30-49)</option>
                      </select>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectedLinks.length === filteredToxicLinks.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                      </Button>
                      <Button 
                        onClick={generateDisavowFile}
                        disabled={selectedLinks.length === 0}
                        size="sm"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generar Disavow ({selectedLinks.length})
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredToxicLinks.slice(0, 20).map((link) => (
                      <div key={link.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={selectedLinks.includes(link.id)}
                          onCheckedChange={() => handleSelectLink(link.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <a 
                              href={link.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 hover:underline truncate"
                            >
                              {link.sourceUrl}
                            </a>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            Anchor: {link.anchorText}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {link.riskFactors.slice(0, 3).map((factor, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">{link.toxicityScore}%</div>
                          <Badge className={getRiskColor(link.toxicityScore)}>
                            {getRiskLabel(link.toxicityScore)}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            DA: {link.domainAuthority}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="domains" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Dominios Tóxicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {auditData.topToxicDomains.slice(0, 15).map((domain, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{domain.domain}</div>
                          <div className="flex gap-1 mt-1">
                            {domain.riskFactors.slice(0, 2).map((factor, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="font-medium">{domain.toxicLinks}</span> enlaces tóxicos
                          </div>
                          <div className="text-lg font-bold text-red-600">
                            {domain.avgToxicityScore.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="grid gap-4">
                {auditData.recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {rec.type === 'disavow' && <XCircle className="h-5 w-5 text-red-500" />}
                          {rec.type === 'contact' && <ExternalLink className="h-5 w-5 text-blue-500" />}
                          {rec.type === 'monitor' && <Shield className="h-5 w-5 text-yellow-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              className={
                                rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }
                            >
                              Prioridad {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {rec.affectedLinks} enlaces afectados
                            </span>
                          </div>
                          <p className="text-sm">{rec.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Reporte
            </Button>
            <Button 
              onClick={generateDisavowFile}
              disabled={selectedLinks.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generar Archivo Disavow ({selectedLinks.length})
            </Button>
          </div>
        </>
      )}
    </div>
  );
}