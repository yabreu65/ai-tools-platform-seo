'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { toast } from 'sonner';
import { getApiUrl as getBackendApiUrl } from '@/lib/api';

// Helper para normalizar el usuario que viene del backend al tipo usado en el frontend
const normalizeUser = (backendUser: any): User => {
  const defaultSettings: User['settings'] = {
    theme: 'system',
    language: 'es',
    notifications: {
      email: true,
      browser: true,
      marketing: false,
    },
    privacy: {
      profilePublic: false,
      shareAnalytics: false,
    },
  };

  return {
    id: backendUser?.id || backendUser?._id || '',
    email: backendUser?.email || '',
    name: backendUser?.name || '',
    avatar: backendUser?.avatar,
    plan: backendUser?.plan || 'free',
    planStartDate: backendUser?.planStartDate ? new Date(backendUser.planStartDate) : undefined,
    planEndDate: backendUser?.planEndDate ? new Date(backendUser.planEndDate) : undefined,
    stripeCustomerId: backendUser?.stripeCustomerId,
    stripeSubscriptionId: backendUser?.stripeSubscriptionId,
    monthlyAnalysisCount: backendUser?.monthlyAnalysisCount ?? 0,
    monthlyExportCount: backendUser?.monthlyExportCount ?? 0,
    monthlySaveCount: backendUser?.monthlySaveCount ?? 0,
    usageResetDate: backendUser?.usageResetDate ? new Date(backendUser.usageResetDate) : undefined,
    createdAt: backendUser?.createdAt ? new Date(backendUser.createdAt) : new Date(),
    updatedAt: backendUser?.updatedAt ? new Date(backendUser.updatedAt) : new Date(),
    emailVerified: backendUser?.emailVerified ?? backendUser?.isVerified ?? false,
    settings: backendUser?.settings || defaultSettings,
  };
};

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 AuthContext: Initializing authentication');
      try {
        const token = localStorage.getItem('auth_token');
        console.log('🔍 AuthContext: Token found in localStorage:', !!token);
        if (token) {
          console.log('📡 AuthContext: Making request to backend /api/auth/me');
          const response = await fetch(getBackendApiUrl('/api/auth/me'), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log('📡 AuthContext: /auth/me response status:', response.status);
          if (response.ok) {
            const data = await response.json();
            const user = normalizeUser(data.user || data);
            console.log('✅ AuthContext: User authenticated from localStorage:', user.email);
            setState({
              user,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            console.log('❌ AuthContext: Token invalid, clearing localStorage');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            setState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } else {
          console.log('❌ AuthContext: No token found, user not authenticated');
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('❌ AuthContext: Error initializing auth:', error);
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      console.log('🚀 AuthContext: Starting login process for', credentials.email);
      setState(prev => ({ ...prev, isLoading: true }));

      const apiUrl = getBackendApiUrl('/api/auth/login');
      console.log('📡 AuthContext: Making request to', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('📡 AuthContext: Login response', { status: response.status, hasUser: !!data.user, hasAccessToken: !!data.accessToken });

      if (response.ok) {
        console.log('✅ AuthContext: Login successful, storing tokens');
        // Backend API usa 'accessToken' y 'refreshToken'
        localStorage.setItem('auth_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        // Configurar cookie para que middleware/SSR puedan leerla
        document.cookie = `auth_token=${data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        console.log('🔄 AuthContext: Updating auth state');
        setState({
          user: normalizeUser(data.user),
          isLoading: false,
          isAuthenticated: true,
        });

        console.log('✅ AuthContext: Auth state updated successfully', {
          userEmail: data.user?.email,
          isAuthenticated: true,
          isLoading: false
        });
        console.log('🎉 AuthContext: Login complete, user authenticated');
        toast.success('¡Bienvenido de vuelta!');
        return true;
      } else {
        console.log('❌ AuthContext: Login failed', data.error || data.message);
        toast.error(data.error || data.message || 'Error al iniciar sesión');
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('❌ AuthContext: Error en login:', error);
      toast.error('Error de conexión');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch(getBackendApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        
        // También configurar la cookie para que el middleware pueda detectarla
        document.cookie = `auth_token=${data.accessToken}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
        
        setState({
          user: normalizeUser(data.user),
          isLoading: false,
          isAuthenticated: true,
        });

        toast.success('¡Cuenta creada exitosamente!');
        return true;
      } else {
        toast.error(data.error || data.message || 'Error al crear la cuenta');
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Error de conexión. Inténtalo de nuevo.');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    
    // También limpiar la cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    toast.success('Sesión cerrada correctamente');
  };

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return false;

      const response = await fetch(getBackendApiUrl('/api/auth/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        setState(prev => ({
          ...prev,
          user: normalizeUser(data.user),
        }));

        toast.success('Perfil actualizado correctamente');
        return true;
      } else {
        toast.error(data.error || data.message || 'Error al actualizar el perfil');
        return false;
      }
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Error de conexión. Inténtalo de nuevo.');
      return false;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(getBackendApiUrl('/api/auth/refresh'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.accessToken);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      logout();
      return false;
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(getBackendApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Enlace de recuperación enviado a tu email');
        return true;
      } else {
        toast.error(data.error || data.message || 'Error al enviar el enlace de recuperación');
        return false;
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Error de conexión. Inténtalo de nuevo.');
      return false;
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(getBackendApiUrl('/api/auth/verify-email'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        if (state.user) {
          setState(prev => ({
            ...prev,
            user: { ...prev.user!, emailVerified: true },
          }));
        }
        toast.success('Email verificado correctamente');
        return true;
      } else {
        toast.error(data.error || data.message || 'Error al verificar el email');
        return false;
      }
    } catch (error) {
      console.error('Verify email error:', error);
      toast.error('Error de conexión. Inténtalo de nuevo.');
      return false;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch(getBackendApiUrl('/api/auth/reset-password/confirm'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Contraseña actualizada correctamente');
        return true;
      } else {
        toast.error(data.error || data.message || 'Error al actualizar la contraseña');
        return false;
      }
    } catch (error) {
      console.error('Reset password confirm error:', error);
      toast.error('Error de conexión. Inténtalo de nuevo.');
      return false;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    sendPasswordReset,
    verifyEmail,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};