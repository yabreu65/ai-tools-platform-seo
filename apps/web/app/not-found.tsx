'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Home, ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const NotFoundPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const popularTools = [
    { name: 'Generador de Sitemap', href: '/generador-sitemap' },
    { name: 'Generador de Robots.txt', href: '/generador-robots' },
    { name: 'Analizador de SEO', href: '/analizador-seo' },
    { name: 'Optimizador de Imágenes', href: '/optimizador-imagenes' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-9xl font-bold text-muted-foreground/20 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-primary/10 p-8">
              <Compass className="h-24 w-24 text-primary animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Página no encontrada
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            La página que buscas no existe o ha sido movida a otra ubicación.
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar herramientas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
        </div>

        {/* Popular Tools */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Herramientas populares
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            {popularTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-sm"
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="flex items-center gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Ir al inicio
            </Link>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver atrás
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p>¿Necesitas ayuda? Contacta nuestro soporte:</p>
          <div className="flex justify-center gap-4">
            <a
              href="mailto:support@yatools.com"
              className="text-primary hover:underline"
            >
              support@yatools.com
            </a>
            <span>•</span>
            <a
              href="/contacto"
              className="text-primary hover:underline"
            >
              Formulario de contacto
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;