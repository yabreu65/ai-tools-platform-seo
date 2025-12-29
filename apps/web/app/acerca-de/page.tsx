'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Target, 
  Zap, 
  Award, 
  TrendingUp, 
  Globe, 
  Heart,
  Lightbulb,
  Shield,
  Rocket
} from 'lucide-react';
import Link from 'next/link';

export default function AcercaDePage() {
  const teamMembers = [
    {
      name: "Ana García",
      role: "CEO & Fundadora",
      description: "Experta en SEO con más de 10 años de experiencia ayudando a empresas a crecer online.",
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20business%20woman%20CEO%20portrait%20headshot%20confident%20smile%20modern%20office%20background&image_size=square"
    },
    {
      name: "Carlos Rodríguez",
      role: "CTO",
      description: "Ingeniero de software especializado en IA y machine learning aplicado al marketing digital.",
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20male%20software%20engineer%20CTO%20portrait%20headshot%20tech%20background%20confident&image_size=square"
    },
    {
      name: "María López",
      role: "Head of Product",
      description: "Diseñadora UX/UI con pasión por crear herramientas que simplifican el trabajo de los marketers.",
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20female%20UX%20designer%20portrait%20headshot%20creative%20workspace%20friendly%20smile&image_size=square"
    }
  ];

  const values = [
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Innovación",
      description: "Desarrollamos constantemente nuevas herramientas y funcionalidades para mantenerte a la vanguardia del SEO."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Confiabilidad",
      description: "Nuestras herramientas son precisas, seguras y están respaldadas por algoritmos probados en el mercado."
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Pasión",
      description: "Amamos lo que hacemos y nos dedicamos a ayudar a nuestros usuarios a alcanzar sus objetivos digitales."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Comunidad",
      description: "Creemos en el poder de la comunidad y en compartir conocimiento para el crecimiento mutuo."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Usuarios Activos" },
    { number: "1M+", label: "Análisis Realizados" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Soporte" }
  ];

  const technologies = [
    "Inteligencia Artificial",
    "Machine Learning",
    "Natural Language Processing",
    "Big Data Analytics",
    "Cloud Computing",
    "API REST"
  ];

  return (
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
              Sobre YA Tools
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-tech-blue via-seo-teal to-ai-purple bg-clip-text text-transparent mb-6">
              Revolucionando el SEO con IA
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Somos una plataforma de herramientas SEO potenciadas por inteligencia artificial, 
              diseñada para ayudar a profesionales del marketing digital y propietarios de sitios web 
              a optimizar su presencia online de manera eficiente y efectiva.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/contacto">
                  <Users className="mr-2 h-5 w-5" />
                  Conoce al Equipo
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/precios">
                  <Rocket className="mr-2 h-5 w-5" />
                  Ver Planes
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-tech-blue mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4">
                <Target className="mr-2 h-4 w-4" />
                Nuestra Misión
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Democratizar el acceso a herramientas SEO profesionales
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Creemos que todas las empresas, independientemente de su tamaño, merecen tener acceso 
                a herramientas SEO de calidad profesional. Por eso desarrollamos YA Tools: una plataforma 
                que combina la potencia de la inteligencia artificial con la simplicidad de uso.
              </p>
              <p className="text-lg text-muted-foreground">
                Nuestro objetivo es eliminar las barreras técnicas y económicas que impiden a las 
                empresas optimizar su presencia digital, proporcionando herramientas precisas, 
                fáciles de usar y accesibles para todos.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <Card className="p-8 bg-gradient-to-br from-tech-blue/10 via-seo-teal/10 to-ai-purple/10">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <Zap className="h-12 w-12 text-tech-blue mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Velocidad</h3>
                    <p className="text-sm text-muted-foreground">
                      Análisis instantáneos con IA
                    </p>
                  </div>
                  <div className="text-center">
                    <Award className="h-12 w-12 text-seo-teal mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Precisión</h3>
                    <p className="text-sm text-muted-foreground">
                      Resultados confiables y exactos
                    </p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-ai-purple mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Crecimiento</h3>
                    <p className="text-sm text-muted-foreground">
                      Mejora continua de tu SEO
                    </p>
                  </div>
                  <div className="text-center">
                    <Globe className="h-12 w-12 text-success-green mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Global</h3>
                    <p className="text-sm text-muted-foreground">
                      Optimización para mercados internacionales
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              Nuestros Valores
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Los principios que nos guían
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Estos valores fundamentales definen quiénes somos y cómo trabajamos cada día 
              para ofrecer la mejor experiencia a nuestros usuarios.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full text-center hover:shadow-lg transition-shadow">
                  <div className="text-tech-blue mb-4 flex justify-center">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              <Users className="mr-2 h-4 w-4" />
              Nuestro Equipo
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Las mentes detrás de YA Tools
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Un equipo apasionado de expertos en SEO, desarrollo y diseño, 
              comprometidos con crear las mejores herramientas para tu éxito digital.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <Badge variant="outline" className="mb-4">
                    {member.role}
                  </Badge>
                  <p className="text-muted-foreground">{member.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              <Zap className="mr-2 h-4 w-4" />
              Tecnología
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Potenciado por tecnología de vanguardia
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Utilizamos las últimas tecnologías en inteligencia artificial y análisis de datos 
              para ofrecerte herramientas SEO precisas y eficientes.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Badge variant="secondary" className="text-sm py-2 px-4">
                  {tech}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Listo para optimizar tu SEO?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Únete a miles de profesionales que ya confían en YA Tools para 
              mejorar su presencia digital. Comienza gratis hoy mismo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/">
                  <Rocket className="mr-2 h-5 w-5" />
                  Comenzar Gratis
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contacto">
                  <Users className="mr-2 h-5 w-5" />
                  Contactar Ventas
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}