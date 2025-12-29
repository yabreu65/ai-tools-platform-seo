'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NewsletterSubscriber, NewsletterCampaign } from '@/types/content';

interface NewsletterContextType {
  // Subscribers
  subscribers: NewsletterSubscriber[];
  campaigns: NewsletterCampaign[];
  loading: boolean;
  error: string | null;
  
  // Subscription status
  isSubscribed: boolean;
  subscriberEmail: string | null;
  
  // Actions
  subscribe: (email: string, preferences?: string[]) => Promise<{ success: boolean; message: string }>;
  unsubscribe: (email: string) => Promise<{ success: boolean; message: string }>;
  updatePreferences: (email: string, preferences: string[]) => Promise<{ success: boolean; message: string }>;
  confirmSubscription: (token: string) => Promise<{ success: boolean; message: string }>;
  
  // Campaign management
  fetchCampaigns: () => Promise<void>;
  getCampaignMetrics: (campaignId: string) => {
    sent: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
  } | null;
  
  // Analytics
  getSubscriberStats: () => {
    total: number;
    active: number;
    pending: number;
    unsubscribed: number;
    growthRate: number;
  };
  getPopularPreferences: () => { preference: string; count: number; percentage: number }[];
  getRecentCampaigns: (limit?: number) => NewsletterCampaign[];
}

const NewsletterContext = createContext<NewsletterContextType | undefined>(undefined);

export function useNewsletter() {
  const context = useContext(NewsletterContext);
  if (context === undefined) {
    throw new Error('useNewsletter must be used within a NewsletterProvider');
  }
  return context;
}

interface NewsletterProviderProps {
  children: ReactNode;
}

export function NewsletterProvider({ children }: NewsletterProviderProps) {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState<string | null>(null);

  // Available preferences
  const availablePreferences = [
    'Guías SEO',
    'Noticias del sector',
    'Casos de estudio',
    'Herramientas nuevas',
    'Tutoriales',
    'Webinars',
    'Ofertas especiales',
    'Actualizaciones de producto'
  ];

  // Mock data for development
  const mockSubscribers: NewsletterSubscriber[] = [
    {
      id: '1',
      email: 'maria@digitalagency.com',
      name: 'María González',
      status: 'active',
      subscribedAt: new Date('2024-01-01'),
      preferences: ['Guías SEO', 'Casos de estudio', 'Herramientas nuevas'],
      source: 'blog',
      tags: ['agency', 'seo-professional']
    },
    {
      id: '2',
      email: 'carlos@ecommerce.com',
      name: 'Carlos Ruiz',
      status: 'active',
      subscribedAt: new Date('2024-01-05'),
      preferences: ['Noticias del sector', 'Tutoriales', 'Ofertas especiales'],
      source: 'homepage',
      tags: ['ecommerce', 'marketing-director']
    },
    {
      id: '3',
      email: 'ana@freelancer.com',
      name: 'Ana López',
      status: 'active',
      subscribedAt: new Date('2024-01-10'),
      preferences: ['Guías SEO', 'Tutoriales', 'Webinars'],
      source: 'social-media',
      tags: ['freelancer', 'consultant']
    },
    {
      id: '4',
      email: 'pedro@startup.com',
      name: 'Pedro Martín',
      status: 'pending',
      subscribedAt: new Date('2024-01-15'),
      preferences: ['Casos de estudio', 'Herramientas nuevas', 'Actualizaciones de producto'],
      source: 'referral',
      tags: ['startup', 'growth-manager']
    },
    {
      id: '5',
      email: 'laura@agency.com',
      name: 'Laura Fernández',
      status: 'active',
      subscribedAt: new Date('2024-01-18'),
      preferences: ['Guías SEO', 'Noticias del sector', 'Casos de estudio'],
      source: 'blog',
      tags: ['agency', 'team-lead']
    }
  ];

  const mockCampaigns: NewsletterCampaign[] = [
    {
      id: '1',
      title: 'Guía Completa SEO 2024 - Lo que Necesitas Saber',
      subject: '🚀 Nueva Guía SEO 2024 + Herramientas Gratuitas',
      content: `# ¡Hola {name}!

Esperamos que estés teniendo una semana fantástica. Hoy queremos compartir contigo nuestra nueva **Guía Completa de SEO 2024**.

## 🎯 Lo que encontrarás en esta guía:

- ✅ Estrategias SEO actualizadas para 2024
- ✅ Nuevos factores de ranking de Google
- ✅ Herramientas gratuitas imprescindibles
- ✅ Casos de estudio reales con resultados

## 📊 Resultados que puedes esperar:

Nuestros clientes que han implementado estas estrategias han visto:
- **+180%** en tráfico orgánico
- **+95%** en conversiones
- **-40%** en costos de adquisición

[👉 DESCARGAR GUÍA GRATUITA](https://yatools.com/guia-seo-2024)

## 🛠️ Herramientas destacadas este mes:

1. **Generador de Títulos SEO** - Crea títulos que convierten
2. **Analizador de Palabras Clave** - Encuentra oportunidades ocultas
3. **Optimizador de Meta Descripciones** - Mejora tu CTR

## 📈 Caso de estudio del mes:

**E-commerce aumenta ventas 300% con SEO**
Descubre cómo ModaStyle triplicó sus ventas orgánicas en solo 6 meses.

[Leer caso completo →](https://yatools.com/casos-estudio/modastyle)

---

¿Tienes preguntas sobre SEO? Responde a este email, ¡nos encanta ayudar!

Un abrazo,
El equipo de YA Tools

P.D. Si este email te ha sido útil, ¡compártelo con un colega!`,
      status: 'sent',
      scheduledAt: new Date('2024-01-20T10:00:00'),
      sentAt: new Date('2024-01-20T10:00:00'),
      recipients: 1250,
      metrics: {
        sent: 1250,
        delivered: 1235,
        opened: 618,
        clicked: 185,
        unsubscribed: 3,
        bounced: 15
      },
      tags: ['seo-guide', 'monthly-newsletter'],
      template: 'newsletter-standard'
    },
    {
      id: '2',
      title: 'Nuevas Funcionalidades YA Tools - Enero 2024',
      subject: '🎉 Nuevas herramientas SEO disponibles',
      content: `# ¡Hola {name}!

Tenemos noticias emocionantes que compartir contigo. Este mes hemos lanzado nuevas funcionalidades que van a revolucionar tu trabajo SEO.

## 🆕 Novedades de enero:

### 1. Analizador de Core Web Vitals
- Monitoreo en tiempo real
- Recomendaciones específicas
- Comparativa con competidores

### 2. Generador de Schema Markup
- Más de 20 tipos de schema
- Validación automática
- Integración con Google

### 3. Auditor de SEO Local
- Análisis de Google My Business
- Optimización de NAP
- Seguimiento de rankings locales

## 📊 Métricas de la comunidad:

- **+2,500** nuevos usuarios este mes
- **150,000** análisis SEO realizados
- **98%** de satisfacción de usuarios

## 🎓 Próximos webinars:

- **25 Enero**: "SEO Local para Pequeños Negocios"
- **1 Febrero**: "Core Web Vitals: Guía Práctica"
- **8 Febrero**: "Schema Markup Avanzado"

[Reservar plaza gratuita →](https://yatools.com/webinars)

---

¡Gracias por ser parte de la comunidad YA Tools!

El equipo de YA Tools`,
      status: 'sent',
      scheduledAt: new Date('2024-01-25T09:00:00'),
      sentAt: new Date('2024-01-25T09:00:00'),
      recipients: 1280,
      metrics: {
        sent: 1280,
        delivered: 1265,
        opened: 759,
        clicked: 228,
        unsubscribed: 2,
        bounced: 15
      },
      tags: ['product-updates', 'features'],
      template: 'newsletter-product'
    },
    {
      id: '3',
      title: 'Caso de Estudio: SaaS B2B de 0 a 50K Usuarios',
      subject: '📈 Cómo un SaaS creció 50K usuarios con SEO',
      content: `# ¡Hola {name}!

Hoy queremos compartir contigo uno de nuestros casos de estudio más impresionantes: cómo ProductivityPro pasó de 0 a 50,000 usuarios en solo 12 meses usando únicamente SEO.

## 🎯 El desafío:

ProductivityPro era una startup completamente nueva:
- ❌ Sin presencia online
- ❌ Presupuesto limitado para marketing
- ❌ Competencia establecida

## 🚀 La estrategia:

### 1. Investigación profunda
- Análisis de 500+ keywords
- Mapeo del customer journey
- Identificación de content gaps

### 2. Contenido programático
- 200+ landing pages optimizadas
- Comparativas con competidores
- Calculadoras y herramientas gratuitas

### 3. SEO técnico avanzado
- Arquitectura escalable
- Core Web Vitals optimizados
- Schema markup implementado

## 📊 Los resultados:

- **50,000** usuarios registrados
- **85,000** visitantes orgánicos/mes
- **2,800** keywords en top 10
- **$125,000** MRR orgánico

## 💡 Lecciones clave:

1. **El contenido programático funciona** para SaaS B2B
2. **La paciencia es clave** - los resultados llegaron en el mes 4
3. **El SEO técnico es fundamental** para la escalabilidad

[Leer caso completo con detalles →](https://yatools.com/casos-estudio/productivitypro)

## 🛠️ Herramientas que usaron:

- YA Tools Suite Completa
- Google Search Console
- Ahrefs para competencia
- Hotjar para UX

¿Quieres replicar estos resultados? ¡Empezemos!

[Comenzar análisis gratuito →](https://yatools.com/analisis-gratuito)

---

Un abrazo,
El equipo de YA Tools`,
      status: 'scheduled',
      scheduledAt: new Date('2024-02-01T10:00:00'),
      recipients: 1300,
      tags: ['case-study', 'saas', 'b2b'],
      template: 'newsletter-case-study'
    }
  ];

  // Initialize mock data
  useEffect(() => {
    setSubscribers(mockSubscribers);
    setCampaigns(mockCampaigns);
    
    // Check if user is subscribed (in a real app, this would check localStorage or API)
    const savedEmail = localStorage.getItem('newsletter_email');
    if (savedEmail) {
      setSubscriberEmail(savedEmail);
      setIsSubscribed(true);
    }
  }, []);

  const subscribe = async (email: string, preferences: string[] = []): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if already subscribed
      const existingSubscriber = subscribers.find(s => s.email === email);
      if (existingSubscriber) {
        if (existingSubscriber.status === 'active') {
          return { success: false, message: 'Ya estás suscrito a nuestro newsletter.' };
        } else if (existingSubscriber.status === 'pending') {
          return { success: false, message: 'Ya tienes una suscripción pendiente. Revisa tu email para confirmar.' };
        }
      }

      // Create new subscriber
      const newSubscriber: NewsletterSubscriber = {
        id: Date.now().toString(),
        email,
        status: 'pending',
        subscribedAt: new Date(),
        preferences: preferences.length > 0 ? preferences : ['Guías SEO', 'Noticias del sector'],
        source: 'website',
        tags: []
      };

      setSubscribers(prev => [...prev, newSubscriber]);
      setError(null);
      
      return { 
        success: true, 
        message: 'Te hemos enviado un email de confirmación. Revisa tu bandeja de entrada.' 
      };
    } catch (err) {
      setError('Error al suscribirse al newsletter');
      return { success: false, message: 'Error al procesar la suscripción. Inténtalo de nuevo.' };
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async (email: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSubscribers(prev => prev.map(s => 
        s.email === email ? { ...s, status: 'unsubscribed', unsubscribedAt: new Date() } : s
      ));
      
      if (subscriberEmail === email) {
        setIsSubscribed(false);
        setSubscriberEmail(null);
        localStorage.removeItem('newsletter_email');
      }
      
      setError(null);
      return { success: true, message: 'Te has desuscrito correctamente del newsletter.' };
    } catch (err) {
      setError('Error al desuscribirse del newsletter');
      return { success: false, message: 'Error al procesar la desuscripción. Inténtalo de nuevo.' };
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (email: string, preferences: string[]): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSubscribers(prev => prev.map(s => 
        s.email === email ? { ...s, preferences } : s
      ));
      
      setError(null);
      return { success: true, message: 'Preferencias actualizadas correctamente.' };
    } catch (err) {
      setError('Error al actualizar las preferencias');
      return { success: false, message: 'Error al actualizar las preferencias. Inténtalo de nuevo.' };
    } finally {
      setLoading(false);
    }
  };

  const confirmSubscription = async (token: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      // In a real app, this would validate the token and activate the subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, activate the first pending subscriber
      const pendingSubscriber = subscribers.find(s => s.status === 'pending');
      if (pendingSubscriber) {
        setSubscribers(prev => prev.map(s => 
          s.id === pendingSubscriber.id ? { ...s, status: 'active', confirmedAt: new Date() } : s
        ));
        
        setIsSubscribed(true);
        setSubscriberEmail(pendingSubscriber.email);
        localStorage.setItem('newsletter_email', pendingSubscriber.email);
      }
      
      setError(null);
      return { success: true, message: '¡Suscripción confirmada! Bienvenido a nuestro newsletter.' };
    } catch (err) {
      setError('Error al confirmar la suscripción');
      return { success: false, message: 'Error al confirmar la suscripción. El enlace puede haber expirado.' };
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Campaigns are already set in useEffect
      setError(null);
    } catch (err) {
      setError('Error al cargar las campañas');
    } finally {
      setLoading(false);
    }
  };

  const getCampaignMetrics = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign || !campaign.metrics) return null;

    const { sent, opened, clicked } = campaign.metrics;
    return {
      sent,
      opened,
      clicked,
      openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      clickRate: opened > 0 ? Math.round((clicked / opened) * 100) : 0
    };
  };

  const getSubscriberStats = () => {
    const total = subscribers.length;
    const active = subscribers.filter(s => s.status === 'active').length;
    const pending = subscribers.filter(s => s.status === 'pending').length;
    const unsubscribed = subscribers.filter(s => s.status === 'unsubscribed').length;
    
    // Calculate growth rate (mock calculation)
    const growthRate = 15.5; // This would be calculated based on historical data
    
    return {
      total,
      active,
      pending,
      unsubscribed,
      growthRate
    };
  };

  const getPopularPreferences = () => {
    const activeSubscribers = subscribers.filter(s => s.status === 'active');
    const preferenceCounts: { [key: string]: number } = {};
    
    activeSubscribers.forEach(subscriber => {
      subscriber.preferences.forEach(preference => {
        preferenceCounts[preference] = (preferenceCounts[preference] || 0) + 1;
      });
    });
    
    const total = activeSubscribers.length;
    
    return Object.entries(preferenceCounts)
      .map(([preference, count]) => ({
        preference,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getRecentCampaigns = (limit = 5): NewsletterCampaign[] => {
    return [...campaigns]
      .sort((a, b) => {
        const aDate = a.sentAt || a.scheduledAt || new Date(0);
        const bDate = b.sentAt || b.scheduledAt || new Date(0);
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, limit);
  };

  const value: NewsletterContextType = {
    subscribers,
    campaigns,
    loading,
    error,
    isSubscribed,
    subscriberEmail,
    subscribe,
    unsubscribe,
    updatePreferences,
    confirmSubscription,
    fetchCampaigns,
    getCampaignMetrics,
    getSubscriberStats,
    getPopularPreferences,
    getRecentCampaigns
  };

  return (
    <NewsletterContext.Provider value={value}>
      {children}
    </NewsletterContext.Provider>
  );
}