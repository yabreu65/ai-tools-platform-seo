'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { Sparkles, ChevronDown, User, Settings, LogOut, BarChart3, Crown, Zap, Star } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { usePlan } from '@/contexts/PlanContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { currentPlan, usage } = usePlan()

  // Plan badge configuration
  const getPlanBadge = () => {
    if (!user || !currentPlan) return null

    const planConfig = {
      free: {
        label: 'Gratuito',
        icon: Star,
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      },
      pro: {
        label: 'Pro',
        icon: Zap,
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      },
      enterprise: {
        label: 'Enterprise',
        icon: Crown,
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      }
    }

    const config = planConfig[currentPlan.type as keyof typeof planConfig]
    if (!config) return null

    const Icon = config.icon

    return (
      <Badge variant="secondary" className={`${config.className} flex items-center gap-1 text-xs`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }
  return (
    <header role="banner">
      <nav 
        id="main-navigation"
        role="navigation" 
        aria-label="Navegación principal"
        className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm"
      >
      <Link 
        href="/" 
        className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-tech-blue-600 via-ai-purple-500 to-seo-teal-500 bg-clip-text text-transparent hover:from-tech-blue-500 hover:via-ai-purple-400 hover:to-seo-teal-400 transition-all duration-300"
      >
        <div className="p-2 rounded-lg bg-gradient-to-br from-tech-blue-50 to-ai-purple-50 dark:from-tech-blue-900/20 dark:to-ai-purple-900/20">
          <Sparkles className="w-5 h-5 text-tech-blue-600 dark:text-tech-blue-400" />
        </div>
        YA Tools
      </Link>
      
      <div className="flex items-center gap-2">
        {/* Herramientas Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="text-neutral-slate-600 hover:text-tech-blue-600 hover:bg-tech-blue-50 dark:text-neutral-slate-300 dark:hover:text-tech-blue-400 dark:hover:bg-tech-blue-900/20 transition-all duration-200"
            >
              Herramientas
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/optimizador-contenido">Optimizador de Contenido</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/generar-titulo-seo">Generador de Títulos SEO</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/seo-auditor-tool">Auditor SEO</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/detector-contenido-duplicado">Detector de Contenido Duplicado</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/renombrador-images">Renombrador de Imágenes</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/generador-sitemap">Generador de Sitemap</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/generador-robots-txt">Generador de Robots.txt</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/generador-sitemap-xml">Generador de Sitemap XML</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          asChild
          className="text-neutral-slate-600 hover:text-seo-teal-600 hover:bg-seo-teal-50 dark:text-neutral-slate-300 dark:hover:text-seo-teal-400 dark:hover:bg-seo-teal-900/20 transition-all duration-200"
        >
          <Link href="/precios">Precios</Link>
        </Button>

        <Button 
          variant="ghost" 
          asChild
          className="text-neutral-slate-600 hover:text-ai-purple-600 hover:bg-ai-purple-50 dark:text-neutral-slate-300 dark:hover:text-ai-purple-400 dark:hover:bg-ai-purple-900/20 transition-all duration-200"
        >
          <Link href="/acerca-de">Acerca de</Link>
        </Button>

        <Button 
          variant="ghost" 
          asChild
          className="text-neutral-slate-600 hover:text-accent-orange-600 hover:bg-accent-orange-50 dark:text-neutral-slate-300 dark:hover:text-accent-orange-400 dark:hover:bg-accent-orange-900/20 transition-all duration-200"
        >
          <Link href="/contacto">Contacto</Link>
        </Button>

        <Button 
          variant="ghost" 
          asChild
          className="text-neutral-slate-600 hover:text-success-green-600 hover:bg-success-green-50 dark:text-neutral-slate-300 dark:hover:text-success-green-400 dark:hover:bg-success-green-900/20 transition-all duration-200"
        >
          <Link href="/faq">FAQ</Link>
        </Button>

        <div className="ml-2 pl-2 border-l border-border flex items-center gap-2">
          <ModeToggle />
          
          {user ? (
            // Usuario autenticado - Mostrar avatar y menú
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-tech-blue-500 to-ai-purple-500 text-white">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.name || 'Usuario'}</p>
                      {getPlanBadge()}
                    </div>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    {usage && currentPlan && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {currentPlan.limits.analysesPerMonth > 0 && (
                          <div>Análisis: {usage.analysesThisMonth}/{currentPlan.limits.analysesPerMonth}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/analisis" className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Mis Análisis
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                {currentPlan?.type === 'free' && (
                  <DropdownMenuItem asChild>
                    <Link href="/precios" className="flex items-center text-blue-600 dark:text-blue-400">
                      <Crown className="mr-2 h-4 w-4" />
                      Actualizar Plan
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Usuario no autenticado - Mostrar botones de login/registro
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-tech-blue-600 to-ai-purple-600 hover:from-tech-blue-700 hover:to-ai-purple-700">
                <Link href="/registro">Registrarse</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
    
    {/* Breadcrumbs */}
    <div className="px-6 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-border">
      <Breadcrumbs />
    </div>
  </header>
  )
}
