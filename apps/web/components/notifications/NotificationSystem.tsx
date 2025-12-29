'use client'

import { useEffect } from 'react'
import { toast, Toaster } from 'sonner'
import { CheckCircle, XCircle, AlertTriangle, Info, Crown, Zap } from 'lucide-react'

// Enhanced toast functions with custom styling
export const notifications = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: <CheckCircle className="h-4 w-4" />,
      className: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200',
    })
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      icon: <XCircle className="h-4 w-4" />,
      className: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
    })
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: <AlertTriangle className="h-4 w-4" />,
      className: 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200',
    })
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      icon: <Info className="h-4 w-4" />,
      className: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200',
    })
  },

  planLimit: (message: string, description?: string, action?: () => void) => {
    toast.error(message, {
      description,
      icon: <Zap className="h-4 w-4" />,
      className: 'border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-200',
      action: action ? {
        label: 'Actualizar Plan',
        onClick: action
      } : undefined,
      duration: 6000,
    })
  },

  upgrade: (message: string, description?: string, action?: () => void) => {
    toast(message, {
      description,
      icon: <Crown className="h-4 w-4 text-yellow-600" />,
      className: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
      action: action ? {
        label: 'Ver Planes',
        onClick: action
      } : undefined,
      duration: 8000,
    })
  },

  loading: (message: string, promise: Promise<any>) => {
    return toast.promise(promise, {
      loading: message,
      success: (data) => {
        return data?.message || 'Operación completada exitosamente'
      },
      error: (error) => {
        return error?.message || 'Ha ocurrido un error'
      },
    })
  },

  custom: (message: string, options?: {
    description?: string
    icon?: React.ReactNode
    action?: {
      label: string
      onClick: () => void
    }
    duration?: number
    className?: string
  }) => {
    toast(message, {
      description: options?.description,
      icon: options?.icon,
      action: options?.action,
      duration: options?.duration || 4000,
      className: options?.className,
    })
  }
}

// Notification types for different scenarios
export const notificationTemplates = {
  auth: {
    loginSuccess: (userName: string) => 
      notifications.success('¡Bienvenido!', `Hola ${userName}, has iniciado sesión correctamente`),
    
    loginError: () => 
      notifications.error('Error de autenticación', 'Credenciales incorrectas. Por favor, inténtalo de nuevo.'),
    
    logoutSuccess: () => 
      notifications.info('Sesión cerrada', 'Has cerrado sesión correctamente'),
    
    sessionExpired: () => 
      notifications.warning('Sesión expirada', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'),
  },

  plan: {
    limitReached: (type: 'analysis' | 'export' | 'save', onUpgrade?: () => void) => {
      const messages = {
        analysis: 'Límite de análisis alcanzado',
        export: 'Límite de exportaciones alcanzado',
        save: 'Límite de guardados alcanzado'
      }
      notifications.planLimit(
        messages[type],
        'Actualiza tu plan para continuar usando esta funcionalidad',
        onUpgrade
      )
    },

    nearLimit: (type: 'analysis' | 'export' | 'save', remaining: number, onUpgrade?: () => void) => {
      const messages = {
        analysis: `Te quedan ${remaining} análisis`,
        export: `Te quedan ${remaining} exportaciones`,
        save: `Te quedan ${remaining} guardados`
      }
      notifications.warning(
        messages[type],
        'Considera actualizar tu plan para obtener más recursos'
      )
    },

    upgradeSuccess: (planName: string) => 
      notifications.success('¡Plan actualizado!', `Ahora tienes acceso al plan ${planName}`),
    
    upgradePrompt: (onUpgrade?: () => void) => 
      notifications.upgrade(
        'Desbloquea más funciones',
        'Actualiza tu plan para acceder a herramientas avanzadas y análisis ilimitados',
        onUpgrade
      ),
  },

  analysis: {
    started: (toolName: string) => 
      notifications.info('Análisis iniciado', `Procesando con ${toolName}...`),
    
    completed: (toolName: string) => 
      notifications.success('Análisis completado', `El análisis con ${toolName} ha finalizado`),
    
    failed: (toolName: string, error?: string) => 
      notifications.error('Error en el análisis', error || `No se pudo completar el análisis con ${toolName}`),
    
    saved: () => 
      notifications.success('Análisis guardado', 'El análisis se ha guardado correctamente'),
    
    exported: (format: string) => 
      notifications.success('Exportación completada', `El reporte se ha exportado en formato ${format}`),
  },

  profile: {
    updated: () => 
      notifications.success('Perfil actualizado', 'Tus cambios se han guardado correctamente'),
    
    passwordChanged: () => 
      notifications.success('Contraseña actualizada', 'Tu contraseña se ha cambiado correctamente'),
    
    emailVerified: () => 
      notifications.success('Email verificado', 'Tu dirección de email ha sido verificada'),
  },

  system: {
    maintenance: () => 
      notifications.warning('Mantenimiento programado', 'El sistema estará en mantenimiento en 30 minutos'),
    
    newFeature: (featureName: string) => 
      notifications.info('Nueva funcionalidad', `¡Prueba la nueva herramienta: ${featureName}!`),
    
    updateAvailable: () => 
      notifications.info('Actualización disponible', 'Hay una nueva versión disponible. Recarga la página.'),
  }
}

// Main notification system component
export function NotificationSystem() {
  useEffect(() => {
    // Listen for plan limit events
    const handlePlanLimit = (event: CustomEvent) => {
      const { type, remaining, limit } = event.detail
      
      if (remaining === 0) {
        notificationTemplates.plan.limitReached(type, () => {
          window.location.href = '/precios'
        })
      } else if (remaining <= limit * 0.2) { // 20% remaining
        notificationTemplates.plan.nearLimit(type, remaining, () => {
          window.location.href = '/precios'
        })
      }
    }

    // Listen for authentication events
    const handleAuthEvent = (event: CustomEvent) => {
      const { type, data } = event.detail
      
      switch (type) {
        case 'login':
          notificationTemplates.auth.loginSuccess(data.userName)
          break
        case 'logout':
          notificationTemplates.auth.logoutSuccess()
          break
        case 'session-expired':
          notificationTemplates.auth.sessionExpired()
          break
      }
    }

    // Add event listeners
    window.addEventListener('plan-limit', handlePlanLimit as EventListener)
    window.addEventListener('auth-event', handleAuthEvent as EventListener)

    return () => {
      window.removeEventListener('plan-limit', handlePlanLimit as EventListener)
      window.removeEventListener('auth-event', handleAuthEvent as EventListener)
    }
  }, [])

  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors={false}
      closeButton={true}
      toastOptions={{
        duration: 4000,
        className: 'border shadow-lg',
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
      }}
    />
  )
}

// Utility functions to trigger events
export const triggerPlanLimitEvent = (type: 'analysis' | 'export' | 'save', remaining: number, limit: number) => {
  window.dispatchEvent(new CustomEvent('plan-limit', {
    detail: { type, remaining, limit }
  }))
}

export const triggerAuthEvent = (type: 'login' | 'logout' | 'session-expired', data?: any) => {
  window.dispatchEvent(new CustomEvent('auth-event', {
    detail: { type, data }
  }))
}