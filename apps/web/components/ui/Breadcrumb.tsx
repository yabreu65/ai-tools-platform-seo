'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { motion } from 'framer-motion';

interface BreadcrumbProps {
  className?: string;
  showHome?: boolean;
  maxItems?: number;
  separator?: React.ReactNode;
}

export function Breadcrumb({ 
  className = '', 
  showHome = true, 
  maxItems = 5,
  separator = <ChevronRight className="w-4 h-4 text-gray-400" />
}: BreadcrumbProps) {
  const { breadcrumbs } = useBreadcrumb();

  if (!breadcrumbs.length) return null;

  // Limitar el número de elementos mostrados
  const displayBreadcrumbs = breadcrumbs.length > maxItems 
    ? [
        breadcrumbs[0], // Siempre mostrar el inicio
        { label: '...', href: '', icon: null, isActive: false },
        ...breadcrumbs.slice(-maxItems + 2) // Mostrar los últimos elementos
      ]
    : breadcrumbs;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-1 text-sm ${className}`}
      role="navigation"
    >
      <ol className="flex items-center space-x-1 list-none">
        {displayBreadcrumbs.map((item, index) => {
          const isLast = index === displayBreadcrumbs.length - 1;
          const isEllipsis = item.label === '...';

          return (
            <motion.li
              key={`${item.href}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center"
            >
              {index > 0 && (
                <span className="mx-2 flex-shrink-0" aria-hidden="true">
                  {separator}
                </span>
              )}
              
              {isEllipsis ? (
                <span className="text-gray-500 px-2">...</span>
              ) : isLast ? (
                <span
                  className="flex items-center space-x-1 text-gray-900 dark:text-gray-100 font-medium"
                  aria-current="page"
                >
                  {item.icon && (
                    <span className="flex-shrink-0" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-1 py-0.5"
                  aria-label={`Ir a ${item.label}`}
                >
                  {item.icon && (
                    <span className="flex-shrink-0" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="hover:underline">{item.label}</span>
                </Link>
              )}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
}

// Componente compacto para espacios reducidos
export function BreadcrumbCompact({ className = '' }: { className?: string }) {
  const { breadcrumbs } = useBreadcrumb();

  if (!breadcrumbs.length || breadcrumbs.length < 2) return null;

  const currentPage = breadcrumbs[breadcrumbs.length - 1];
  const parentPage = breadcrumbs[breadcrumbs.length - 2];

  return (
    <nav 
      aria-label="Breadcrumb compacto" 
      className={`flex items-center space-x-2 text-sm ${className}`}
    >
      <Link
        href={parentPage.href}
        className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
        aria-label={`Volver a ${parentPage.label}`}
      >
        {parentPage.icon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {parentPage.icon}
          </span>
        )}
        <span className="hover:underline">{parentPage.label}</span>
      </Link>
      
      <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
      
      <span className="flex items-center space-x-1 text-gray-900 dark:text-gray-100 font-medium">
        {currentPage.icon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {currentPage.icon}
          </span>
        )}
        <span>{currentPage.label}</span>
      </span>
    </nav>
  );
}

// Breadcrumb con estilo de tarjeta
export function BreadcrumbCard({ className = '' }: { className?: string }) {
  const { breadcrumbs } = useBreadcrumb();

  if (!breadcrumbs.length) return null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <Breadcrumb />
    </div>
  );
}

// Hook para usar breadcrumbs en componentes
export function useBreadcrumbNavigation() {
  const { breadcrumbs } = useBreadcrumb();

  const goBack = () => {
    if (breadcrumbs.length > 1) {
      const previousPage = breadcrumbs[breadcrumbs.length - 2];
      window.location.href = previousPage.href;
    }
  };

  const goHome = () => {
    window.location.href = '/';
  };

  const canGoBack = breadcrumbs.length > 1;
  const currentPage = breadcrumbs[breadcrumbs.length - 1];

  return {
    goBack,
    goHome,
    canGoBack,
    currentPage,
    breadcrumbs
  };
}