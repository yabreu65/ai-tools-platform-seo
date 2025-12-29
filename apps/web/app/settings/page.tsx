'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Download, 
  Trash2,
  AlertTriangle,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
    security: true
  })
  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    showEmail: false,
    allowAnalytics: true
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    toast.success('Configuración de notificaciones actualizada')
  }

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    toast.success('Configuración de privacidad actualizada')
  }

  const handleExportData = async () => {
    setIsLoading(true)
    try {
      // Simular exportación de datos
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Tus datos han sido exportados. Recibirás un email con el enlace de descarga.')
    } catch (error) {
      toast.error('Error al exportar los datos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    // En producción, esto abriría un modal de confirmación
    toast.error('Esta acción requiere confirmación adicional')
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No hay usuario autenticado</h2>
            <p className="text-muted-foreground">Por favor, inicia sesión para acceder a la configuración.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-tech-blue-600 to-ai-purple-600 bg-clip-text text-transparent">
          Configuración
        </h1>
        <p className="text-muted-foreground mt-2">
          Personaliza tu experiencia y gestiona la configuración de tu cuenta.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="privacy">Privacidad</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="account">Cuenta</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración General
              </CardTitle>
              <CardDescription>
                Configuración básica de tu cuenta y preferencias.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <select 
                    id="language"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona horaria</Label>
                  <select 
                    id="timezone"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Europe/Madrid">Europa/Madrid (UTC+1)</option>
                    <option value="America/New_York">América/Nueva_York (UTC-5)</option>
                    <option value="Asia/Tokyo">Asia/Tokio (UTC+9)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Formato de fecha</Label>
                  <select 
                    id="dateFormat"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button>Guardar cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>
                Controla qué notificaciones quieres recibir y cómo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">Notificaciones por email</h4>
                    <p className="text-sm text-muted-foreground">
                      Recibe actualizaciones importantes por correo electrónico
                    </p>
                  </div>
                  <Checkbox
                    checked={notifications.email}
                    onCheckedChange={() => handleNotificationChange('email')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">Notificaciones push</h4>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones en tiempo real en tu navegador
                    </p>
                  </div>
                  <Checkbox
                    checked={notifications.push}
                    onCheckedChange={() => handleNotificationChange('push')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">Marketing y promociones</h4>
                    <p className="text-sm text-muted-foreground">
                      Recibe información sobre nuevas funciones y ofertas
                    </p>
                  </div>
                  <Checkbox
                    checked={notifications.marketing}
                    onCheckedChange={() => handleNotificationChange('marketing')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">Alertas de seguridad</h4>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones sobre actividad sospechosa en tu cuenta
                    </p>
                  </div>
                  <Checkbox
                    checked={notifications.security}
                    onCheckedChange={() => handleNotificationChange('security')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración de Privacidad
              </CardTitle>
              <CardDescription>
                Controla la visibilidad de tu información y datos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">Perfil público</h4>
                    <p className="text-sm text-muted-foreground">
                      Permite que otros usuarios vean tu perfil básico
                    </p>
                  </div>
                  <Checkbox
                    checked={privacy.profilePublic}
                    onCheckedChange={() => handlePrivacyChange('profilePublic')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">Mostrar email</h4>
                    <p className="text-sm text-muted-foreground">
                      Incluir tu email en tu perfil público
                    </p>
                  </div>
                  <Checkbox
                    checked={privacy.showEmail}
                    onCheckedChange={() => handlePrivacyChange('showEmail')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">Permitir análisis</h4>
                    <p className="text-sm text-muted-foreground">
                      Ayúdanos a mejorar la plataforma compartiendo datos de uso anónimos
                    </p>
                  </div>
                  <Checkbox
                    checked={privacy.allowAnalytics}
                    onCheckedChange={() => handlePrivacyChange('allowAnalytics')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Configuración de Apariencia
              </CardTitle>
              <CardDescription>
                Personaliza la apariencia de la interfaz.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Tema</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecciona el tema que prefieras para la interfaz.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${theme === 'light' ? 'border-tech-blue-500 bg-tech-blue-50 dark:bg-tech-blue-900/20' : 'hover:border-muted-foreground'}`}
                      onClick={() => setTheme('light')}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="h-4 w-4" />
                        <span className="font-medium">Claro</span>
                      </div>
                      <div className="w-full h-8 bg-white border rounded"></div>
                    </div>

                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${theme === 'dark' ? 'border-tech-blue-500 bg-tech-blue-50 dark:bg-tech-blue-900/20' : 'hover:border-muted-foreground'}`}
                      onClick={() => setTheme('dark')}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Moon className="h-4 w-4" />
                        <span className="font-medium">Oscuro</span>
                      </div>
                      <div className="w-full h-8 bg-gray-900 border rounded"></div>
                    </div>

                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${theme === 'system' ? 'border-tech-blue-500 bg-tech-blue-50 dark:bg-tech-blue-900/20' : 'hover:border-muted-foreground'}`}
                      onClick={() => setTheme('system')}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Monitor className="h-4 w-4" />
                        <span className="font-medium">Sistema</span>
                      </div>
                      <div className="w-full h-8 bg-gradient-to-r from-white to-gray-900 border rounded"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fontSize">Tamaño de fuente</Label>
                  <select 
                    id="fontSize"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="small">Pequeño</option>
                    <option value="medium">Mediano</option>
                    <option value="large">Grande</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportar Datos
              </CardTitle>
              <CardDescription>
                Descarga una copia de todos tus datos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Puedes solicitar una copia de todos los datos asociados con tu cuenta. 
                  Esto incluye tu perfil, análisis guardados, configuraciones y más.
                </p>
                <Button 
                  onClick={handleExportData}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isLoading ? 'Exportando...' : 'Exportar mis datos'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Zona de Peligro
              </CardTitle>
              <CardDescription>
                Acciones irreversibles que afectan permanentemente tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    Eliminar cuenta
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    Esta acción eliminará permanentemente tu cuenta y todos los datos asociados. 
                    Esta acción no se puede deshacer.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar mi cuenta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}