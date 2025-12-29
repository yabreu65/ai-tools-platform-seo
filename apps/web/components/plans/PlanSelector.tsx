'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PlanCard } from './PlanCard';
import { LoadingSpinner } from './LoadingSpinner';
import { usePlans } from '@/hooks/usePlans';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

export function PlanSelector() {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const {
    plans,
    currentPlan,
    isLoading,
    isSelecting,
    error,
    selectPlan,
    canSelectPlan,
    retry,
  } = usePlans();

  const handleSelectPlan = async (planId: string) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para seleccionar un plan');
      router.push('/login');
      return;
    }

    if (!canSelectPlan(planId)) {
      toast.error('No puedes seleccionar este plan');
      return;
    }

    try {
      setSelectedPlanId(planId);

      const selectedPlan = plans.find(p => p.id === planId);
      const isPremium = selectedPlan && selectedPlan.price > 0;

      const result = await selectPlan(planId, isPremium ? 'stripe' : undefined);

      if (result.success) {
        if (result.requiresPayment && result.paymentUrl) {
          // Redirigir a Stripe para el pago
          window.location.href = result.paymentUrl;
        } else {
          // Plan gratuito o trial seleccionado exitosamente
          // Redirigir al dashboard después de un breve delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Error inesperado al seleccionar el plan');
    } finally {
      setSelectedPlanId(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Error al cargar los planes
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {error}
            </p>
          </div>
          <Button onClick={retry} variant="outline" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Reintentar</span>
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No hay planes disponibles en este momento.
        </p>
        <Button onClick={retry} variant="outline" className="mt-4">
          Actualizar
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          currentPlan={currentPlan}
          onSelect={handleSelectPlan}
          isSelecting={isSelecting && selectedPlanId === plan.id}
          disabled={isSelecting || !canSelectPlan(plan.id)}
        />
      ))}
    </div>
  );
}