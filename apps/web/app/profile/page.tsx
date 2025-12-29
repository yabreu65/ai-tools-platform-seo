'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Phone, 
  Globe, 
  Edit3,
  Camera,
  Save,
  X
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfileSchema, type UpdateProfileData } from '@/lib/validations/auth'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      website: user?.website || '',
      bio: user?.bio || ''
    }
  })

  const onSubmit = async (data: UpdateProfileData) => {
    setIsLoading(true)
    try {
      // Simular actualización del perfil
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // En producción, esto haría una llamada a la API
      await updateUser({
        ...user!,
        ...data
      })
      
      toast.success('Perfil actualizado correctamente')
      setIsEditing(false)
    } catch (error) {
      toast.error('Error al actualizar el perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No hay usuario autenticado</h2>
            <p className="text-muted-foreground">Por favor, inicia sesión para ver tu perfil.</p>
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
          Mi Perfil
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu información personal y configuración de cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-tech-blue-500 to-ai-purple-500 text-white text-2xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="mt-4">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Miembro desde {formatDate(user.createdAt)}</span>
              </div>
              {user.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={user.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-tech-blue-600 hover:underline"
                  >
                    {user.website}
                  </a>
                </div>
              )}
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">Plan actual</div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Gratuito</span>
                  <Button size="sm" variant="outline">
                    Actualizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList>
              <TabsTrigger value="personal">Información Personal</TabsTrigger>
              <TabsTrigger value="security">Seguridad</TabsTrigger>
              <TabsTrigger value="preferences">Preferencias</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Información Personal</CardTitle>
                      <CardDescription>
                        Actualiza tu información personal y de contacto.
                      </CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} variant="outline">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleCancel} 
                          variant="outline" 
                          size="sm"
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleSubmit(onSubmit)} 
                          size="sm"
                          disabled={isLoading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isLoading ? 'Guardando...' : 'Guardar'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          {...register('name')}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-muted' : ''}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-muted' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-600">{errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          {...register('phone')}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-muted' : ''}
                          placeholder="Opcional"
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-600">{errors.phone.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Ubicación</Label>
                        <Input
                          id="location"
                          {...register('location')}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-muted' : ''}
                          placeholder="Ciudad, País"
                        />
                        {errors.location && (
                          <p className="text-sm text-red-600">{errors.location.message}</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="website">Sitio web</Label>
                        <Input
                          id="website"
                          {...register('website')}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-muted' : ''}
                          placeholder="https://ejemplo.com"
                        />
                        {errors.website && (
                          <p className="text-sm text-red-600">{errors.website.message}</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Biografía</Label>
                        <textarea
                          id="bio"
                          {...register('bio')}
                          disabled={!isEditing}
                          className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${!isEditing ? 'bg-muted' : ''}`}
                          placeholder="Cuéntanos un poco sobre ti..."
                          rows={3}
                        />
                        {errors.bio && (
                          <p className="text-sm text-red-600">{errors.bio.message}</p>
                        )}
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Seguridad</CardTitle>
                  <CardDescription>
                    Gestiona tu contraseña y configuración de seguridad.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Contraseña</h4>
                        <p className="text-sm text-muted-foreground">
                          Última actualización: hace 30 días
                        </p>
                      </div>
                      <Button variant="outline">Cambiar contraseña</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Autenticación de dos factores</h4>
                        <p className="text-sm text-muted-foreground">
                          Añade una capa extra de seguridad a tu cuenta
                        </p>
                      </div>
                      <Button variant="outline">Configurar</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Sesiones activas</h4>
                        <p className="text-sm text-muted-foreground">
                          Gestiona los dispositivos donde has iniciado sesión
                        </p>
                      </div>
                      <Button variant="outline">Ver sesiones</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias</CardTitle>
                  <CardDescription>
                    Personaliza tu experiencia en la plataforma.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Notificaciones por email</h4>
                        <p className="text-sm text-muted-foreground">
                          Recibe actualizaciones sobre tu cuenta y análisis
                        </p>
                      </div>
                      <Button variant="outline">Configurar</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Idioma</h4>
                        <p className="text-sm text-muted-foreground">
                          Español (España)
                        </p>
                      </div>
                      <Button variant="outline">Cambiar</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Zona horaria</h4>
                        <p className="text-sm text-muted-foreground">
                          UTC+1 (Madrid)
                        </p>
                      </div>
                      <Button variant="outline">Cambiar</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}