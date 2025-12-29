'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, reset }) => {
  useEffect(() => {
    // Log the error to the console
    console.error('Global error caught:', error);
    
    // Report error to monitoring service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    console.error('Error Report:', errorReport);
    
    // In a real app, send to error reporting service
    // Example: Sentry.captureException(error);
  }, [error]);

  const isNetworkError = error.message.includes('fetch') || 
                        error.message.includes('network') ||
                        error.message.includes('NetworkError');

  const isServerError = error.digest || 
                       error.message.includes('500') ||
                       error.message.includes('Internal Server Error');

  const getErrorTitle = () => {
    if (isNetworkError) return 'Error de conexión';
    if (isServerError) return 'Error del servidor';
    return 'Error inesperado';
  };

  const getErrorDescription = () => {
    if (isNetworkError) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    }
    if (isServerError) {
      return 'El servidor está experimentando problemas. Nuestro equipo ha sido notificado.';
    }
    return 'Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado automáticamente.';
  };

  const getErrorSuggestions = () => {
    if (isNetworkError) {
      return [
        'Verifica tu conexión a internet',
        'Intenta recargar la página',
        'Verifica si hay problemas con tu firewall o proxy',
        'Intenta acceder desde otra red'
      ];
    }
    if (isServerError) {
      return [
        'Intenta recargar la página en unos minutos',
        'Verifica el estado del servicio en nuestras redes sociales',
        'Contacta al soporte si el problema persiste',
        'Intenta acceder a otras secciones de la aplicación'
      ];
    }
    return [
      'Intenta recargar la página',
      'Limpia la caché de tu navegador',
      'Intenta en modo incógnito',
      'Contacta al soporte si el problema persiste'
    ];
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-8">
            <AlertTriangle className="h-20 w-20 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            {getErrorTitle()}
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            {getErrorDescription()}
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-muted/50 rounded-lg p-4 max-w-lg mx-auto">
            <summary className="cursor-pointer font-medium mb-2">
              Detalles técnicos (solo desarrollo)
            </summary>
            <div className="text-sm space-y-2">
              <div>
                <strong>Error:</strong> {error.message}
              </div>
              {error.digest && (
                <div>
                  <strong>Digest:</strong> {error.digest}
                </div>
              )}
              {error.stack && (
                <div>
                  <strong>Stack trace:</strong>
                  <pre className="text-xs mt-1 overflow-auto max-h-32 bg-background p-2 rounded whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Suggestions */}
        <div className="bg-muted/30 rounded-lg p-6 max-w-lg mx-auto text-left">
          <h3 className="font-semibold mb-3 text-center">Sugerencias para resolver el problema:</h3>
          <ul className="text-sm space-y-2 text-muted-foreground">
            {getErrorSuggestions().map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            size="lg"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Intentar de nuevo
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </Button>
        </div>

        {/* Support Options */}
        <div className="border-t pt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿El problema persiste? Nuestro equipo de soporte está aquí para ayudarte
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                const subject = 'Error Report - YA Tools';
                const body = `Error: ${error.message}\nURL: ${window.location.href}\nTimestamp: ${new Date().toISOString()}${error.digest ? `\nDigest: ${error.digest}` : ''}`;
                window.location.href = `mailto:support@yatools.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              }}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Contactar soporte
            </Button>
            
            <Button
              onClick={() => {
                const reportData = {
                  error: error.message,
                  stack: error.stack,
                  digest: error.digest,
                  url: window.location.href,
                  userAgent: navigator.userAgent,
                  timestamp: new Date().toISOString()
                };
                
                // Copy to clipboard
                navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
                alert('Información del error copiada al portapapeles');
              }}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              Copiar detalles del error
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;