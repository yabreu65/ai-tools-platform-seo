import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../db/models/User';

// Extender el tipo Request para incluir user con información de plan
export interface SeoAuthRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    plan: 'free' | 'pro' | 'enterprise';
    isVerified: boolean;
    planLimits: {
      maxUrlsPerAnalysis: number;
      maxConcurrentAnalyses: number;
      maxDepth: number;
      exportFormats: string[];
      monthlyAnalyses: number;
    };
  };
}

// Límites por plan
const PLAN_LIMITS = {
  free: {
    maxUrlsPerAnalysis: 100,
    maxConcurrentAnalyses: 1,
    maxDepth: 3,
    exportFormats: ['xml', 'txt'],
    monthlyAnalyses: 10
  },
  pro: {
    maxUrlsPerAnalysis: 5000,
    maxConcurrentAnalyses: 5,
    maxDepth: 10,
    exportFormats: ['xml', 'txt', 'csv'],
    monthlyAnalyses: 500
  },
  enterprise: {
    maxUrlsPerAnalysis: -1, // Ilimitado
    maxConcurrentAnalyses: 20,
    maxDepth: 20,
    exportFormats: ['xml', 'txt', 'csv', 'json'],
    monthlyAnalyses: -1 // Ilimitado
  }
};

// Middleware de autenticación para herramientas SEO
export const requireSeoAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // Método alternativo: verificar headers personalizados (x-user-id, x-user-email, x-user-plan)
    const customUserId = req.headers['x-user-id'] as string;
    const customUserEmail = req.headers['x-user-email'] as string;
    const customUserPlan = (req.headers['x-user-plan'] as string) || 'free';

    // DEBUG: Log para ver qué está recibiendo
    console.log('🔍 DEBUG seoAuth:', {
      hasToken: !!token,
      hasCustomUserId: !!customUserId,
      hasCustomUserEmail: !!customUserEmail,
      customUserPlan,
      authHeader,
      allHeaders: req.headers
    });

    if (!token) {
      // Si hay headers personalizados, usarlos
      if (customUserId && customUserEmail) {
        const userPlan = customUserPlan as 'free' | 'pro' | 'enterprise';
        (req as SeoAuthRequest).user = {
          id: customUserId,
          email: customUserEmail,
          name: customUserEmail.split('@')[0],
          plan: userPlan,
          isVerified: true,
          planLimits: PLAN_LIMITS[userPlan]
        };
        next();
        return;
      }

      // Para desarrollo, usar usuario simulado si no hay token ni headers
      if (process.env.NODE_ENV === 'development') {
        (req as SeoAuthRequest).user = {
          id: 'dev-user-123',
          email: 'dev@example.com',
          name: 'Developer User',
          plan: 'pro',
          isVerified: true,
          planLimits: PLAN_LIMITS.pro
        };
        next();
        return;
      }

      res.status(401).json({
        success: false,
        error: 'Token de acceso requerido'
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401).json({ 
        success: false,
        error: 'Token inválido' 
      });
      return;
    }

    // Determinar el plan del usuario (por defecto free si no está definido)
    const userPlan = (user as any).plan || 'free';
    
    (req as SeoAuthRequest).user = {
      id: String(user._id),
      email: user.email,
      name: user.name || '',
      plan: userPlan,
      isVerified: user.isVerified || false,
      planLimits: PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS]
    };

    next();
  } catch (error) {
    console.error('Error en autenticación SEO:', error);
    res.status(401).json({ 
      success: false,
      error: 'Token inválido' 
    });
  }
};

// Middleware para verificar límites del plan
export const checkPlanLimits = (requiredFeature: 'depth' | 'export' | 'concurrent') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as SeoAuthRequest;
    
    if (!authReq.user) {
      res.status(401).json({ 
        success: false,
        error: 'Usuario no autenticado' 
      });
      return;
    }

    const { plan, planLimits } = authReq.user;

    switch (requiredFeature) {
      case 'depth':
        const requestedDepth = parseInt(req.body.depth || req.query.depth as string) || 3;
        if (planLimits.maxDepth !== -1 && requestedDepth > planLimits.maxDepth) {
          res.status(403).json({
            success: false,
            error: 'Límite de profundidad excedido',
            details: {
              requested: requestedDepth,
              allowed: planLimits.maxDepth,
              plan: plan,
              upgrade: plan === 'free' ? 'pro' : 'enterprise'
            }
          });
          return;
        }
        break;
        
      case 'export':
        const requestedFormat = req.body.format || req.query.format as string;
        if (requestedFormat && !planLimits.exportFormats.includes(requestedFormat)) {
          res.status(403).json({
            success: false,
            error: 'Formato de exportación no permitido',
            details: {
              requested: requestedFormat,
              allowed: planLimits.exportFormats,
              plan: plan,
              upgrade: plan === 'free' ? 'pro' : 'enterprise'
            }
          });
          return;
        }
        break;
    }

    next();
  };
};

export { PLAN_LIMITS };