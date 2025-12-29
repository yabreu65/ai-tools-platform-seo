'use client'

import { toast } from 'sonner'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Crown, 
  Zap, 
  Loader2,
  Bell,
  Star
} from 'lucide-react'

// Notification types
export type NotificationType = 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'planLimit' 
  | 'upgrade' 
  | 'loading'
  | 'custom'

interface NotificationOptions {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ComponentType<{ className?: string }>
}

// Enhanced notification system with custom styling
export class NotificationSystem {
  static success(message: string, options?: NotificationOptions) {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined,
      className: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100'
    })
  }

  static error(message: string, options?: NotificationOptions) {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration || 6000,
      icon: <XCircle className="h-4 w-4 text-red-600" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined,
      className: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100'
    })
  }

  static warning(message: string, options?: NotificationOptions) {
    toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined,
      className: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100'
    })
  }

  static info(message: string, options?: NotificationOptions) {
    toast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <Info className="h-4 w-4 text-blue-600" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined,
      className: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100'
    })
  }

  static planLimit(message: string, options?: NotificationOptions) {
    toast.warning(message, {
      description: options?.description,
      duration: 8000,
      icon: <Crown className="h-4 w-4 text-purple-600" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : {
        label: 'Ver Planes',
        onClick: () => window.location.href = '/precios'
      },
      className: 'border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-100'
    })
  }

  static upgrade(message: string, options?: NotificationOptions) {
    toast(message, {
      description: options?.description,
      duration: 10000,
      icon: <Zap className="h-4 w-4 text-blue-600" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : {
        label: 'Actualizar Plan',
        onClick: () => window.location.href = '/precios'
      },
      className: 'border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-900 dark:border-blue-800 dark:from-blue-900/20 dark:to-purple-900/20 dark:text-blue-100'
    })
  }

  static loading(message: string, options?: NotificationOptions) {
    return toast.loading(message, {
      description: options?.description,
      icon: <Loader2 className="h-4 w-4 animate-spin text-gray-600" />,
      className: 'border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-800 dark:bg-gray-900/20 dark:text-gray-100'
    })
  }

  static custom(message: string, options: NotificationOptions & { type: NotificationType }) {
    const iconMap = {
      success: CheckCircle,
      error: XCircle,
      warning: AlertTriangle,
      info: Info,
      planLimit: Crown,
      upgrade: Zap,
      loading: Loader2,
      custom: options.icon || Bell
    }

    const Icon = iconMap[options.type]

    toast(message, {
      description: options.description,
      duration: options.duration || 4000,
      icon: <Icon className="h-4 w-4" />,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    })
  }

  // Dismiss all notifications
  static dismissAll() {
    toast.dismiss()
  }

  // Dismiss specific notification
  static dismiss(toastId: string | number) {
    toast.dismiss(toastId)
  }
}

// Pre-defined notification templates for common scenarios
export const notificationTemplates = {
  // Authentication notifications
  auth: {
    loginSuccess: () => NotificationSystem.success('¡Bienvenido de vuelta!', {
      description: 'Has iniciado sesión correctamente'
    }),
    loginError: () => NotificationSystem.error('Error al iniciar sesión', {
      description: 'Verifica tus credenciales e intenta nuevamente'
    }),
    logoutSuccess: () => NotificationSystem.info('Sesión cerrada', {
      description: 'Has cerrado sesión correctamente'
    }),
    registrationSuccess: () => NotificationSystem.success('¡Cuenta creada!', {
      description: 'Tu cuenta ha sido creada exitosamente'
    })
  },

  // Plan notifications
  plan: {
    limitReached: (feature: string) => NotificationSystem.planLimit(
      `Has alcanzado el límite de ${feature}`, {
        description: 'Actualiza tu plan para continuar usando esta funcionalidad'
      }
    ),
    limitWarning: (feature: string, remaining: number) => NotificationSystem.warning(
      `Te quedan ${remaining} ${feature} este mes`, {
        description: 'Considera actualizar tu plan para obtener más recursos'
      }
    ),
    upgradeSuccess: (planName: string) => NotificationSystem.success(
      `¡Plan actualizado a ${planName}!`, {
        description: 'Ya puedes disfrutar de todas las funcionalidades premium'
      }
    )
  },

  // Analysis notifications
  analysis: {
    started: () => NotificationSystem.loading('Iniciando análisis...', {
      description: 'Esto puede tomar unos momentos'
    }),
    completed: () => NotificationSystem.success('¡Análisis completado!', {
      description: 'Los resultados están listos para revisar'
    }),
    failed: () => NotificationSystem.error('Error en el análisis', {
      description: 'Hubo un problema al procesar tu solicitud'
    }),
    saved: () => NotificationSystem.success('Análisis guardado', {
      description: 'Puedes encontrarlo en tu dashboard'
    })
  },

  // Profile notifications
  profile: {
    updated: () => NotificationSystem.success('Perfil actualizado', {
      description: 'Tus cambios han sido guardados correctamente'
    }),
    passwordChanged: () => NotificationSystem.success('Contraseña actualizada', {
      description: 'Tu contraseña ha sido cambiada exitosamente'
    }),
    avatarUpdated: () => NotificationSystem.success('Avatar actualizado', {
      description: 'Tu nueva imagen de perfil ha sido guardada'
    })
  },

  // System notifications
  system: {
    maintenance: () => NotificationSystem.warning('Mantenimiento programado', {
      description: 'El sistema estará en mantenimiento en 30 minutos',
      duration: 10000
    }),
    newFeature: (feature: string) => NotificationSystem.info(`Nueva funcionalidad: ${feature}`, {
      description: 'Explora las nuevas características disponibles'
    }),
    updateAvailable: () => NotificationSystem.info('Actualización disponible', {
      description: 'Recarga la página para obtener la última versión',
      action: {
        label: 'Recargar',
        onClick: () => window.location.reload()
      }
    })
  }
}

// Hook for using notifications in components
export function useNotifications() {
  return {
    notify: NotificationSystem,
    templates: notificationTemplates
  }
}