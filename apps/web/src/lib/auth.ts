import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    return {
      id: decoded.id || 'test-user',
      email: decoded.email || 'test@example.com',
      name: decoded.name || 'Test User',
      plan: decoded.plan || 'free'
    };
  } catch (error) {
    return null;
  }
}

export function generateToken(user: User): string {
  return jwt.sign(user, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d'
  });
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// Mock database for demo purposes
export const UserDatabase = {
  async findById(id: string) {
    return {
      id,
      userId: id,
      email: 'demo@example.com',
      plan: 'basic',
      name: 'Demo User',
      monthlyAnalysisCount: 0,
      monthlyExportCount: 0,
      monthlySaveCount: 0,
      monthlyContentAnalysisCount: 0,
      usageResetDate: new Date(),
      usage: {
        monthlyContentAnalysis: 0,
        monthlyAnalyses: 0
      }
    };
  },
  
  async findUserById(id: string) {
    return {
      id,
      userId: id,
      email: 'demo@example.com',
      plan: 'basic',
      name: 'Demo User',
      monthlyAnalysisCount: 0,
      monthlyExportCount: 0,
      monthlySaveCount: 0,
      monthlyContentAnalysisCount: 0,
      usageResetDate: new Date(),
      usage: {
        monthlyContentAnalysis: 0,
        monthlyAnalyses: 0
      }
    };
  },
  
  async updateUsage(id: string, usage: any) {
    // Mock update
    return true;
  },
  
  async updateUser(id: string, updates: any) {
    // Mock update
    return true;
  }
};