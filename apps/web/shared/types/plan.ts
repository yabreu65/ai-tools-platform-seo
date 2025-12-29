export type Plan = 'free' | 'premium' | 'trial' | 'basic';

export interface PlanSelectionRequest {
  plan: Plan;
}

export interface PlanSelectionResponse {
  success: boolean;
  message: string;
  plan?: Plan;
}

export interface PlanFeatures {
  monthlyAnalyses: number;
  competitorLimit: number;
  exportFormats: string[];
  advancedMetrics: boolean;
  apiAccess: boolean;
  support: 'community' | 'email' | 'priority';
}

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  free: {
    monthlyAnalyses: 3,
    competitorLimit: 2,
    exportFormats: ['csv'],
    advancedMetrics: false,
    apiAccess: false,
    support: 'community'
  },
  basic: {
    monthlyAnalyses: 10,
    competitorLimit: 5,
    exportFormats: ['csv', 'pdf'],
    advancedMetrics: true,
    apiAccess: false,
    support: 'email'
  },
  premium: {
    monthlyAnalyses: -1, // unlimited
    competitorLimit: 20,
    exportFormats: ['csv', 'pdf', 'json'],
    advancedMetrics: true,
    apiAccess: true,
    support: 'priority'
  },
  trial: {
    monthlyAnalyses: -1, // unlimited during trial
    competitorLimit: 10,
    exportFormats: ['csv', 'pdf'],
    advancedMetrics: true,
    apiAccess: false,
    support: 'email'
  }
};