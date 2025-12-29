'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Image, 
  BarChart3, 
  Globe, 
  CheckCircle,
  Twitter, 
  Linkedin, 
  Github, 
  Youtube,
  Heart,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const footerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

const socialVariants = {
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: { duration: 0.2 }
  }
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const toolsLinks = [
    { name: 'Optimizador de Contenido', href: '/optimizador-contenido', icon: FileText },
    { name: 'Generador de Títulos SEO', href: '/generar-titulo-seo', icon: Search },
    { name: 'Renombrador de Imágenes', href: '/renombrador-images', icon: Image },
    { name: 'Auditor SEO', href: '/seo-auditor-tool', icon: BarChart3 },
    { name: 'Generador de Sitemap', href: '/generador-sitemap', icon: Globe },
    { name: 'Detector de Contenido Duplicado', href: '/detector-contenido-duplicado', icon: CheckCircle },
  ];

  const companyLinks = [
    { name: 'Acerca de', href: '/acerca-de' },
    { name: 'Contacto', href: '/contacto' },
    { name: 'Blog', href: '/blog' },
    { name: 'Precios', href: '/precios' },
    { name: 'Testimonios', href: '/testimonios' },
  ];

  const legalLinks = [
    { name: 'Política de Privacidad', href: '/privacidad' },
    { name: 'Términos de Servicio', href: '/terminos' },
    { name: 'Política de Cookies', href: '/cookies' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Soporte', href: '/soporte' },
  ];

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/yatools', icon: Twitter },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/yatools', icon: Linkedin },
    { name: 'GitHub', href: 'https://github.com/yatools', icon: Github },
    { name: 'YouTube', href: 'https://youtube.com/@yatools', icon: Youtube },
  ];

  return (
    <motion.footer
      className="bg-background border-t border-border/40 mt-auto"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1 - About YA Tools */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-tech-blue to-seo-teal rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground">YA Tools</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Plataforma de herramientas SEO potenciadas por IA para optimizar tu presencia digital y mejorar el posicionamiento de tu sitio web.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>contacto@yatools.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+54 11 1234-5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Buenos Aires, Argentina</span>
              </div>
            </div>
          </motion.div>

          {/* Column 2 - Tools */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Herramientas SEO</h4>
            <ul className="space-y-3">
              {toolsLinks.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <li key={tool.name}>
                    <Link 
                      href={tool.href}
                      className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-tech-blue transition-colors duration-200 group"
                    >
                      <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>{tool.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* Column 3 - Company */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Empresa</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-seo-teal transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4 - Legal */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Legal y Soporte</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-ai-purple transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Social Media Section */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-border/40"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold text-foreground mb-2">Síguenos</h4>
              <p className="text-sm text-muted-foreground">
                Mantente actualizado con las últimas herramientas y consejos SEO
              </p>
            </div>
            
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-muted hover:bg-tech-blue/10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-tech-blue transition-all duration-200"
                    variants={socialVariants}
                    whileHover="hover"
                    aria-label={social.name}
                  >
                    <IconComponent className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-muted/30 border-t border-border/40"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>&copy; {currentYear} YA Tools. Todos los derechos reservados.</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center space-x-1">
                <span>Hecho con</span>
                <Heart className="w-4 h-4 text-error-red fill-current animate-pulse" />
                <span>en Argentina</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                href="/privacidad" 
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Privacidad
              </Link>
              <Link 
                href="/terminos" 
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Términos
              </Link>
              <Link 
                href="/cookies" 
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.footer>
  );
}