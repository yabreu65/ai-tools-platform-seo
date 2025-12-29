export interface User {
  id: string;
  email: string;
  name?: string;
  isVerified: boolean;
  // Plan fields
  plan: 'free' | 'premium' | 'trial';
  planStartDate?: Date;
  planEndDate?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  // Usage limits
  monthlyAnalysisCount: number;
  monthlyExportCount: number;
  monthlySaveCount: number;
  usageResetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  notifications: {
    email: boolean;
    browser: boolean;
    marketing: boolean;
  };
  privacy: {
    profilePublic: boolean;
    shareAnalytics: boolean;
  };
}

export interface UserWithSettings extends User {
  settings: UserSettings;
}