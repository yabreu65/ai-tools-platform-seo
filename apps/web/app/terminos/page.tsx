'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/seo/SEOHead';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import { 
  FileText, 
  Scale, 
  AlertTriangle, 
  Shield,
  Users,
  CreditCard,
  Ban,
  RefreshCw,
  Globe,
  Mail,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

export default function TerminosPage() {
  // SEO Schema for Terms of Service
  const termsSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://yatools.com/terminos",
        "url": "https://yatools.com/terminos",
        "name": "Términos y Condiciones - YA Tools",
        "description": "Términos y condiciones de uso de YA Tools. Conoce las reglas y regulaciones para usar nuestra plataforma de herramientas SEO con IA.",
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
            "name": "Términos y Condiciones",
            "item": "https://yatools.com/terminos"
          }
        ]
      }
    ]
  };

  const sections = [
    {
      id: 'aceptacion',
      title: 'Aceptación de los Términos',
      icon: <CheckCircle className="h-6 w-6" />,
      content: [
        'Al acceder y utilizar YA Tools, aceptas estar sujeto a estos Términos y Condiciones.',
        'Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestros servicios.',
        'Estos términos se aplican a todos los visitantes, usuarios y otras personas que accedan o usen el servicio.',
        'Al crear una cuenta, confirmas que tienes al menos 18 años o que tienes el consentimiento de tus padres o tutores.'
      ]
    },
    {
      id: 'descripcion-servicio',
      title: 'Descripción del Servicio',
      icon: <Globe className="h-6 w-6" />,
      content: [
        'YA Tools es una plataforma de herramientas SEO potenciadas por inteligencia artificial.',
        'Ofrecemos servicios de análisis, optimización y mejora de sitios web para motores de búsqueda.',
        'Nuestros servicios incluyen, pero no se limitan a: análisis de contenido, generación de títulos SEO, auditorías técnicas, y herramientas de palabras clave.',
        'Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del servicio en cualquier momento.'
      ]
    },
    {
      id: 'cuentas-usuario',
      title: 'Cuentas de Usuario',
      icon: <Users className="h-6 w-6" />,
      content: [
        'Debes proporcionar información precisa y completa al crear tu cuenta.',
        'Eres responsable de mantener la confidencialidad de tu contraseña y cuenta.',
        'Debes notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta.',
        'Una persona o entidad legal puede mantener solo una cuenta gratuita.',
        'Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos.'
      ]
    },
    {
      id: 'uso-aceptable',
      title: 'Política de Uso Aceptable',
      icon: <Shield className="h-6 w-6" />,
      content: [
        'No debes usar nuestros servicios para actividades ilegales o no autorizadas.',
        'Está prohibido intentar acceder a sistemas o datos no autorizados.',
        'No debes interferir con el funcionamiento normal de la plataforma.',
        'Está prohibido el uso de bots, scrapers o herramientas automatizadas sin autorización.',
        'No debes compartir contenido que sea ofensivo, difamatorio o que viole derechos de terceros.'
      ]
    },
    {
      id: 'planes-facturacion',
      title: 'Planes y Facturación',
      icon: <CreditCard className="h-6 w-6" />,
      content: [
        'Ofrecemos planes gratuitos y de pago con diferentes características y límites.',
        'Los pagos se procesan de forma segura a través de proveedores de pago certificados.',
        'Las suscripciones se renuevan automáticamente a menos que se cancelen.',
        'Los reembolsos se manejan según nuestra política de reembolsos específica.',
        'Los precios pueden cambiar con previo aviso de 30 días a los usuarios existentes.'
      ]
    },
    {
      id: 'propiedad-intelectual',
      title: 'Propiedad Intelectual',
      icon: <FileText className="h-6 w-6" />,
      content: [
        'YA Tools y todo su contenido son propiedad de nuestra empresa y están protegidos por derechos de autor.',
        'Te otorgamos una licencia limitada, no exclusiva y revocable para usar nuestros servicios.',
        'No puedes copiar, modificar, distribuir o crear trabajos derivados de nuestro contenido.',
        'Respetamos los derechos de propiedad intelectual de terceros y esperamos que nuestros usuarios hagan lo mismo.',
        'Cualquier contenido que subas o crees usando nuestros servicios sigue siendo de tu propiedad.'
      ]
    },
    {
      id: 'limitacion-responsabilidad',
      title: 'Limitación de Responsabilidad',
      icon: <AlertTriangle className="h-6 w-6" />,
      content: [
        'Nuestros servicios se proporcionan "tal como están" sin garantías de ningún tipo.',
        'No garantizamos que el servicio será ininterrumpido, seguro o libre de errores.',
        'No somos responsables por daños indirectos, incidentales o consecuentes.',
        'Nuestra responsabilidad total no excederá el monto pagado por los servicios en los últimos 12 meses.',
        'Algunas jurisdicciones no permiten la exclusión de ciertas garantías, por lo que algunas limitaciones pueden no aplicar.'
      ]
    },
    {
      id: 'terminacion',
      title: 'Terminación',
      icon: <Ban className="h-6 w-6" />,
      content: [
        'Puedes terminar tu cuenta en cualquier momento eliminándola desde la configuración.',
        'Podemos suspender o terminar tu cuenta si violas estos términos.',
        'Al terminar la cuenta, tu acceso a los servicios cesará inmediatamente.',
        'Podemos retener cierta información según lo requerido por la ley o para fines legítimos de negocio.',
        'Las disposiciones que por su naturaleza deben sobrevivir continuarán en vigor después de la terminación.'
      ]
    }
  ];

  const prohibitedUses = [
    'Actividades ilegales o fraudulentas',
    'Violación de derechos de propiedad intelectual',
    'Spam o comunicaciones no solicitadas',
    'Malware, virus o código malicioso',
    'Interferencia con la seguridad del servicio',
    'Uso excesivo que afecte el rendimiento',
    'Reventa no autorizada de servicios',
    'Suplantación de identidad'
  ];

  const userRights = [
    'Acceso a tu cuenta y datos',
    'Modificación de información personal',
    'Cancelación de suscripción en cualquier momento',
    'Exportación de tus datos',
    'Soporte técnico según tu plan',
    'Actualizaciones y mejoras del servicio'
  ];

  return (
    <>
      <SEOHead
        title="Términos y Condiciones - YA Tools"
        description="Términos y condiciones de uso de YA Tools. Conoce las reglas y regulaciones para usar nuestra plataforma de herramientas SEO con IA."
        keywords="términos y condiciones, términos de uso, YA Tools, política de uso, condiciones de servicio, SEO, herramientas IA"
        canonicalUrl="https://yatools.com/terminos"
        ogTitle="Términos y Condiciones - YA Tools"
        ogDescription="Términos y condiciones de uso de YA Tools. Conoce las reglas y regulaciones para usar nuestra plataforma de herramientas SEO con IA."
        ogImage="https://yatools.com/images/og-terms.jpg"
        ogUrl="https://yatools.com/terminos"
        twitterTitle="Términos y Condiciones - YA Tools"
        twitterDescription="Términos y condiciones de uso de YA Tools. Conoce las reglas y regulaciones para usar nuestra plataforma de herramientas SEO con IA."
        twitterImage="https://yatools.com/images/twitter-terms.jpg"
        robots="index, follow"
      />
      <SchemaMarkup customSchema={termsSchema} />
      
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
              <Scale className="mr-2 h-4 w-4" />
              Términos y Condiciones
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-tech-blue via-seo-teal to-ai-purple bg-clip-text text-transparent mb-6">
              Términos de Uso
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Estos términos establecen las reglas y regulaciones para el uso de YA Tools. 
              Al usar nuestros servicios, aceptas cumplir con estos términos.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <span>Última actualización: 15 de Enero, 2025</span>
              <span>•</span>
              <span>Versión 3.2</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8">
              <div className="text-center mb-8">
                <FileText className="h-12 w-12 text-tech-blue mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Resumen Ejecutivo</h2>
                <p className="text-muted-foreground">
                  Los puntos más importantes que debes conocer
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-success-green flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Tus Derechos
                  </h3>
                  <ul className="space-y-2">
                    {userRights.map((right, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-success-green mt-1 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{right}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-error-red flex items-center">
                    <XCircle className="mr-2 h-5 w-5" />
                    Usos Prohibidos
                  </h3>
                  <ul className="space-y-2">
                    {prohibitedUses.map((use, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <XCircle className="h-4 w-4 text-error-red mt-1 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{use}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Main Terms Sections */}
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

                  <div className="space-y-4">
                    {section.content.map((paragraph, index) => (
                      <p key={index} className="text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Information */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8">
              <div className="text-center mb-8">
                <Scale className="h-12 w-12 text-tech-blue mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Información Legal</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Jurisdicción</h3>
                  <p className="text-muted-foreground mb-4">
                    Estos términos se rigen por las leyes de Argentina. Cualquier disputa 
                    será resuelta en los tribunales competentes de Buenos Aires, Argentina.
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-4">Modificaciones</h3>
                  <p className="text-muted-foreground">
                    Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                    Los cambios entrarán en vigor inmediatamente después de su publicación.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Contacto Legal</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Email:</strong> legal@yatools.com</p>
                    <p><strong>Dirección:</strong> Buenos Aires, Argentina</p>
                    <p><strong>Teléfono:</strong> +54 11 4567-8900</p>
                  </div>

                  <h3 className="text-lg font-semibold mb-4 mt-6">Separabilidad</h3>
                  <p className="text-muted-foreground">
                    Si alguna disposición de estos términos es inválida, el resto 
                    permanecerá en pleno vigor y efecto.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Updates and Changes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8 bg-gradient-to-br from-tech-blue/10 via-seo-teal/10 to-ai-purple/10">
              <div className="text-center">
                <RefreshCw className="h-12 w-12 text-tech-blue mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Actualizaciones de Términos</h2>
                <p className="text-muted-foreground mb-6">
                  Te notificaremos sobre cambios importantes en estos términos por email 
                  y mediante avisos en la plataforma.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link href="/contacto">
                      <Mail className="mr-2 h-4 w-4" />
                      Contactar Legal
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/privacidad">
                      <Shield className="mr-2 h-4 w-4" />
                      Ver Política de Privacidad
                    </Link>
                  </Button>
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
              ¿Preguntas sobre los Términos?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Si tienes alguna pregunta sobre estos términos y condiciones, 
              no dudes en contactar a nuestro equipo legal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contacto">
                  <Mail className="mr-2 h-5 w-5" />
                  Contactar Equipo Legal
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/faq">
                  <FileText className="mr-2 h-5 w-5" />
                  Ver Preguntas Frecuentes
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