'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    monthlyAnalysis: number;
    monthlyExports: number;
    monthlySaves: number;
  };
  popular?: boolean;
  active: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
}

interface PlanCardProps {
  plan: Plan;
  currentPlan: Plan | null;
  onSelect: (planId: string) => void;
  isSelecting?: boolean;
  disabled?: boolean;
}

export function PlanCard({ plan, currentPlan, onSelect, isSelecting = false, disabled = false }: PlanCardProps) {
  const isPremium = plan.id === 'premium';
  const isTrial = plan.id === 'trial';
  const isFree = plan.id === 'free';
  const isCurrentPlan = currentPlan?.id === plan.id;

  return (
    <Card className={cn(
      "relative transition-all duration-300 hover:shadow-lg",
      plan.popular && "border-blue-500 shadow-blue-100",
      isCurrentPlan && "border-green-500 bg-green-50 dark:bg-green-950/20",
      disabled && !isCurrentPlan && "opacity-60 cursor-not-allowed"
    )}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            Más Popular
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-green-500 text-white px-3 py-1 rounded-full">
            Actual
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className={cn(
          "text-2xl font-bold",
          isPremium && "text-blue-600 dark:text-blue-400",
          isTrial && "text-purple-600 dark:text-purple-400",
          isFree && "text-gray-600 dark:text-gray-400"
        )}>
          {plan.name}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {plan.description}
        </CardDescription>
        
        <div className="mt-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className={cn(
              "text-4xl font-bold",
              isPremium && "text-blue-600 dark:text-blue-400",
              isTrial && "text-purple-600 dark:text-purple-400",
              isFree && "text-gray-600 dark:text-gray-400"
            )}>
              ${plan.price}
            </span>
            {plan.price > 0 && (
              <span className="text-gray-500 dark:text-gray-400 text-sm">/{plan.interval}</span>
            )}
          </div>
          {isTrial && (
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">30 días gratis</p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
          </div>
        ))}
        
        {/* Usage limits display */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Límites mensuales:</h4>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div>• {plan.limits.monthlyAnalysis === -1 ? 'Análisis ilimitados' : `${plan.limits.monthlyAnalysis} análisis`}</div>
            <div>• {plan.limits.monthlyExports === -1 ? 'Exportaciones ilimitadas' : `${plan.limits.monthlyExports} exportaciones`}</div>
            <div>• {plan.limits.monthlySaves === -1 ? 'Guardados ilimitados' : `${plan.limits.monthlySaves} guardados`}</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-6">
        {isCurrentPlan ? (
          <Button 
            variant="outline" 
            className="w-full border-green-500 text-green-600 dark:text-green-400" 
            disabled
          >
            Plan Actual
          </Button>
        ) : (
          <Button
            onClick={() => onSelect(plan.id)}
            disabled={disabled || isSelecting}
            className={cn(
              "w-full transition-all duration-200",
              isPremium && "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
              isTrial && "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700",
              isFree && "bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700"
            )}
          >
            {isSelecting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </div>
            ) : (
              <>
                {isFree && 'Seleccionar Gratis'}
                {isPremium && 'Comenzar Premium'}
                {isTrial && 'Iniciar Prueba'}
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}