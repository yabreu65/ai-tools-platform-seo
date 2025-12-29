'use client';

import React, { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff, 
  Bell, 
  BellOff, 
  Share2, 
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface PWAInstallerProps {
  className?: string;
  showOnlyWhenInstallable?: boolean;
}

export function PWAInstaller({ className, showOnlyWhenInstallable = false }: PWAInstallerProps) {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    isStandalone,
    supportsPWA,
    updateAvailable,
    installApp,
    updateApp,
    shareApp,
    requestNotificationPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  } = usePWA();

  const [isInstalling, setIsInstalling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof window !== 'undefined' ? Notification.permission === 'granted' : false
  );
  const [showDetails, setShowDetails] = useState(false);

  // Don't show if not supported
  if (!supportsPWA) {
    return null;
  }

  // Show only when installable if requested
  if (showOnlyWhenInstallable && !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        toast.success('¡App instalada correctamente!', {
          description: 'Ya puedes acceder a YA Tools desde tu pantalla de inicio',
        });
      } else {
        toast.error('No se pudo instalar la app', {
          description: 'Inténtalo de nuevo más tarde',
        });
      }
    } catch (error) {
      toast.error('Error al instalar la app');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateApp();
      toast.success('App actualizada correctamente', {
        description: 'La página se recargará automáticamente',
      });
    } catch (error) {
      toast.error('Error al actualizar la app');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShare = async () => {
    try {
      const success = await shareApp();
      if (success) {
        toast.success('¡Compartido correctamente!');
      }
    } catch (error) {
      toast.error('Error al compartir');
    }
  };

  const handleNotifications = async () => {
    try {
      if (notificationsEnabled) {
        await unsubscribeFromNotifications();
        setNotificationsEnabled(false);
        toast.success('Notificaciones desactivadas');
      } else {
        const permission = await requestNotificationPermission();
        if (permission === 'granted') {
          const success = await subscribeToNotifications();
          if (success) {
            setNotificationsEnabled(true);
            toast.success('Notificaciones activadas');
          } else {
            toast.error('Error al activar notificaciones');
          }
        } else {
          toast.error('Permisos de notificación denegados');
        }
      }
    } catch (error) {
      toast.error('Error al gestionar notificaciones');
    }
  };

  // Compact install button for when only installable
  if (showOnlyWhenInstallable && isInstallable) {
    return (
      <Button
        onClick={handleInstall}
        disabled={isInstalling}
        className={className}
        size="sm"
      >
        {isInstalling ? (
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Instalar App
      </Button>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">YA Tools PWA</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="secondary" className="text-green-600">
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
            {isInstalled && (
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Instalada
              </Badge>
            )}
            {updateAvailable && (
              <Badge variant="outline" className="text-orange-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Actualización
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          {isInstalled 
            ? 'App instalada y funcionando correctamente'
            : 'Instala YA Tools como una app nativa en tu dispositivo'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Installation Status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-gray-500" />
            <span>Modo: {isStandalone ? 'App' : 'Navegador'}</span>
          </div>
          <div className="flex items-center gap-2">
            {notificationsEnabled ? (
              <Bell className="h-4 w-4 text-green-600" />
            ) : (
              <BellOff className="h-4 w-4 text-gray-500" />
            )}
            <span>Notificaciones: {notificationsEnabled ? 'Activas' : 'Inactivas'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {isInstallable && (
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              size="sm"
              className="flex-1"
            >
              {isInstalling ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Instalar App
            </Button>
          )}

          {updateAvailable && (
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {isUpdating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualizar
            </Button>
          )}

          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>

          <Button
            onClick={handleNotifications}
            variant="outline"
            size="sm"
          >
            {notificationsEnabled ? (
              <BellOff className="h-4 w-4 mr-2" />
            ) : (
              <Bell className="h-4 w-4 mr-2" />
            )}
            {notificationsEnabled ? 'Desactivar' : 'Activar'}
          </Button>
        </div>

        {/* Features List */}
        {showDetails && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Características de la PWA:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Funciona sin conexión a internet</li>
              <li>• Instalación nativa en dispositivos</li>
              <li>• Notificaciones push</li>
              <li>• Actualizaciones automáticas</li>
              <li>• Acceso rápido desde pantalla de inicio</li>
              <li>• Sincronización en segundo plano</li>
            </ul>
          </div>
        )}

        <Button
          onClick={() => setShowDetails(!showDetails)}
          variant="ghost"
          size="sm"
          className="w-full"
        >
          {showDetails ? 'Ocultar detalles' : 'Ver características'}
        </Button>
      </CardContent>
    </Card>
  );
}

// Floating install prompt
export function PWAInstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Download className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900">Instalar YA Tools</h3>
              <p className="text-sm text-gray-600 mt-1">
                Accede más rápido a todas las herramientas
              </p>
              <div className="flex gap-2 mt-3">
                <Button onClick={handleInstall} size="sm">
                  Instalar
                </Button>
                <Button
                  onClick={() => setDismissed(true)}
                  variant="ghost"
                  size="sm"
                >
                  Ahora no
                </Button>
              </div>
            </div>
            <Button
              onClick={() => setDismissed(true)}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}