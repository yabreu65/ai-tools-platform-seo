'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  CreditCard,
  Shield,
  Settings,
  BarChart3,
  Users,
  Mail,
  Phone,
  MessageCircle,
  BookOpen,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe,
  Database,
  Bot,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import SEOHead from '@/components/seo/SEOHead';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const categories = [
    { id: 'all', name: 'Todas', icon: <HelpCircle className="h-4 w-4" />, count: 24 },
    { id: 'general', name: 'General', icon: <Globe className="h-4 w-4" />, count: 6 },
    { id: 'herramientas', name: 'Herramientas', icon: <Zap className="h-4 w-4" />, count: 8 },
    { id: 'precios', name: 'Precios', icon: <CreditCard className="h-4 w-4" />, count: 5 },
    { id: 'cuenta', name: 'Cuenta', icon: <Users className="h-4 w-4" />, count: 3 },
    { id: 'tecnico', name: 'Técnico', icon: <Settings className="h-4 w-4" />, count: 2 }
  ];

  const faqs = [
    // General
    {
      id: 'que-es-yatools',
      category: 'general',
      question: '¿Qué es YA Tools y cómo puede ayudar a mi sitio web?',
      answer: 'YA Tools es una plataforma integral de herramientas SEO potenciadas por inteligencia artificial. Te ayudamos a optimizar tu sitio web para motores de búsqueda mediante análisis técnicos, auditorías de contenido, investigación de palabras clave, y mucho más. Nuestras herramientas están diseñadas para mejorar tu visibilidad online y aumentar el tráfico orgánico.',
      tags: ['seo', 'herramientas', 'optimización']
    },
    {
      id: 'como-empezar',
      category: 'general',
      question: '¿Cómo puedo empezar a usar YA Tools?',
      answer: 'Es muy fácil comenzar: 1) Regístrate para una cuenta gratuita, 2) Ingresa la URL de tu sitio web, 3) Ejecuta tu primer análisis SEO, 4) Revisa los resultados y recomendaciones, 5) Implementa las mejoras sugeridas. Nuestro plan gratuito te permite realizar hasta 5 análisis por mes.',
      tags: ['inicio', 'registro', 'primeros pasos']
    },
    {
      id: 'diferencia-competencia',
      category: 'general',
      question: '¿Qué diferencia a YA Tools de otras herramientas SEO?',
      answer: 'YA Tools se destaca por: 1) IA avanzada que proporciona insights más precisos, 2) Interfaz intuitiva en español, 3) Análisis integral que combina técnico y contenido, 4) Precios competitivos, 5) Soporte en español, 6) Actualizaciones constantes basadas en los últimos algoritmos de Google.',
      tags: ['ventajas', 'competencia', 'características']
    },
    {
      id: 'idiomas-soportados',
      category: 'general',
      question: '¿En qué idiomas está disponible YA Tools?',
      answer: 'Actualmente YA Tools está disponible en español, pero nuestras herramientas pueden analizar sitios web en múltiples idiomas incluyendo inglés, portugués, francés, italiano y alemán. Estamos trabajando en expandir la interfaz a más idiomas basándose en la demanda de nuestros usuarios.',
      tags: ['idiomas', 'internacional', 'localización']
    },
    {
      id: 'actualizaciones-algoritmos',
      category: 'general',
      question: '¿Con qué frecuencia actualizan sus algoritmos?',
      answer: 'Actualizamos nuestros algoritmos de análisis mensualmente para mantenernos al día con los cambios de Google y otros motores de búsqueda. Además, realizamos actualizaciones menores semanalmente basadas en nuevos datos y feedback de usuarios. Te notificamos sobre cambios importantes a través de email y nuestro blog.',
      tags: ['actualizaciones', 'algoritmos', 'google']
    },
    {
      id: 'precision-datos',
      category: 'general',
      question: '¿Qué tan precisos son los datos y análisis?',
      answer: 'Nuestros análisis tienen una precisión del 95%+ basada en múltiples fuentes de datos incluyendo Google Search Console, bases de datos de palabras clave actualizadas, y nuestros propios crawlers. Combinamos datos en tiempo real con análisis históricos para proporcionar insights más completos y precisos.',
      tags: ['precisión', 'datos', 'confiabilidad']
    },

    // Herramientas
    {
      id: 'herramientas-disponibles',
      category: 'herramientas',
      question: '¿Qué herramientas SEO están disponibles?',
      answer: 'Ofrecemos más de 15 herramientas especializadas: Auditoría SEO completa, Análisis de palabras clave, Generador de títulos SEO, Optimizador de contenido, Detector de contenido duplicado, Analizador de velocidad, Checker de Core Web Vitals, Generador de sitemaps, Análisis de backlinks, y más. Cada herramienta está optimizada con IA para resultados superiores.',
      tags: ['herramientas', 'lista', 'funcionalidades']
    },
    {
      id: 'auditoria-seo-completa',
      category: 'herramientas',
      question: '¿Qué incluye la auditoría SEO completa?',
      answer: 'Nuestra auditoría SEO analiza: 1) SEO técnico (velocidad, mobile-friendly, estructura), 2) SEO on-page (títulos, meta descriptions, headers), 3) Contenido (calidad, duplicación, keywords), 4) Enlaces internos y externos, 5) Core Web Vitals, 6) Indexabilidad, 7) Schema markup. Recibes un reporte detallado con puntuación y recomendaciones priorizadas.',
      tags: ['auditoría', 'análisis completo', 'reporte']
    },
    {
      id: 'palabras-clave-investigacion',
      category: 'herramientas',
      question: '¿Cómo funciona la investigación de palabras clave?',
      answer: 'Nuestra herramienta de palabras clave utiliza IA para: 1) Analizar tu nicho y competencia, 2) Sugerir keywords relevantes con volumen de búsqueda, 3) Mostrar dificultad de ranking, 4) Identificar oportunidades de long-tail, 5) Analizar intención de búsqueda, 6) Proporcionar ideas de contenido basadas en keywords. Base de datos actualizada con +500M de keywords.',
      tags: ['keywords', 'investigación', 'volumen búsqueda']
    },
    {
      id: 'generador-titulos-seo',
      category: 'herramientas',
      question: '¿Cómo funciona el generador de títulos SEO?',
      answer: 'Nuestro generador de títulos usa IA avanzada para crear títulos optimizados: 1) Analiza tu keyword principal, 2) Considera la intención de búsqueda, 3) Optimiza longitud (50-60 caracteres), 4) Incluye power words, 5) Genera múltiples variaciones, 6) Predice CTR potencial. Cada título está diseñado para maximizar clicks y rankings.',
      tags: ['títulos', 'generador', 'optimización']
    },
    {
      id: 'core-web-vitals',
      category: 'herramientas',
      question: '¿Qué son los Core Web Vitals y cómo los miden?',
      answer: 'Los Core Web Vitals son métricas de experiencia de usuario que Google usa para ranking: 1) LCP (Largest Contentful Paint) - velocidad de carga, 2) FID (First Input Delay) - interactividad, 3) CLS (Cumulative Layout Shift) - estabilidad visual. Medimos estos valores usando datos reales de usuarios y lab data, proporcionando recomendaciones específicas para mejorar cada métrica.',
      tags: ['core web vitals', 'velocidad', 'experiencia usuario']
    },
    {
      id: 'contenido-duplicado',
      category: 'herramientas',
      question: '¿Cómo detectan el contenido duplicado?',
      answer: 'Nuestro detector de contenido duplicado: 1) Escanea todo tu sitio web, 2) Compara contenido interno y externo, 3) Identifica duplicación exacta y similar, 4) Analiza meta tags duplicados, 5) Detecta thin content, 6) Proporciona recomendaciones de canonicalización. Usamos algoritmos avanzados de similitud textual para detectar incluso duplicación parcial.',
      tags: ['contenido duplicado', 'detección', 'canonicalización']
    },
    {
      id: 'analisis-competencia',
      category: 'herramientas',
      question: '¿Pueden analizar a mis competidores?',
      answer: 'Sí, nuestro análisis de competencia incluye: 1) Identificación automática de competidores, 2) Comparación de keywords, 3) Análisis de backlinks, 4) Gaps de contenido, 5) Estrategias SEO utilizadas, 6) Oportunidades de mejora. Esta función está disponible en planes Profesional y Empresarial.',
      tags: ['competencia', 'análisis comparativo', 'oportunidades']
    },
    {
      id: 'integraciones-disponibles',
      category: 'herramientas',
      question: '¿Qué integraciones ofrecen?',
      answer: 'Integramos con: Google Search Console, Google Analytics, Google My Business, WordPress, Shopify, Wix, Squarespace, Zapier, Slack, y más. También ofrecemos API REST para integraciones personalizadas. Las integraciones permiten importar datos automáticamente y sincronizar resultados con tus herramientas existentes.',
      tags: ['integraciones', 'api', 'conectividad']
    },

    // Precios
    {
      id: 'planes-disponibles',
      category: 'precios',
      question: '¿Qué planes de precios ofrecen?',
      answer: 'Ofrecemos 3 planes: 1) Gratuito ($0) - 5 análisis/mes, herramientas básicas, 2) Profesional ($29/mes) - 100 análisis/mes, todas las herramientas, soporte prioritario, 3) Empresarial ($99/mes) - análisis ilimitados, herramientas premium, API, soporte 24/7. Todos los planes pagados incluyen 14 días de prueba gratuita.',
      tags: ['planes', 'precios', 'características']
    },
    {
      id: 'prueba-gratuita',
      category: 'precios',
      question: '¿Ofrecen prueba gratuita?',
      answer: 'Sí, ofrecemos 14 días de prueba gratuita para todos los planes pagados. No necesitas tarjeta de crédito para comenzar. Durante la prueba tienes acceso completo a todas las funciones del plan seleccionado. Puedes cancelar en cualquier momento sin cargos.',
      tags: ['prueba gratuita', 'sin tarjeta', 'cancelación']
    },
    {
      id: 'cambiar-plan',
      category: 'precios',
      question: '¿Puedo cambiar de plan en cualquier momento?',
      answer: 'Absolutamente. Puedes actualizar o degradar tu plan en cualquier momento desde tu panel de control. Los cambios se aplican inmediatamente: si actualizas, se prorratea el costo; si degradas, el crédito se aplica al siguiente ciclo. No hay penalizaciones por cambiar de plan.',
      tags: ['cambio plan', 'flexibilidad', 'prorrateado']
    },
    {
      id: 'descuentos-anuales',
      category: 'precios',
      question: '¿Hay descuentos por pago anual?',
      answer: 'Sí, ofrecemos 20% de descuento en todos los planes pagados anualmente. Por ejemplo, el plan Profesional cuesta $278.40/año en lugar de $348 (ahorro de $69.60). El descuento se aplica automáticamente al seleccionar facturación anual. También ofrecemos descuentos especiales para estudiantes y ONGs.',
      tags: ['descuento anual', 'ahorro', 'facturación']
    },
    {
      id: 'politica-reembolso',
      category: 'precios',
      question: '¿Cuál es su política de reembolso?',
      answer: 'Ofrecemos garantía de reembolso completo de 30 días para todos los planes pagados. Si no estás satisfecho por cualquier razón, contacta nuestro soporte y procesaremos el reembolso completo sin preguntas. Los reembolsos se procesan en 3-5 días hábiles al método de pago original.',
      tags: ['reembolso', 'garantía', 'satisfacción']
    },

    // Cuenta
    {
      id: 'crear-cuenta',
      category: 'cuenta',
      question: '¿Cómo creo una cuenta?',
      answer: 'Crear una cuenta es simple: 1) Haz clic en "Registrarse", 2) Ingresa tu email y crea una contraseña, 3) Verifica tu email, 4) Completa tu perfil básico, 5) ¡Comienza a usar las herramientas! También puedes registrarte usando tu cuenta de Google o GitHub para mayor comodidad.',
      tags: ['registro', 'cuenta nueva', 'verificación']
    },
    {
      id: 'recuperar-contrasena',
      category: 'cuenta',
      question: '¿Cómo recupero mi contraseña?',
      answer: 'Para recuperar tu contraseña: 1) Ve a la página de login, 2) Haz clic en "¿Olvidaste tu contraseña?", 3) Ingresa tu email, 4) Revisa tu bandeja de entrada (y spam), 5) Haz clic en el enlace de recuperación, 6) Crea una nueva contraseña. El enlace expira en 24 horas por seguridad.',
      tags: ['contraseña', 'recuperación', 'seguridad']
    },
    {
      id: 'eliminar-cuenta',
      category: 'cuenta',
      question: '¿Puedo eliminar mi cuenta?',
      answer: 'Sí, puedes eliminar tu cuenta en cualquier momento desde Configuración > Cuenta > Eliminar cuenta. Ten en cuenta que esta acción es irreversible y eliminará todos tus datos, reportes e historial. Te recomendamos exportar cualquier información importante antes de proceder.',
      tags: ['eliminar cuenta', 'datos', 'irreversible']
    },

    // Técnico
    {
      id: 'api-disponible',
      category: 'tecnico',
      question: '¿Tienen API disponible?',
      answer: 'Sí, ofrecemos API REST completa en planes Profesional (1,000 calls/mes) y Empresarial (10,000 calls/mes). La API permite acceder a todas nuestras herramientas programáticamente: análisis SEO, palabras clave, auditorías, etc. Incluye documentación completa, SDKs en múltiples lenguajes, y soporte técnico dedicado.',
      tags: ['api', 'integración', 'desarrollo']
    },
    {
      id: 'seguridad-datos',
      category: 'tecnico',
      question: '¿Cómo protegen mis datos?',
      answer: 'La seguridad es nuestra prioridad: 1) Encriptación SSL/TLS para todas las comunicaciones, 2) Datos encriptados en reposo, 3) Servidores seguros con certificaciones SOC2, 4) Acceso limitado por roles, 5) Auditorías de seguridad regulares, 6) Cumplimiento GDPR, 7) Backups automáticos diarios. Nunca compartimos tus datos con terceros.',
      tags: ['seguridad', 'encriptación', 'privacidad']
    }
  ];

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const popularQuestions = faqs.slice(0, 6);

  // Generate FAQ Schema
  const faqSchema = {
    questions: faqs.map(faq => ({
      question: faq.question,
      answer: faq.answer
    }))
  };

  return (
    <>
      <SEOHead
        title="Preguntas Frecuentes - YA Tools | Centro de Ayuda SEO"
        description="Encuentra respuestas a las preguntas más comunes sobre YA Tools. Aprende sobre nuestras herramientas SEO, planes de precios, funcionalidades y soporte técnico."
        keywords="preguntas frecuentes, FAQ, ayuda SEO, soporte YA Tools, herramientas SEO, planes precios, tutorial SEO"
        canonical="https://yatools.com/faq"
        type="website"
      />
      
      <SchemaMarkup 
        faq={faqSchema}
        breadcrumb={{
          items: [
            {
              name: "Inicio",
              url: "https://yatools.com"
            },
            {
              name: "Preguntas Frecuentes",
              url: "https://yatools.com/faq"
            }
          ]
        }}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Badge variant="secondary" className="mb-4">
                <HelpCircle className="mr-2 h-4 w-4" />
                Centro de Ayuda
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-tech-blue via-seo-teal to-ai-purple bg-clip-text text-transparent mb-6">
                Preguntas Frecuentes
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Encuentra respuestas rápidas a las preguntas más comunes sobre YA Tools. 
                Si no encuentras lo que buscas, nuestro equipo está aquí para ayudarte.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar en preguntas frecuentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-2"
                  >
                    {category.icon}
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="ml-1">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Popular Questions */}
        {searchTerm === '' && selectedCategory === 'all' && (
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <Star className="h-12 w-12 text-tech-blue mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">Preguntas Más Populares</h2>
                <p className="text-muted-foreground">
                  Las preguntas que nuestros usuarios hacen con más frecuencia
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {popularQuestions.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card 
                      className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => toggleItem(faq.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2 text-left">{faq.question}</h3>
                          <AnimatePresence>
                            {openItems.includes(faq.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <p className="text-muted-foreground text-left">{faq.answer}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="ml-4">
                          {openItems.includes(faq.id) ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ List */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-12"
              >
                <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">No se encontraron resultados</h3>
                <p className="text-muted-foreground mb-6">
                  No encontramos preguntas que coincidan con tu búsqueda. 
                  Intenta con otros términos o contacta nuestro soporte.
                </p>
                <Button asChild>
                  <Link href="/contacto">
                    <Mail className="mr-2 h-4 w-4" />
                    Contactar Soporte
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden">
                      <div
                        className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleItem(faq.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2 text-left">{faq.question}</h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {faq.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="ml-4">
                            {openItems.includes(faq.id) ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {openItems.includes(faq.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-6 pb-6 border-t bg-muted/20">
                              <p className="text-muted-foreground leading-relaxed pt-4 text-left">
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 bg-gradient-to-br from-tech-blue/10 via-seo-teal/10 to-ai-purple/10">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-tech-blue mx-auto mb-6" />
                  <h2 className="text-3xl font-bold mb-4">¿No encontraste tu respuesta?</h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Nuestro equipo de soporte está disponible 24/7 para ayudarte con cualquier pregunta 
                    o problema que puedas tener.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                      <Mail className="h-8 w-8 text-tech-blue mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-sm text-muted-foreground">Respuesta en &lt; 2 horas</p>
                    </div>
                    <div className="text-center">
                      <MessageCircle className="h-8 w-8 text-tech-blue mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Chat en Vivo</h3>
                      <p className="text-sm text-muted-foreground">Disponible 24/7</p>
                    </div>
                    <div className="text-center">
                      <Phone className="h-8 w-8 text-tech-blue mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Teléfono</h3>
                      <p className="text-sm text-muted-foreground">Lun-Vie 9AM-6PM</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild>
                      <Link href="/contacto">
                        <Mail className="mr-2 h-5 w-5" />
                        Contactar Soporte
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/acerca-de">
                        <BookOpen className="mr-2 h-5 w-5" />
                        Conocer Más
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <CheckCircle className="h-12 w-12 text-success-green mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">98%</div>
                  <p className="text-muted-foreground">Problemas resueltos</p>
                </div>
                <div>
                  <Clock className="h-12 w-12 text-tech-blue mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">&lt;2h</div>
                  <p className="text-muted-foreground">Tiempo de respuesta</p>
                </div>
                <div>
                  <Users className="h-12 w-12 text-seo-teal mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">10k+</div>
                  <p className="text-muted-foreground">Usuarios satisfechos</p>
                </div>
                <div>
                  <Star className="h-12 w-12 text-accent-orange mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">4.9/5</div>
                  <p className="text-muted-foreground">Calificación soporte</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}