'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/seo/SEOHead';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Cookie,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle,
  Globe,
  Users,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function PrivacidadPage() {
  // SEO Schema for Privacy Policy
  const privacySchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://yatools.com/privacidad",
        "url": "https://yatools.com/privacidad",
        "name": "Política de Privacidad - YA Tools",
        "description": "Política de privacidad de YA Tools. Conoce cómo protegemos tu información personal y respetamos tu privacidad en nuestra plataforma SEO.",
        "inLanguage": "es-ES",
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://yatools.com"
        },
        "datePublished": "2025-01-15T00:00:00+00:00",
        "dateModified": "2025-01-15T00:00:00+00:00"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Inicio",
            "item": "https://yatools.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Política de Privacidad",
            "item": "https://yatools.com/privacidad"
          }
        ]
      }
    ]
  };

  const sections = [
    {
      id: 'informacion-recopilamos',
      title: 'Información que Recopilamos',
      icon: <Database className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Información Personal',
          items: [
            'Nombre completo y dirección de email',
            'Información de la empresa (nombre, sitio web)',
            'Datos de contacto (teléfono, dirección)',
            'Información de facturación y pago'
          ]
        },
        {
          subtitle: 'Información de Uso',
          items: [
            'Datos de navegación y comportamiento en la plataforma',
            'Direcciones IP y información del dispositivo',
            'Cookies y tecnologías de seguimiento',
            'Logs de actividad y métricas de rendimiento'
          ]
        },
        {
          subtitle: 'Información de SEO',
          items: [
            'URLs y dominios analizados',
            'Palabras clave y contenido optimizado',
            'Datos de rendimiento de sitios web',
            'Configuraciones y preferencias de herramientas'
          ]
        }
      ]
    },
    {
      id: 'como-usamos',
      title: 'Cómo Usamos tu Información',
      icon: <Settings className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Provisión de Servicios',
          items: [
            'Proporcionar y mantener nuestras herramientas SEO',
            'Procesar análisis y generar reportes',
            'Personalizar tu experiencia en la plataforma',
            'Ofrecer soporte técnico y atención al cliente'
          ]
        },
        {
          subtitle: 'Comunicación',
          items: [
            'Enviar actualizaciones sobre tu cuenta',
            'Notificar sobre nuevas funcionalidades',
            'Responder a consultas y solicitudes de soporte',
            'Enviar newsletters y contenido educativo (con tu consentimiento)'
          ]
        },
        {
          subtitle: 'Mejora del Servicio',
          items: [
            'Analizar patrones de uso para mejorar funcionalidades',
            'Desarrollar nuevas herramientas y características',
            'Realizar investigación y análisis de mercado',
            'Detectar y prevenir fraudes o uso indebido'
          ]
        }
      ]
    },
    {
      id: 'compartimos-informacion',
      title: 'Cuándo Compartimos tu Información',
      icon: <Users className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Proveedores de Servicios',
          items: [
            'Procesadores de pagos (Stripe, PayPal)',
            'Servicios de hosting y almacenamiento en la nube',
            'Herramientas de análisis y monitoreo',
            'Servicios de email y comunicación'
          ]
        },
        {
          subtitle: 'Requerimientos Legales',
          items: [
            'Cumplimiento de órdenes judiciales',
            'Investigaciones de autoridades competentes',
            'Protección de derechos y seguridad',
            'Cumplimiento de regulaciones aplicables'
          ]
        },
        {
          subtitle: 'Nunca Vendemos',
          items: [
            'No vendemos tu información personal a terceros',
            'No compartimos datos con fines publicitarios',
            'No utilizamos tu información para marketing de terceros',
            'Mantenemos el control total sobre tus datos'
          ]
        }
      ]
    },
    {
      id: 'cookies',
      title: 'Cookies y Tecnologías de Seguimiento',
      icon: <Cookie className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Tipos de Cookies',
          items: [
            'Cookies esenciales: Necesarias para el funcionamiento básico',
            'Cookies de rendimiento: Para analizar el uso de la plataforma',
            'Cookies de funcionalidad: Para recordar tus preferencias',
            'Cookies de análisis: Para mejorar nuestros servicios'
          ]
        },
        {
          subtitle: 'Control de Cookies',
          items: [
            'Puedes configurar tu navegador para rechazar cookies',
            'Ofrecemos un panel de control de cookies',
            'Puedes retirar tu consentimiento en cualquier momento',
            'Algunas funciones pueden verse limitadas sin cookies'
          ]
        }
      ]
    },
    {
      id: 'seguridad',
      title: 'Seguridad de los Datos',
      icon: <Lock className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Medidas de Protección',
          items: [
            'Encriptación SSL/TLS para todas las transmisiones',
            'Almacenamiento seguro en servidores protegidos',
            'Acceso restringido basado en roles y permisos',
            'Monitoreo continuo de seguridad y amenazas'
          ]
        },
        {
          subtitle: 'Mejores Prácticas',
          items: [
            'Auditorías regulares de seguridad',
            'Actualizaciones constantes de sistemas',
            'Capacitación del equipo en seguridad',
            'Planes de respuesta a incidentes'
          ]
        }
      ]
    },
    {
      id: 'tus-derechos',
      title: 'Tus Derechos',
      icon: <Eye className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Derechos de Acceso',
          items: [
            'Solicitar una copia de tu información personal',
            'Conocer cómo procesamos tus datos',
            'Obtener información sobre terceros que acceden a tus datos',
            'Recibir tus datos en formato portable'
          ]
        },
        {
          subtitle: 'Derechos de Control',
          items: [
            'Corregir información inexacta o incompleta',
            'Eliminar tu cuenta y datos asociados',
            'Restringir el procesamiento de tus datos',
            'Oponerte a ciertos usos de tu información'
          ]
        },
        {
          subtitle: 'Ejercer tus Derechos',
          items: [
            'Contacta a nuestro equipo de privacidad',
            'Utiliza las herramientas de tu cuenta',
            'Responderemos en un plazo máximo de 30 días',
            'No hay costo por ejercer estos derechos'
          ]
        }
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Descargar mis Datos',
      description: 'Obtén una copia de toda tu información personal',
      icon: <FileText className="h-6 w-6" />,
      action: 'Descargar'
    },
    {
      title: 'Eliminar mi Cuenta',
      description: 'Elimina permanentemente tu cuenta y todos los datos',
      icon: <AlertTriangle className="h-6 w-6" />,
      action: 'Eliminar'
    },
    {
      title: 'Configurar Cookies',
      description: 'Gestiona tus preferencias de cookies y seguimiento',
      icon: <Cookie className="h-6 w-6" />,
      action: 'Configurar'
    },
    {
      title: 'Contactar Privacidad',
      description: 'Habla con nuestro equipo de protección de datos',
      icon: <Mail className="h-6 w-6" />,
      action: 'Contactar'
    }
  ];

  return (
    <>
      <SEOHead
        title="Política de Privacidad - YA Tools"
        description="Política de privacidad de YA Tools. Conoce cómo protegemos tu información personal y respetamos tu privacidad en nuestra plataforma SEO."
        keywords="política de privacidad, protección de datos, GDPR, privacidad, YA Tools, datos personales, cookies, seguridad"
        canonicalUrl="https://yatools.com/privacidad"
        ogTitle="Política de Privacidad - YA Tools"
        ogDescription="Política de privacidad de YA Tools. Conoce cómo protegemos tu información personal y respetamos tu privacidad en nuestra plataforma SEO."
        ogImage="https://yatools.com/images/og-privacy.jpg"
        ogUrl="https://yatools.com/privacidad"
        twitterTitle="Política de Privacidad - YA Tools"
        twitterDescription="Política de privacidad de YA Tools. Conoce cómo protegemos tu información personal y respetamos tu privacidad en nuestra plataforma SEO."
        twitterImage="https://yatools.com/images/twitter-privacy.jpg"
        robots="index, follow"
      />
      <SchemaMarkup customSchema={privacySchema} />
      
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
              <Shield className="mr-2 h-4 w-4" />
              Política de Privacidad
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-tech-blue via-seo-teal to-ai-purple bg-clip-text text-transparent mb-6">
              Tu Privacidad es Nuestra Prioridad
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              En YA Tools, nos comprometemos a proteger tu información personal y ser transparentes 
              sobre cómo recopilamos, usamos y protegemos tus datos.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <span>Última actualización: 15 de Enero, 2025</span>
              <span>•</span>
              <span>Versión 2.1</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold mb-4">Acciones Rápidas</h2>
            <p className="text-muted-foreground">
              Gestiona tu privacidad y datos de forma sencilla
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-tech-blue mb-4 flex justify-center">
                    {action.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                  <Button variant="outline" size="sm">
                    {action.action}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {sections.map((section, sectionIndex) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              >
                <Card className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="text-tech-blue">
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                  </div>

                  <div className="space-y-6">
                    {section.content.map((subsection, index) => (
                      <div key={index}>
                        <h3 className="text-lg font-semibold mb-3 text-seo-teal">
                          {subsection.subtitle}
                        </h3>
                        <ul className="space-y-2">
                          {subsection.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start space-x-3">
                              <CheckCircle className="h-5 w-5 text-success-green mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* International Compliance */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8">
              <div className="text-center mb-8">
                <Globe className="h-12 w-12 text-tech-blue mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Cumplimiento Internacional</h2>
                <p className="text-muted-foreground">
                  Cumplimos con las principales regulaciones de privacidad a nivel mundial
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Badge variant="outline" className="mb-3">
                    GDPR
                  </Badge>
                  <h3 className="font-semibold mb-2">Unión Europea</h3>
                  <p className="text-sm text-muted-foreground">
                    Reglamento General de Protección de Datos
                  </p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="mb-3">
                    CCPA
                  </Badge>
                  <h3 className="font-semibold mb-2">California</h3>
                  <p className="text-sm text-muted-foreground">
                    Ley de Privacidad del Consumidor de California
                  </p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="mb-3">
                    LGPD
                  </Badge>
                  <h3 className="font-semibold mb-2">Brasil</h3>
                  <p className="text-sm text-muted-foreground">
                    Lei Geral de Proteção de Dados
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-6">
              ¿Tienes Preguntas sobre Privacidad?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Nuestro equipo de protección de datos está aquí para ayudarte. 
              No dudes en contactarnos si tienes alguna pregunta o inquietud.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contacto">
                  <Mail className="mr-2 h-5 w-5" />
                  Contactar Equipo de Privacidad
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/faq">
                  <FileText className="mr-2 h-5 w-5" />
                  Ver FAQ de Privacidad
                </Link>
              </Button>
            </div>
            <div className="mt-8 text-sm text-muted-foreground">
              <p>Email directo: <strong>privacidad@yatools.com</strong></p>
              <p>Tiempo de respuesta: Máximo 72 horas</p>
            </div>
          </motion.div>
        </div>
      </section>
      </div>
    </>
  );
}