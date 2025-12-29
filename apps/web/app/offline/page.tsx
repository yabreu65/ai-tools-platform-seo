'use client';

import React from 'react';

export const dynamic = 'force-dynamic';
import { WifiOff, RefreshCw, Home, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OfflinePage: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(false);

  React.useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (isOnline) {
      window.location.reload();
    } else {
      alert('Aún no hay conexión a internet. Intenta de nuevo cuando tengas conexión.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Offline Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-8">
            <WifiOff className="h-20 w-20 text-muted-foreground" />
          </div>
        </div>

        {/* Offline Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Sin conexión a internet
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            No se puede conectar a internet. Verifica tu conexión y vuelve a intentar.
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-muted/30 rounded-lg p-6 max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-medium">
              Estado: {isOnline ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Sugerencias:</strong></p>
            <ul className="text-left space-y-1">
              <li>• Verifica que el WiFi esté activado</li>
              <li>• Comprueba tu conexión de datos móviles</li>
              <li>• Reinicia tu router si usas WiFi</li>
              <li>• Contacta a tu proveedor de internet</li>
            </ul>
          </div>
        </div>

        {/* Offline Features */}
        <div className="bg-primary/5 rounded-lg p-6 max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Smartphone className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-primary">Funciones disponibles sin conexión</h3>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Herramientas básicas de texto</p>
            <p>• Calculadoras simples</p>
            <p>• Generadores que no requieren internet</p>
            <p>• Historial de análisis previos (si están guardados)</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleRetry}
            size="lg"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Verificar conexión
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

        {/* Auto-retry indicator */}
        <div className="text-sm text-muted-foreground">
          <p>La página se recargará automáticamente cuando se restablezca la conexión</p>
        </div>
      </div>
    </div>
  );
};

// Auto-reload when connection is restored
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });
}

export default OfflinePage;