// Configuración para producción
export const productionConfig = {
  // URLs de API
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.tudominio.com',
  
  // URLs de servicios externos
  WEBHOOK_URL: process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://webhook.tudominio.com',
  
  // Configuración de cache
  CACHE_TTL: {
    AUDIT: 15, // minutos
    SITEMAP: 30, // minutos
    KEYWORDS: 20, // minutos
    CONTENT_OPTIMIZER: 25, // minutos
  },
  
  // Límites de rate limiting
  RATE_LIMITS: {
    FREE_PLAN: {
      REQUESTS_PER_HOUR: 10,
      REQUESTS_PER_DAY: 50,
    },
    PRO_PLAN: {
      REQUESTS_PER_HOUR: 100,
      REQUESTS_PER_DAY: 1000,
    },
    ENTERPRISE_PLAN: {
      REQUESTS_PER_HOUR: 500,
      REQUESTS_PER_DAY: 10000,
    },
  },
  
  // Configuración de analytics
  ANALYTICS: {
    GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GA_ID,
    MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
    HOTJAR_ID: process.env.NEXT_PUBLIC_HOTJAR_ID,
  },
  
  // Configuración de SEO
  SEO: {
    SITE_NAME: 'Plataforma de Herramientas SEO',
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://tudominio.com',
    DEFAULT_TITLE: 'Herramientas SEO Profesionales | Optimiza tu sitio web',
    DEFAULT_DESCRIPTION: 'Plataforma completa de herramientas SEO para auditorías, análisis de palabras clave, generación de sitemaps y optimización de contenido.',
  },
  
  // Configuración de seguridad
  SECURITY: {
    CORS_ORIGINS: [
      'https://tudominio.com',
      'https://www.tudominio.com',
      'https://app.tudominio.com',
    ],
    JWT_SECRET: process.env.JWT_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  },
  
  // Configuración de base de datos
  DATABASE: {
    MONGODB_URI: process.env.MONGODB_URI,
    REDIS_URL: process.env.REDIS_URL,
  },
  
  // Configuración de email
  EMAIL: {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@tudominio.com',
  },
  
  // Configuración de almacenamiento
  STORAGE: {
    AWS_BUCKET: process.env.AWS_S3_BUCKET,
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    CDN_URL: process.env.CDN_URL,
  },
  
  // Configuración de monitoreo
  MONITORING: {
    SENTRY_DSN: process.env.SENTRY_DSN,
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    HEALTH_CHECK_INTERVAL: 30000, // 30 segundos
  },
};

// Validar variables de entorno críticas
export function validateProductionConfig() {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'NEXT_PUBLIC_API_URL',
  ];
  
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    throw new Error(
      `Variables de entorno faltantes: ${missingVars.join(', ')}`
    );
  }
}

// Configuración específica por entorno
export function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...productionConfig,
        DEBUG: false,
        CACHE_ENABLED: true,
        RATE_LIMITING_ENABLED: true,
      };
    
    case 'staging':
      return {
        ...productionConfig,
        API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.tudominio.com',
        DEBUG: true,
        CACHE_ENABLED: true,
        RATE_LIMITING_ENABLED: true,
      };
    
    case 'development':
    default:
      return {
        ...productionConfig,
        API_BASE_URL: 'http://localhost:3001',
        WEBHOOK_URL: 'http://localhost:5678',
        DEBUG: true,
        CACHE_ENABLED: false,
        RATE_LIMITING_ENABLED: false,
      };
  }
}