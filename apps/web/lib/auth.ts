// Simplified auth for demo purposes
export const authOptions = {
  // Mock auth options
};

export interface User {
  id: string;
  userId: string;
  email?: string;
  plan: 'free' | 'premium' | 'trial' | 'basic';
  name?: string;
}

export const getServerSession = async () => {
  return {
    user: {
      id: 'demo-user',
      userId: 'demo-user',
      plan: 'basic' as const
    }
  };
};

export const verifyToken = async (token: string): Promise<User | null> => {
  // Mock token verification for demo
  if (!token) return null;
  
  return {
    id: 'demo-user',
    userId: 'demo-user',
    email: 'demo@example.com',
    plan: 'basic',
    name: 'Demo User'
  };
};

export const extractTokenFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

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

// Mock auth service
export const AuthService = {
  async login(email: string, password: string) {
    return {
      user: {
        id: 'demo-user',
        userId: 'demo-user',
        email,
        plan: 'basic',
        name: 'Demo User'
      },
      token: 'demo-token'
    };
  },
  
  async register(email: string, password: string, name: string) {
    return {
      user: {
        id: 'demo-user',
        userId: 'demo-user',
        email,
        plan: 'free',
        name
      },
      token: 'demo-token'
    };
  },
  
  async refreshToken(token: string) {
    return {
      token: 'new-demo-token',
      user: {
        id: 'demo-user',
        userId: 'demo-user',
        email: 'demo@example.com',
        plan: 'basic',
        name: 'Demo User'
      }
    };
  }
};