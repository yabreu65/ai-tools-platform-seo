'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  X, 
  Star,
  Zap,
  Crown,
  Users,
  BarChart3,
  Shield,
  Headphones,
  Rocket,
  CreditCard,
  Gift,
  TrendingUp,
  Clock,
  Database,
  Bot,
  Globe,
  Mail,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import SEOHead from '@/components/seo/SEOHead';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export default function PreciosPage() {
  const plans = [
    {
      name: 'Gratuito',
      price: '$0',
      period: 'para siempre',
      description: 'Perfecto para comenzar con SEO básico',
      icon: <Gift className="h-8 w-8" />,
      color: 'from-gray-500 to-gray-600',
      popular: false,
      features: [
        { name: '5 análisis SEO por mes', included: true },
        { name: '3 herramientas básicas', included: true },
        { name: 'Reportes básicos', included: true },
        { name: 'Soporte por email', included: true },
        { name: 'Análisis de palabras clave básico', included: true },
        { name: 'Herramientas avanzadas', included: false },
        { name: 'Análisis de competencia', included: false },
        { name: 'API access', included: false },
        { name: 'Soporte prioritario', included: false },
        { name: 'Reportes personalizados', included: false }
      ],
      cta: 'Comenzar Gratis',
      ctaVariant: 'outline' as const
    },
    {
      name: 'Profesional',
      price: '$29',
      period: '/mes',
      description: 'Para profesionales y pequeñas empresas',
      icon: <Zap className="h-8 w-8" />,
      color: 'from-tech-blue to-seo-teal',
      popular: true,
      features: [
        { name: '100 análisis SEO por mes', included: true },
        { name: 'Todas las herramientas SEO', included: true },
        { name: 'Reportes avanzados', included: true },
        { name: 'Soporte prioritario', included: true },
        { name: 'Análisis de competencia', included: true },
        { name: 'Seguimiento de rankings', included: true },
        { name: 'Auditorías técnicas completas', included: true },
        { name: 'API básica (1000 calls/mes)', included: true },
        { name: 'Exportación de datos', included: true },
        { name: 'Integraciones básicas', included: true }
      ],
      cta: 'Comenzar Prueba Gratuita',
      ctaVariant: 'default' as const
    },
    {
      name: 'Empresarial',
      price: '$99',
      period: '/mes',
      description: 'Para agencias y grandes empresas',
      icon: <Crown className="h-8 w-8" />,
      color: 'from-ai-purple to-accent-orange',
      popular: false,
      features: [
        { name: 'Análisis SEO ilimitados', included: true },
        { name: 'Todas las herramientas premium', included: true },
        { name: 'Reportes personalizados', included: true },
        { name: 'Soporte 24/7', included: true },
        { name: 'Análisis de competencia avanzado', included: true },
        { name: 'White-label reports', included: true },
        { name: 'API completa (10,000 calls/mes)', included: true },
        { name: 'Múltiples usuarios', included: true },
        { name: 'Integraciones avanzadas', included: true },
        { name: 'Consultoría SEO incluida', included: true }
      ],
      cta: 'Contactar Ventas',
      ctaVariant: 'default' as const
    }
  ];

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Análisis Completo',
      description: 'Auditorías técnicas y de contenido detalladas'
    },
    {
      icon: <Bot className="h-6 w-6" />,
      title: 'IA Avanzada',
      description: 'Algoritmos de inteligencia artificial para mejores resultados'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Seguimiento de Rankings',
      description: 'Monitoreo continuo de posiciones en buscadores'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Datos Seguros',
      description: 'Protección y privacidad de tus datos garantizada'
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Múltiples Idiomas',
      description: 'Soporte para análisis SEO en diferentes idiomas'
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Base de Datos Actualizada',
      description: 'Información de palabras clave siempre actualizada'
    }
  ];

  const faqs = [
    {
      question: '¿Puedo cambiar de plan en cualquier momento?',
      answer: 'Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se reflejan inmediatamente y se prorratea la facturación.'
    },
    {
      question: '¿Hay descuentos por pago anual?',
      answer: 'Sí, ofrecemos un 20% de descuento en todos los planes pagados anualmente. Contacta a nuestro equipo de ventas para más detalles.'
    },
    {
      question: '¿Qué incluye la prueba gratuita?',
      answer: 'La prueba gratuita de 14 días incluye acceso completo al plan Profesional sin restricciones. No se requiere tarjeta de crédito.'
    },
    {
      question: '¿Ofrecen reembolsos?',
      answer: 'Sí, ofrecemos una garantía de reembolso de 30 días para todos los planes de pago. Sin preguntas, sin complicaciones.'
    }
  ];

  // Generate Service Schema for each plan
  const serviceSchema = plans.map(plan => ({
    "@type": "Service",
    "name": `Plan ${plan.name} - YA Tools`,
    "description": plan.description,
    "provider": {
      "@type": "Organization",
      "name": "YA Tools"
    },
    "offers": {
      "@type": "Offer",
      "price": plan.price.replace('$', ''),
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": plan.price.replace('$', ''),
        "priceCurrency": "USD",
        "billingIncrement": plan.period === '/mes' ? 'Monthly' : 'One-time'
      }
    }
  }));

  return (
    <>
      <SEOHead
        title="Precios y Planes - YA Tools | Herramientas SEO desde $0"
        description="Descubre nuestros planes de herramientas SEO: Gratuito, Profesional ($29/mes) y Empresarial ($99/mes). 14 días de prueba gratuita. Elige el plan perfecto para tu negocio."
        keywords="precios SEO, planes herramientas SEO, YA Tools precios, plan gratuito SEO, plan profesional SEO, plan empresarial SEO, prueba gratuita SEO"
        canonical="https://yatools.com/precios"
        type="website"
      />
      
      <SchemaMarkup 
        service={serviceSchema}
        breadcrumb={{
          items: [
            {
              name: "Inicio",
              url: "https://yatools.com"
            },
            {
              name: "Precios",
              url: "https://yatools.com/precios"
            }
          ]
        }}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Badge variant="secondary" className="mb-4">
                <CreditCard className="mr-2 h-4 w-4" />
                Planes y Precios
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-tech-blue via-seo-teal to-ai-purple bg-clip-text text-transparent mb-6">
                Elige tu Plan Perfecto
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Desde herramientas básicas hasta análisis empresariales completos. 
                Encuentra el plan que se adapte a tus necesidades de SEO.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Check className="mr-1 h-4 w-4 text-success-green" />
                  14 días de prueba gratuita
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Shield className="mr-1 h-4 w-4 text-success-green" />
                  Sin compromiso
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <CreditCard className="mr-1 h-4 w-4 text-success-green" />
                  Cancela cuando quieras
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-tech-blue to-seo-teal text-white">
                        <Star className="mr-1 h-3 w-3" />
                        Más Popular
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`p-8 h-full ${plan.popular ? 'ring-2 ring-tech-blue shadow-xl scale-105' : ''}`}>
                    <div className="text-center mb-8">
                      <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${plan.color} text-white mb-4`}>
                        {plan.icon}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-muted-foreground mb-4">{plan.description}</p>
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground ml-1">{plan.period}</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-success-green mr-3 flex-shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                          )}
                          <span className={feature.included ? '' : 'text-muted-foreground'}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full" 
                      variant={plan.ctaVariant}
                      size="lg"
                      asChild
                    >
                      <Link href={plan.name === 'Gratuito' ? '/registro' : '/contacto'}>
                        {plan.cta}
                      </Link>
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ¿Por qué elegir YA Tools?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Todas las herramientas que necesitas para dominar el SEO, 
                respaldadas por inteligencia artificial y datos precisos.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-6 text-center h-full">
                    <div className="inline-flex p-3 rounded-full bg-gradient-to-r from-tech-blue to-seo-teal text-white mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Preguntas Frecuentes
              </h2>
              <p className="text-xl text-muted-foreground">
                Resolvemos las dudas más comunes sobre nuestros planes
              </p>
            </motion.div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <HelpCircle className="mr-2 h-5 w-5 text-tech-blue" />
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground pl-7">{faq.answer}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-tech-blue via-seo-teal to-ai-purple">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Listo para mejorar tu SEO?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Únete a miles de profesionales que ya confían en YA Tools 
                para optimizar sus sitios web y aumentar su tráfico orgánico.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/registro">
                    <Rocket className="mr-2 h-5 w-5" />
                    Comenzar Gratis
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-tech-blue" asChild>
                  <Link href="/contacto">
                    <Mail className="mr-2 h-5 w-5" />
                    Hablar con Ventas
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}