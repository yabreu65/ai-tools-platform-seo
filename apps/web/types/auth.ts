export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  // Plan fields
  plan: 'free' | 'premium' | 'trial';
  planStartDate?: Date;
  planEndDate?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  // Usage limits
  monthlyAnalysisCount?: number;
  monthlyExportCount?: number;
  monthlySaveCount?: number;
  usageResetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  settings: UserSettings;
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

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface ResetPasswordCredentials {
  email: string;
}

export interface ChangePasswordCredentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  plan: string;
  iat: number;
  exp: number;
}