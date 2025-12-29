export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    robotsGenerations: number;
    sitemapUrls: number;
    crawlDepth: number;
  };
}

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Generación básica de robots.txt',
      'Sitemap hasta 100 URLs',
      '2 generaciones por mes'
    ],
    limits: {
      robotsGenerations: 2,
      sitemapUrls: 100,
      crawlDepth: 3
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29,
    features: [
      'Robots.txt avanzado con reglas personalizadas',
      'Sitemap ilimitado',
      'Crawling profundo y análisis avanzado',
      'Regeneración automática programada',
      'Sitemaps especializados (imágenes, videos, noticias)'
    ],
    limits: {
      robotsGenerations: -1, // unlimited
      sitemapUrls: -1, // unlimited
      crawlDepth: 10
    }
  },
  {
    id: 'trial',
    name: 'Trial',
    price: 0,
    features: [
      'Acceso completo por 30 días',
      'Todas las funciones premium'
    ],
    limits: {
      robotsGenerations: -1, // unlimited during trial
      sitemapUrls: -1, // unlimited during trial
      crawlDepth: 10
    }
  }
];

export function getPlan(planId: string): Plan | undefined {
  return plans.find(plan => plan.id === planId);
}

export function getUserPlanLimits(planId: string = 'free') {
  const plan = getPlan(planId);
  return plan?.limits || plans[0].limits;
}

export function getUserPlan(planId: string = 'free'): Plan {
  return getPlan(planId) || plans[0];
}