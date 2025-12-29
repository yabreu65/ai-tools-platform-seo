'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Zap
} from 'lucide-react';

interface DifficultyFactor {
  name: string;
  value: number;
  weight: number;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

interface DifficultyAnalysis {
  overallScore: number;
  factors: DifficultyFactor[];
  recommendation: string;
  timeToRank?: string;
  competitorStrength?: 'low' | 'medium' | 'high';
  opportunities?: string[];
  challenges?: string[];
}

interface DifficultyMeterProps {
  keyword: string;
  analysis: DifficultyAnalysis;
  showDetails?: boolean;
  showRecommendations?: boolean;
  className?: string;
}

const DifficultyMeter: React.FC<DifficultyMeterProps> = ({
  keyword,
  analysis,
  showDetails = true,
  showRecommendations = true,
  className = ''
}) => {
  const getDifficultyLevel = (score: number) => {
    if (score < 30) return { level: 'Fácil', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
    if (score < 60) return { level: 'Medio', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Info };
    if (score < 80) return { level: 'Difícil', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: AlertTriangle };
    return { level: 'Muy Difícil', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle };
  };

  const getProgressColor = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score < 60) return 'bg-yellow-500';
    if (score < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getFactorIcon = (factorName: string) => {
    switch (factorName.toLowerCase()) {
      case 'competencia':
      case 'competition':
        return Users;
      case 'autoridad de dominio':
      case 'domain authority':
        return Target;
      case 'cpc':
      case 'cost per click':
        return DollarSign;
      case 'tendencia':
      case 'trend':
        return TrendingUp;
      case 'tiempo':
      case 'time':
        return Clock;
      default:
        return Zap;
    }
  };

  const difficultyInfo = getDifficultyLevel(analysis.overallScore);
  const DifficultyIcon = difficultyInfo.icon;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Medidor principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Análisis de Dificultad
            <Badge variant="outline">{keyword}</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Score principal */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <DifficultyIcon className={`h-8 w-8 ${difficultyInfo.color}`} />
                <div>
                  <div className="text-4xl font-bold">{analysis.overallScore}</div>
                  <div className="text-sm text-gray-600">/ 100</div>
                </div>
              </div>
              
              <Badge className={`${difficultyInfo.bgColor} ${difficultyInfo.color} text-lg px-4 py-2`}>
                {difficultyInfo.level}
              </Badge>
              
              <div className="mt-4">
                <Progress 
                  value={analysis.overallScore} 
                  className="h-3"
                  style={{
                    background: `linear-gradient(to right, 
                      ${getProgressColor(analysis.overallScore)} 0%, 
                      ${getProgressColor(analysis.overallScore)} ${analysis.overallScore}%, 
                      #e5e7eb ${analysis.overallScore}%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.timeToRank && (
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Tiempo estimado</div>
                  <div className="font-semibold text-blue-600">{analysis.timeToRank}</div>
                </div>
              )}
              
              {analysis.competitorStrength && (
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Competencia</div>
                  <div className="font-semibold text-purple-600 capitalize">{analysis.competitorStrength}</div>
                </div>
              )}
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Recomendación</div>
                <div className="font-semibold text-green-600">
                  {analysis.overallScore < 30 ? 'Atacar' : 
                   analysis.overallScore < 60 ? 'Considerar' : 
                   analysis.overallScore < 80 ? 'Precaución' : 'Evitar'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Factores de dificultad */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Factores de Dificultad
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {analysis.factors.map((factor, index) => {
                const FactorIcon = getFactorIcon(factor.name);
                const impactColor = factor.impact === 'positive' ? 'text-green-600' : 
                                  factor.impact === 'negative' ? 'text-red-600' : 'text-gray-600';
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FactorIcon className={`h-5 w-5 ${impactColor}`} />
                      <div>
                        <div className="font-medium">{factor.name}</div>
                        <div className="text-sm text-gray-600">{factor.description}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold">{factor.value}%</div>
                        <div className="text-xs text-gray-500">Peso: {factor.weight}%</div>
                      </div>
                      <div className="w-20">
                        <Progress value={factor.value} className="h-2" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendaciones y oportunidades */}
      {showRecommendations && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Oportunidades */}
          {analysis.opportunities && analysis.opportunities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Oportunidades
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {analysis.opportunities.map((opportunity, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Desafíos */}
          {analysis.challenges && analysis.challenges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Desafíos
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {analysis.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recomendación principal */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Recomendación Estratégica</h4>
              <p className="text-gray-700">{analysis.recommendation}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DifficultyMeter;