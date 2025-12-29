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
  popular: boolean;
  active: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
}

export interface UserPlan {
  plan: 'free' | 'premium' | 'trial';
  planStartDate?: Date;
  planEndDate?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface PlanUsage {
  monthlyAnalysisCount: number;
  monthlyExportCount: number;
  monthlySaveCount: number;
  usageResetDate: Date;
}

export interface PlanLimits {
  monthlyAnalysis: number;
  monthlyExports: number;
  monthlySaves: number;
}

export interface PlanSelectionRequest {
  planId: string;
  paymentMethodId?: string;
}

export interface PlanSelectionResponse {
  success: boolean;
  requiresPayment: boolean;
  clientSecret?: string;
  user: UserPlan;
  message?: string;
}

export interface PlansResponse {
  success: boolean;
  plans: Plan[];
  userCurrentPlan: string;
}