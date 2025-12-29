'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ToolErrorBoundaryProps {
  children: React.ReactNode;
  toolName: string;
  onRetry?: () => void;
}

const ToolErrorFallback: React.FC<{
  toolName: string;
  onRetry?: () => void;
  onReset: () => void;
}> = ({ toolName, onRetry, onReset }) => {
  const router = useRouter();

  return (
    <div className="min-h-[500px] flex items-center justify-center p-8">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground">
            Error en {toolName}
          </h2>
          <p className="text-lg text-muted-foreground">
            La herramienta ha encontrado un problema inesperado
          </p>
          <p className="text-sm text-muted-foreground">
            Esto puede deberse a datos de entrada inválidos o un error temporal del servidor.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-left">
          <h3 className="font-semibold mb-2">Sugerencias para resolver el problema:</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Verifica que los datos ingresados sean correctos</li>
            <li>• Intenta con una URL o texto diferente</li>
            <li>• Recarga la página y vuelve a intentar</li>
            <li>• Si el problema persiste, contacta al soporte</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button
              onClick={() => {
                onReset();
                onRetry();
              }}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar análisis
            </Button>
          )}
          
          <Button
            onClick={onReset}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reiniciar herramienta
          </Button>
          
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver atrás
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ToolErrorBoundary: React.FC<ToolErrorBoundaryProps> = ({
  children,
  toolName,
  onRetry,
}) => {
  return (
    <ErrorBoundary
      fallback={
        <ToolErrorFallback
          toolName={toolName}
          onRetry={onRetry}
          onReset={() => window.location.reload()}
        />
      }
      onError={(error, errorInfo) => {
        // Log tool-specific error
        console.error(`Error in ${toolName}:`, error, errorInfo);
        
        // You could send tool-specific analytics here
        // analytics.track('tool_error', {
        //   tool_name: toolName,
        //   error_message: error.message,
        //   error_stack: error.stack,
        // });
      }}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
};