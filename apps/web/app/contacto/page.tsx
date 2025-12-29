'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Users,
  Headphones,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import SEOHead from '@/components/seo/SEOHead';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

interface FormData {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  subject?: string;
  message?: string;
}

export default function ContactoPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      value: "hola@yatools.com",
      description: "Respuesta en menos de 24 horas"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Teléfono",
      value: "+54 11 4567-8900",
      description: "Lunes a Viernes, 9:00 - 18:00"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Oficina",
      value: "Buenos Aires, Argentina",
      description: "Palermo, CABA"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Horarios",
      value: "Lun - Vie: 9:00 - 18:00",
      description: "Sáb: 10:00 - 14:00"
    }
  ];

  const supportOptions = [
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Chat en Vivo",
      description: "Habla con nuestro equipo de soporte en tiempo real",
      action: "Iniciar Chat",
      available: true
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Consulta de Ventas",
      description: "¿Necesitas ayuda eligiendo el plan perfecto?",
      action: "Contactar Ventas",
      available: true
    },
    {
      icon: <Headphones className="h-8 w-8" />,
      title: "Soporte Técnico",
      description: "Ayuda con problemas técnicos y configuración",
      action: "Obtener Ayuda",
      available: true
    }
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simular envío del formulario
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la lógica real de envío
      console.log('Formulario enviado:', formData);
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <>
      <SEOHead
        title="Contacto - YA Tools | Soporte y Atención al Cliente"
        description="¿Necesitas ayuda? Contacta con nuestro equipo de soporte de YA Tools. Chat en vivo, email, teléfono. Respuesta en menos de 24 horas. ¡Estamos aquí para ayudarte!"
        keywords="contacto YA Tools, soporte SEO, ayuda herramientas SEO, atención al cliente, chat en vivo, soporte técnico"
        canonical="https://yatools.com/contacto"
        type="website"
      />
      
      <SchemaMarkup 
        customSchema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "YA Tools",
          "url": "https://yatools.com",
          "contactPoint": [
            {
              "@type": "ContactPoint",
              "telephone": "+54-11-4567-8900",
              "contactType": "customer service",
              "email": "hola@yatools.com",
              "availableLanguage": ["Spanish", "English"],
              "hoursAvailable": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "09:00",
                "closes": "18:00"
              }
            },
            {
              "@type": "ContactPoint",
              "contactType": "sales",
              "email": "ventas@yatools.com",
              "availableLanguage": ["Spanish", "English"]
            },
            {
              "@type": "ContactPoint",
              "contactType": "technical support",
              "email": "soporte@yatools.com",
              "availableLanguage": ["Spanish", "English"]
            }
          ],
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Buenos Aires",
            "addressRegion": "CABA",
            "addressCountry": "AR"
          }
        }}
        breadcrumb={{
          items: [
            {
              name: "Inicio",
              url: "https://yatools.com"
            },
            {
              name: "Contacto",
              url: "https://yatools.com/contacto"
            }
          ]
        }}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Badge variant="secondary" className="mb-4">
                <Mail className="mr-2 h-4 w-4" />
                Contacto
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-tech-blue via-seo-teal to-ai-purple bg-clip-text text-transparent mb-6">
                ¿Cómo podemos ayudarte?
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Estamos aquí para responder tus preguntas, ayudarte con tu cuenta 
                o simplemente escuchar tus sugerencias. Contáctanos de la forma que prefieras.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="text-tech-blue mb-4 flex justify-center">
                      {info.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{info.title}</h3>
                    <p className="text-lg font-medium mb-1">{info.value}</p>
                    <p className="text-sm text-muted-foreground">{info.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Contact Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Envíanos un mensaje</h2>
                    <p className="text-muted-foreground">
                      Completa el formulario y nos pondremos en contacto contigo lo antes posible.
                    </p>
                  </div>

                  {submitStatus === 'success' && (
                    <Alert className="mb-6 border-success-green/20 bg-success-green/10">
                      <CheckCircle className="h-4 w-4 text-success-green" />
                      <AlertDescription className="text-success-green">
                        ¡Mensaje enviado exitosamente! Te responderemos pronto.
                      </AlertDescription>
                    </Alert>
                  )}

                  {submitStatus === 'error' && (
                    <Alert className="mb-6 border-error-red/20 bg-error-red/10">
                      <AlertCircle className="h-4 w-4 text-error-red" />
                      <AlertDescription className="text-error-red">
                        Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Tu nombre completo"
                          className={errors.name ? 'border-error-red' : ''}
                        />
                        {errors.name && (
                          <p className="text-sm text-error-red mt-1">{errors.name}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="tu@email.com"
                          className={errors.email ? 'border-error-red' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-error-red mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="company">Empresa (opcional)</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Nombre de tu empresa"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Asunto *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="¿En qué podemos ayudarte?"
                        className={errors.subject ? 'border-error-red' : ''}
                      />
                      {errors.subject && (
                        <p className="text-sm text-error-red mt-1">{errors.subject}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="message">Mensaje *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Cuéntanos más detalles sobre tu consulta..."
                        rows={5}
                        className={errors.message ? 'border-error-red' : ''}
                      />
                      {errors.message && (
                        <p className="text-sm text-error-red mt-1">{errors.message}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar Mensaje
                        </>
                      )}
                    </Button>
                  </form>
                </Card>
              </motion.div>

              {/* Support Options */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-4">Otras formas de contacto</h2>
                  <p className="text-muted-foreground mb-8">
                    Elige la opción que mejor se adapte a tu necesidad. Estamos aquí para ayudarte.
                  </p>
                </div>

                {supportOptions.map((option, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="text-tech-blue">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{option.title}</h3>
                        <p className="text-muted-foreground mb-4">{option.description}</p>
                        <Button variant="outline" size="sm">
                          {option.action}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* FAQ Link */}
                <Card className="p-6 bg-gradient-to-br from-tech-blue/10 via-seo-teal/10 to-ai-purple/10">
                  <div className="text-center">
                    <Globe className="h-12 w-12 text-tech-blue mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">¿Buscas respuestas rápidas?</h3>
                    <p className="text-muted-foreground mb-4">
                      Consulta nuestras preguntas frecuentes para encontrar respuestas inmediatas.
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/faq">
                        Ver FAQ
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section (Placeholder) */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 text-center">
                <MapPin className="h-16 w-16 text-tech-blue mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Nuestra Ubicación</h3>
                <p className="text-lg text-muted-foreground mb-4">
                  Buenos Aires, Argentina
                </p>
                <p className="text-muted-foreground">
                  Estamos ubicados en el corazón de Palermo, una de las zonas más vibrantes 
                  de la ciudad. ¡Ven a visitarnos!
                </p>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}