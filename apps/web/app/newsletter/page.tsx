'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  CheckCircle, 
  Star, 
  Users, 
  Calendar,
  TrendingUp,
  Bell,
  Settings,
  Eye,
  Clock,
  Award,
  Zap,
  Shield,
  Gift,
  ArrowRight,
  X
} from 'lucide-react';
import { useNewsletter } from '@/contexts/NewsletterContext';
import Image from 'next/image';

export default function NewsletterPage() {
  const {
    loading,
    error,
    subscribe,
    updatePreferences,
    getRecentCampaigns,
    getSubscriberStats,
    getEngagementMetrics
  } = useNewsletter();

  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState({
    seoTips: true,
    productUpdates: true,
    caseStudies: true,
    industryNews: false,
    weeklyDigest: true
  });
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [subscribed, setSubscribed] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      const success = await subscribe(email, preferences, frequency);
      if (success) {
        setSubscribed(true);
        setEmail('');
      }
    }
  };

  const handleUpdatePreferences = async () => {
    if (email.trim()) {
      await updatePreferences(email, preferences, frequency);
      setShowPreferences(false);
    }
  };

  const recentCampaigns = getRecentCampaigns(3);
  const stats = getSubscriberStats();
  const metrics = getEngagementMetrics();

  const benefits = [
    {
      icon: Zap,
      title: 'Tips SEO Exclusivos',
      description: 'Estrategias avanzadas que no encontrarás en ningún otro lugar'
    },
    {
      icon: TrendingUp,
      title: 'Casos de Éxito',
      description: 'Historias reales de empresas que han mejorado su SEO'
    },
    {
      icon: Bell,
      title: 'Actualizaciones de Producto',
      description: 'Sé el primero en conocer nuevas herramientas y funciones'
    },
    {
      icon: Award,
      title: 'Contenido Premium',
      description: 'Guías detalladas y plantillas exclusivas para suscriptores'
    },
    {
      icon: Users,
      title: 'Comunidad Exclusiva',
      description: 'Acceso a nuestro grupo privado de expertos en SEO'
    },
    {
      icon: Gift,
      title: 'Ofertas Especiales',
      description: 'Descuentos y promociones exclusivas para suscriptores'
    }
  ];

  const testimonials = [
    {
      content: "El newsletter de YA Tools es mi lectura obligatoria cada semana. Los tips son súper prácticos y fáciles de implementar.",
      author: "María González",
      position: "SEO Manager",
      company: "TechCorp",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20woman%20marketing%20manager&image_size=square"
    },
    {
      content: "Gracias al newsletter he mejorado el SEO de mi sitio web en un 200%. El contenido es oro puro.",
      author: "Carlos Ruiz",
      position: "Founder",
      company: "StartupXYZ",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20man%20startup%20founder&image_size=square"
    },
    {
      content: "Los casos de estudio que comparten son increíbles. He aplicado varias estrategias con excelentes resultados.",
      author: "Ana Martín",
      position: "Digital Marketing",
      company: "AgencyPro",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20woman%20digital%20marketing&image_size=square"
    }
  ];

  if (subscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl p-8 text-center max-w-md mx-4"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Suscripción Exitosa!
          </h2>
          <p className="text-gray-600 mb-6">
            Te hemos enviado un email de confirmación. Revisa tu bandeja de entrada 
            y haz clic en el enlace para activar tu suscripción.
          </p>
          <button
            onClick={() => setSubscribed(false)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Entendido
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Newsletter SEO
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Únete a más de <strong>{stats.totalSubscribers.toLocaleString()}</strong> profesionales 
              que reciben tips exclusivos de SEO, casos de éxito y actualizaciones de producto.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.totalSubscribers.toLocaleString()}+
                </div>
                <div className="text-sm text-gray-600">Suscriptores</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {metrics.averageOpenRate}%
                </div>
                <div className="text-sm text-gray-600">Tasa de apertura</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {metrics.averageClickRate}%
                </div>
                <div className="text-sm text-gray-600">Tasa de clics</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-8 mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Suscríbete Gratis
            </h2>
            <p className="text-gray-600">
              Recibe contenido exclusivo directamente en tu bandeja de entrada
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            <div className="flex gap-2 mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Suscribirse'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowPreferences(!showPreferences)}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Personalizar preferencias
              </button>
            </div>

            {/* Preferences Panel */}
            {showPreferences && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 p-4 bg-gray-50 rounded-lg"
              >
                <h4 className="font-medium text-gray-900 mb-4">
                  Personaliza tu suscripción
                </h4>
                
                {/* Content Preferences */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Contenido que te interesa:
                  </h5>
                  <div className="space-y-2">
                    {Object.entries({
                      seoTips: 'Tips y estrategias SEO',
                      productUpdates: 'Actualizaciones de producto',
                      caseStudies: 'Casos de estudio',
                      industryNews: 'Noticias de la industria',
                      weeklyDigest: 'Resumen semanal'
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={preferences[key as keyof typeof preferences]}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Frecuencia:
                  </h5>
                  <div className="flex gap-4">
                    {[
                      { value: 'daily', label: 'Diario' },
                      { value: 'weekly', label: 'Semanal' },
                      { value: 'monthly', label: 'Mensual' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="frequency"
                          value={option.value}
                          checked={frequency === option.value}
                          onChange={(e) => setFrequency(e.target.value as any)}
                          className="border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <p className="text-xs text-gray-500 text-center mt-4">
              Al suscribirte, aceptas recibir emails de YA Tools. 
              Puedes cancelar tu suscripción en cualquier momento.
            </p>
          </form>
        </motion.div>

        {/* Benefits */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué suscribirse?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nuestro newsletter te ayudará a mantenerte al día con las últimas 
              tendencias y estrategias de SEO.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Recent Campaigns */}
        {recentCampaigns.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Últimas Ediciones
              </h2>
              <p className="text-gray-600">
                Echa un vistazo a nuestro contenido reciente
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {new Intl.DateTimeFormat('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }).format(campaign.sentAt)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {campaign.subject}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {campaign.preview}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {campaign.openRate}%
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {campaign.clickRate}%
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                        Ver más
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Testimonials */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros suscriptores
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.position} en {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 text-center"
        >
          <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Tu privacidad es importante
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Nunca compartimos tu información con terceros. Puedes cancelar tu suscripción 
            en cualquier momento con un solo clic. Sin spam, solo contenido valioso.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Sin spam</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Fácil cancelación</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Datos seguros</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Contenido de calidad</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}