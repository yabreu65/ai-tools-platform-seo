'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Report error to monitoring service
    const eventId = this.reportError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      eventId,
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetErrorBoundary();
      }
    }
    
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  reportError = (error: Error, errorInfo: ErrorInfo): string => {
    // Generate a unique event ID
    const eventId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In a real app, you would send this to your error reporting service
    // For now, we'll just log it
    const errorReport = {
      eventId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    console.error('Error Report:', errorReport);
    
    // You could send this to services like Sentry, LogRocket, etc.
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    
    return eventId;
  };

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        eventId: null,
      });
    }, 100);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                ¡Oops! Algo salió mal
              </h2>
              <p className="text-muted-foreground">
                Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
              </p>
            </div>

            {this.props.showDetails && this.state.error && (
              <details className="text-left bg-muted/50 rounded-lg p-4">
                <summary className="cursor-pointer font-medium mb-2">
                  Detalles técnicos
                </summary>
                <div className="text-sm space-y-2">
                  <div>
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.eventId && (
                    <div>
                      <strong>ID del evento:</strong> {this.state.eventId}
                    </div>
                  )}
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack trace:</strong>
                      <pre className="text-xs mt-1 overflow-auto max-h-32 bg-background p-2 rounded">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.resetErrorBoundary}
                variant="default"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Intentar de nuevo
              </Button>
              
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Ir al inicio
              </Button>
              
              {this.state.eventId && (
                <Button
                  onClick={() => {
                    const subject = `Error Report - ${this.state.eventId}`;
                    const body = `Error ID: ${this.state.eventId}\nURL: ${window.location.href}\nError: ${this.state.error?.message}`;
                    window.location.href = `mailto:support@yatools.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Bug className="h-4 w-4" />
                  Reportar error
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;