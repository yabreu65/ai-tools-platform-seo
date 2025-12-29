'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Globe, 
  Star, 
  Clock, 
  FileText, 
  Image, 
  Video, 
  MapPin,
  ShoppingCart,
  MessageSquare,
  TrendingUp,
  Eye,
  ExternalLink,
  BarChart3,
  Target,
  Zap,
  Users,
  Award,
  AlertCircle
} from 'lucide-react';

interface SerpFeature {
  type: string;
  name: string;
  present: boolean;
  position?: number;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface OrganicResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  domainAuthority: number;
  pageSpeed: number;
  contentLength: number;
  keywordDensity: number;
  backlinks: number;
  socialSignals: number;
  isCompetitor?: boolean;
}

interface PaidResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  description: string;
  extensions: string[];
}

interface LocalResult {
  name: string;
  address: string;
  rating: number;
  reviews: number;
  category: string;
}

interface SerpAnalysisData {
  keyword: string;
  location: string;
  device: 'desktop' | 'mobile';
  totalResults: number;
  features: SerpFeature[];
  organicResults: OrganicResult[];
  paidResults: PaidResult[];
  localResults: LocalResult[];
  competitorInsights: {
    topCompetitors: string[];
    avgDomainAuthority: number;
    avgContentLength: number;
    commonFeatures: string[];
  };
  opportunities: string[];
  threats: string[];
}

interface SerpAnalysisProps {
  data: SerpAnalysisData;
  onUrlClick?: (url: string) => void;
  onCompetitorAnalyze?: (domain: string) => void;
  className?: string;
}

const SerpAnalysis: React.FC<SerpAnalysisProps> = ({
  data,
  onUrlClick,
  onCompetitorAnalyze,
  className = ''
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const getFeatureIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'featured_snippet': return <Star className="h-4 w-4" />;
      case 'people_also_ask': return <MessageSquare className="h-4 w-4" />;
      case 'local_pack': return <MapPin className="h-4 w-4" />;
      case 'shopping': return <ShoppingCart className="h-4 w-4" />;
      case 'images': return <Image className="h-4 w-4" />;
      case 'videos': return <Video className="h-4 w-4" />;
      case 'news': return <FileText className="h-4 w-4" />;
      case 'knowledge_panel': return <Globe className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getFeatureColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDomainAuthorityColor = (da: number) => {
    if (da >= 80) return 'text-green-600';
    if (da >= 60) return 'text-yellow-600';
    if (da >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPageSpeedColor = (speed: number) => {
    if (speed >= 90) return 'text-green-600';
    if (speed >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const presentFeatures = data.features.filter(f => f.present);
  const absentFeatures = data.features.filter(f => !f.present);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con información básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Análisis SERP: {data.keyword}
            <Badge variant="outline">{data.location}</Badge>
            <Badge variant="outline">{data.device}</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.totalResults.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Resultados Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{presentFeatures.length}</div>
              <div className="text-sm text-gray-600">Features Presentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.organicResults.length}</div>
              <div className="text-sm text-gray-600">Resultados Orgánicos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{data.paidResults.length}</div>
              <div className="text-sm text-gray-600">Anuncios</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para diferentes vistas */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="organic">Orgánicos</TabsTrigger>
          <TabsTrigger value="competitors">Competidores</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Features más importantes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Features SERP Presentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {presentFeatures.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getFeatureIcon(feature.type)}
                        <span className="font-medium">{feature.name}</span>
                      </div>
                      <Badge className={getFeatureColor(feature.impact)}>
                        {feature.impact}
                      </Badge>
                    </div>
                  ))}
                  {presentFeatures.length > 5 && (
                    <div className="text-sm text-gray-500">
                      +{presentFeatures.length - 5} features más...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top competidores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Competidores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.competitorInsights.topCompetitors.map((competitor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{competitor}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onCompetitorAnalyze?.(competitor)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas promedio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Métricas Promedio de Competidores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{data.competitorInsights.avgDomainAuthority}</div>
                  <div className="text-sm text-gray-600">Domain Authority Promedio</div>
                  <Progress value={data.competitorInsights.avgDomainAuthority} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{data.competitorInsights.avgContentLength.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Palabras Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{data.competitorInsights.commonFeatures.length}</div>
                  <div className="text-sm text-gray-600">Features Comunes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Features */}
        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Features presentes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Features Presentes ({presentFeatures.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {presentFeatures.map((feature, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getFeatureIcon(feature.type)}
                          <span className="font-medium">{feature.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {feature.position && (
                            <Badge variant="outline">Pos. {feature.position}</Badge>
                          )}
                          <Badge className={getFeatureColor(feature.impact)}>
                            {feature.impact}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features ausentes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-600">Features Ausentes ({absentFeatures.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {absentFeatures.map((feature, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getFeatureIcon(feature.type)}
                          <span className="font-medium text-gray-700">{feature.name}</span>
                        </div>
                        <Badge className={getFeatureColor(feature.impact)}>
                          {feature.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Resultados Orgánicos */}
        <TabsContent value="organic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resultados Orgánicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.organicResults.map((result, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${result.isCompetitor ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={result.position <= 3 ? 'default' : result.position <= 10 ? 'secondary' : 'outline'}>
                          #{result.position}
                        </Badge>
                        <div>
                          <h4 className="font-semibold text-blue-600 hover:underline cursor-pointer" onClick={() => onUrlClick?.(result.url)}>
                            {result.title}
                          </h4>
                          <p className="text-sm text-green-600">{result.domain}</p>
                        </div>
                      </div>
                      {result.isCompetitor && (
                        <Badge variant="destructive">Competidor</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{result.snippet}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div className="text-center">
                        <div className={`font-semibold ${getDomainAuthorityColor(result.domainAuthority)}`}>
                          {result.domainAuthority}
                        </div>
                        <div className="text-gray-500">DA</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-semibold ${getPageSpeedColor(result.pageSpeed)}`}>
                          {result.pageSpeed}
                        </div>
                        <div className="text-gray-500">Speed</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{result.contentLength.toLocaleString()}</div>
                        <div className="text-gray-500">Palabras</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{result.keywordDensity}%</div>
                        <div className="text-gray-500">KW Density</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{result.backlinks.toLocaleString()}</div>
                        <div className="text-gray-500">Backlinks</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{result.socialSignals}</div>
                        <div className="text-gray-500">Social</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Análisis de Competidores */}
        <TabsContent value="competitors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Insights de competidores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Insights de Competidores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Features Comunes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.competitorInsights.commonFeatures.map((feature, index) => (
                        <Badge key={index} variant="secondary">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Métricas Promedio:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Domain Authority:</span>
                        <span className="font-semibold">{data.competitorInsights.avgDomainAuthority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Longitud de Contenido:</span>
                        <span className="font-semibold">{data.competitorInsights.avgContentLength.toLocaleString()} palabras</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Anuncios pagados */}
            {data.paidResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Anuncios Pagados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.paidResults.slice(0, 3).map((ad, index) => (
                      <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Anuncio #{ad.position}</Badge>
                          <span className="font-semibold text-sm">{ad.domain}</span>
                        </div>
                        <h5 className="font-medium text-blue-600 mb-1">{ad.title}</h5>
                        <p className="text-sm text-gray-600 mb-2">{ad.description}</p>
                        {ad.extensions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {ad.extensions.map((ext, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{ext}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab: Oportunidades */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Oportunidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Oportunidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.opportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{opportunity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Amenazas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Amenazas y Desafíos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.threats.map((threat, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{threat}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SerpAnalysis;