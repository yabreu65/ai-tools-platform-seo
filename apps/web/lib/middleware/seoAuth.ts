// Simplified SEO auth middleware for demo purposes
export const seoAuth = async () => {
  return {
    user: {
      id: 'demo-user',
      plan: 'basic'
    }
  };
};

export const requireAuth = async (request: Request) => {
  // Mock authentication for demo
  return {
    user: {
      id: 'demo-user',
      userId: 'demo-user',
      plan: 'basic',
      email: 'demo@example.com'
    }
  };
};