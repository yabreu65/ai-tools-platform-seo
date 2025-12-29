'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X, ExternalLink, ChevronRight, Lightbulb, BookOpen } from 'lucide-react';
import { useTooltip } from '@/contexts/TooltipContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ContextualTooltipProps {
  id: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  trigger?: 'hover' | 'click' | 'focus';
  className?: string;
  showIcon?: boolean;
  iconPosition?: 'before' | 'after';
}

export function ContextualTooltip({
  id,
  children,
  position = 'auto',
  trigger = 'hover',
  className = '',
  showIcon = true,
  iconPosition = 'after'
}: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { tooltipContent, userLevel } = useTooltip();

  const content = tooltipContent[id];

  // Calcular posición automática
  useEffect(() => {
    if (position === 'auto' && isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newPosition = 'bottom';

      // Verificar espacio disponible
      const spaceTop = triggerRect.top;
      const spaceBottom = viewportHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewportWidth - triggerRect.right;

      if (spaceBottom < 200 && spaceTop > spaceBottom) {
        newPosition = 'top';
      } else if (spaceRight < 300 && spaceLeft > spaceRight) {
        newPosition = 'left';
      } else if (spaceLeft < 300 && spaceRight > spaceLeft) {
        newPosition = 'right';
      }

      setTooltipPosition(newPosition as any);
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') {
      setIsVisible(true);
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus') {
      setIsVisible(false);
    }
  };

  if (!content) return <>{children}</>;

  // Filtrar contenido basado en el nivel del usuario
  const shouldShowAdvancedContent = userLevel === 'advanced' || userLevel === 'intermediate';
  const shouldShowBeginnerContent = userLevel === 'beginner' || userLevel === 'intermediate';

  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50';
    switch (tooltipPosition) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
    }
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-3 h-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transform rotate-45';
    switch (tooltipPosition) {
      case 'top':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      case 'bottom':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2`;
      case 'left':
        return `${baseClasses} left-full top-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseClasses} right-full top-1/2 transform translate-x-1/2 -translate-y-1/2`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2`;
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        ref={triggerRef}
        className="flex items-center space-x-1 cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={trigger === 'focus' ? 0 : -1}
      >
        {showIcon && iconPosition === 'before' && (
          <HelpCircle className="w-4 h-4 text-blue-500 hover:text-blue-600 transition-colors duration-200" />
        )}
        {children}
        {showIcon && iconPosition === 'after' && (
          <HelpCircle className="w-4 h-4 text-blue-500 hover:text-blue-600 transition-colors duration-200" />
        )}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className={getPositionClasses()}
            style={{ maxWidth: '400px', minWidth: '300px' }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 relative">
              <div className={getArrowClasses()}></div>
              
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {content.title}
                  </h3>
                </div>
                {trigger === 'click' && (
                  <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Cerrar ayuda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {content.description}
              </p>

              {/* Steps */}
              {content.steps && shouldShowBeginnerContent && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-1" />
                    Pasos a seguir:
                  </h4>
                  <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {content.steps.slice(0, userLevel === 'beginner' ? 4 : content.steps.length).map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium mr-2 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Tips */}
              {content.tips && shouldShowAdvancedContent && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-1 text-yellow-500" />
                    Consejos útiles:
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {content.tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Links */}
              {content.relatedLinks && content.relatedLinks.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Enlaces relacionados:
                  </h4>
                  <div className="space-y-1">
                    {content.relatedLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target={link.url.startsWith('http') ? '_blank' : '_self'}
                        rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                      >
                        <span>{link.label}</span>
                        {link.url.startsWith('http') && (
                          <ExternalLink className="w-3 h-3 ml-1" />
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Level indicator */}
              {content.level && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Nivel: {content.level === 'beginner' ? 'Principiante' : content.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}</span>
                    <span>{content.category}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Componente simplificado para tooltips rápidos
export function QuickTooltip({ 
  content, 
  children, 
  position = 'top' 
}: { 
  content: string; 
  children: React.ReactNode; 
  position?: 'top' | 'bottom' | 'left' | 'right' 
}) {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg whitespace-nowrap';
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-1`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-1`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-1`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-1`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-1`;
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={getPositionClasses()}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}