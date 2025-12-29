import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Plan {
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

export interface PlanSelectionRequest {
  planId: string;
  paymentMethod?: 'stripe' | 'paypal';
}

export interface PlanSelectionResponse {
  success: boolean;
  message: string;
  requiresPayment: boolean;
  paymentUrl?: string;
  user?: any;
}

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuth();

  // Fetch available plans
  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/plans', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cargar los planes');
      }

      const data = await response.json();
      setPlans(data.plans || []);
      setCurrentPlan(data.currentPlan || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Select a plan
  const selectPlan = async (planId: string, paymentMethod?: 'stripe' | 'paypal'): Promise<PlanSelectionResponse> => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para seleccionar un plan');
      return { success: false, message: 'No autenticado', requiresPayment: false };
    }

    try {
      setIsSelecting(true);
      setError(null);

      const requestData: PlanSelectionRequest = {
        planId,
        ...(paymentMethod && { paymentMethod })
      };

      const response = await fetch('/api/user/select-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      const data: PlanSelectionResponse = await response.json();

      if (data.success) {
        toast.success(data.message || 'Plan seleccionado exitosamente');
        
        // Update current plan
        const selectedPlan = plans.find(p => p.id === planId);
        if (selectedPlan) {
          setCurrentPlan(selectedPlan);
        }
        
        // Refresh plans to get updated data
        await fetchPlans();
      } else {
        toast.error(data.message || 'Error al seleccionar el plan');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, message: errorMessage, requiresPayment: false };
    } finally {
      setIsSelecting(false);
    }
  };

  // Check if user can upgrade/downgrade to a specific plan
  const canSelectPlan = (planId: string): boolean => {
    if (!currentPlan) return true;
    
    const targetPlan = plans.find(p => p.id === planId);
    if (!targetPlan) return false;
    
    // Can't select the same plan
    if (currentPlan.id === planId) return false;
    
    return true;
  };

  // Get plan by ID
  const getPlanById = (planId: string): Plan | undefined => {
    return plans.find(p => p.id === planId);
  };

  // Check if a plan is premium (requires payment)
  const isPremiumPlan = (planId: string): boolean => {
    const plan = getPlanById(planId);
    return plan ? plan.price > 0 : false;
  };

  // Get plan comparison data
  const getPlanComparison = () => {
    return plans.map(plan => ({
      ...plan,
      isCurrent: currentPlan?.id === plan.id,
      canSelect: canSelectPlan(plan.id),
      isPremium: isPremiumPlan(plan.id),
    }));
  };

  // Retry loading plans
  const retry = () => {
    fetchPlans();
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlans();
    }
  }, [isAuthenticated]);

  return {
    plans,
    currentPlan,
    isLoading,
    isSelecting,
    error,
    selectPlan,
    canSelectPlan,
    getPlanById,
    isPremiumPlan,
    getPlanComparison,
    retry,
    refetch: fetchPlans,
  };
};

export default usePlans;