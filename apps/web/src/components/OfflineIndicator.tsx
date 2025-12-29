'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  Upload,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useServiceWorker, useOfflineMode } from '@/hooks/useServiceWorker';
import { useNotificationHelpers } from '@/hooks/useNotifications';

export const OfflineIndicator: React.FC = () => {
  const { 
    isOnline, 
    updateAvailable, 
    activateUpdate, 
    cacheStatus, 
    getCacheStatus,
    clearCache,
    forceSync
  } = useServiceWorker();
  
  const { syncQueue, hasPendingSync } = useOfflineMode();
  const { showNotification } = useNotificationHelpers();

  const handleRefreshCache = async () => {
    await getCacheStatus();
    showNotification('Estado del cache actualizado', 'info');
  };

  const handleClearCache = async () => {
    const success = await clearCache();
    if (success) {
      await getCacheStatus();
    }
  };

  const handleForceSync = async () => {
    const success = await forceSync();
    if (success) {
      showNotification('Sincronización forzada completada', 'success');
    }
  };

  const totalCachedItems = Object.values(cacheStatus).reduce((sum, count) => sum + count, 0);

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <AnimatePresence>
        {/* Indicador de conexión */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="mb-2"
        >
          <Card className={`${
            isOnline 
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' 
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
          }`}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  isOnline 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {isOnline ? 'En línea' : 'Sin conexión'}
                </span>
                
                {totalCachedItems > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    <Download className="h-3 w-3 mr-1" />
                    {totalCachedItems} cached
                  </Badge>
                )}
              </div>
              
              {hasPendingSync && (
                <div className="mt-2 flex items-center gap-2">
                  <Clock className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-orange-600 dark:text-orange-400">
                    {syncQueue.length} elementos pendientes de sincronización
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Panel de control offline (solo cuando está offline o hay datos pendientes) */}
        {(!isOnline || hasPendingSync || updateAvailable) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Control Offline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Actualización disponible */}
                {updateAvailable && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-700 dark:text-blue-300">
                        Nueva versión disponible
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={activateUpdate}
                        className="h-6 px-2 text-xs"
                      >
                        Actualizar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Sincronización pendiente */}
                {hasPendingSync && (
                  <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-orange-700 dark:text-orange-300">
                        Datos pendientes: {syncQueue.length}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleForceSync}
                        disabled={!isOnline}
                        className="h-6 px-2 text-xs"
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Sincronizar
                      </Button>
                    </div>
                    
                    {/* Lista de elementos pendientes */}
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {syncQueue.slice(0, 3).map((item, index) => (
                        <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2 w-2" />
                          {item.method} {new URL(item.url).pathname}
                        </div>
                      ))}
                      {syncQueue.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{syncQueue.length - 3} más...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Estado del cache */}
                {totalCachedItems > 0 && (
                  <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        Cache: {totalCachedItems} elementos
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleRefreshCache}
                          className="h-6 px-2 text-xs"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleClearCache}
                          className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                        >
                          Limpiar
                        </Button>
                      </div>
                    </div>
                    
                    {/* Detalles del cache */}
                    <div className="space-y-1">
                      {Object.entries(cacheStatus).map(([cacheName, count]) => (
                        <div key={cacheName} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground truncate">
                            {cacheName.replace('ya-tools-', '')}
                          </span>
                          <Badge variant="outline" className="h-4 px-1 text-xs">
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modo offline activo */}
                {!isOnline && (
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded-md">
                    <div className="flex items-center gap-2">
                      <WifiOff className="h-3 w-3 text-yellow-600" />
                      <span className="text-xs text-yellow-700 dark:text-yellow-300">
                        Modo offline activo
                      </span>
                    </div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Los cambios se guardarán y sincronizarán automáticamente cuando vuelva la conexión.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente más simple para la barra superior
export const ConnectionStatus: React.FC = () => {
  const { isOnline } = useServiceWorker();
  const { hasPendingSync, syncQueue } = useOfflineMode();

  if (isOnline && !hasPendingSync) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm ${
          !isOnline 
            ? 'bg-red-500 text-white' 
            : 'bg-orange-500 text-white'
        }`}
      >
        {!isOnline ? (
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            Sin conexión - Trabajando offline
          </div>
        ) : hasPendingSync ? (
          <div className="flex items-center justify-center gap-2">
            <Upload className="h-4 w-4" />
            Sincronizando {syncQueue.length} elementos...
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineIndicator;