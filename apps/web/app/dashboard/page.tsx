'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  FileText, 
  Clock, 
  TrendingUp, 
  Download,
  Zap,
  Crown,
  AlertTriangle,
  Search,
  FileSearch,
  Globe,
  Settings,
  Plus,
  ArrowRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

interface UsageData {
  monthlyAnalysisCount: number;
  monthlyExportCount: number;
  monthlySaveCount: number;
  limits: {
    monthlyAnalysis: number;
    monthlyExports: number;
    monthlySaves: number;
  };
  usageResetDate: string;
  plan: string;
  canUseAnalysis: boolean;
  canUseExport: boolean;
  canUseSave: boolean;
}

interface RecentActivity {
  id: string;
  type: 'analysis' | 'export' | 'save';
  tool: string;
  title: string;
  date: string;
  status: 'completed' | 'failed';
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  // Authentication protection
  useEffect(() => {
    console.log('Dashboard: Auth check', { isLoading, isAuthenticated, user })
    if (!isLoading && !isAuthenticated) {
      console.log('Dashboard: Redirecting to login')
      router.push('/login?redirect=/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch user usage data
  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/user/usage', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    }
  }

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isAuthenticated || !user) return
      
      console.log('Dashboard: Loading user data')
      setLoading(true)
      
      try {
        await fetchUsageData()
        
        // Mock recent activity data
        const mockActivity: RecentActivity[] = [
          {
            id: '1',
            type: 'analysis',
            tool: 'SEO Audit',
            title: 'Análisis de ejemplo.com',
            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          },
          {
            id: '2',
            type: 'export',
            tool: 'Generador de Títulos',
            title: 'Exportación de títulos SEO',
            date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          },
          {
            id: '3',
            type: 'analysis',
            tool: 'Optimizador de Contenido',
            title: 'Optimización de artículo blog',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          }
        ]
        setRecentActivity(mockActivity)
        
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        toast.error('Error al cargar los datos del dashboard')
      } finally {
        setLoading(false)
        console.log('Dashboard: User data loaded')
      }
    }

    if (isAuthenticated && user) {
      loadDashboardData()
    }
  }, [isAuthenticated, user])

  // Show loading while verifying authentication or loading data
  if (isLoading || loading) {
    console.log('Dashboard: Showing loading state')
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tech-blue-600"></div>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render anything (redirect is handled in useEffect)
  if (!isAuthenticated) {
    console.log('Dashboard: Not authenticated, returning null')
    return null
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'bg-gradient-to-r from-blue-500 to-purple-600'
      case 'enterprise': return 'bg-gradient-to-r from-purple-600 to-pink-600'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  }

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'pro': return 'Profesional'
      case 'enterprise': return 'Empresarial'
      default: return 'Gratuito'
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const quickActions = [
    {
      title: 'Generador de Títulos SEO',
      description: 'Crea títulos optimizados para SEO',
      icon: FileText,
      href: '/generar-titulo-seo',
      color: 'text-blue-600'
    },
    {
      title: 'SEO Audit Tool',
      description: 'Analiza el SEO de tu sitio web',
      icon: Search,
      href: '/seo-audit-tool',
      color: 'text-green-600'
    },
    {
      title: 'Optimizador de Contenido',
      description: 'Optimiza tu contenido para SEO',
      icon: FileSearch,
      href: '/optimizador-contenido',
      color: 'text-purple-600'
    },
    {
      title: 'Generador de Sitemap',
      description: 'Genera sitemaps XML automáticamente',
      icon: Globe,
      href: '/generador-sitemap',
      color: 'text-orange-600'
    }
  ]

  console.log('Dashboard: Rendering dashboard content')

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-tech-blue-600 to-ai-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Bienvenido de vuelta, {user?.name}. Aquí tienes un resumen de tu actividad.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={`${getPlanBadgeColor(usage?.plan || 'free')} text-white border-0`}>
              {usage?.plan === 'free' && <Zap className="h-3 w-3 mr-1" />}
              {usage?.plan === 'pro' && <Crown className="h-3 w-3 mr-1" />}
              {usage?.plan === 'enterprise' && <Crown className="h-3 w-3 mr-1" />}
              Plan {getPlanName(usage?.plan || 'free')}
            </Badge>
            {usage?.plan === 'free' && (
              <Button asChild size="sm">
                <Link href="/precios">
                  Actualizar Plan
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Plan Usage Cards */}
      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Análisis este mes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usage.monthlyAnalysisCount}
                {usage.limits.monthlyAnalysis !== -1 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /{usage.limits.monthlyAnalysis}
                  </span>
                )}
              </div>
              {usage.limits.monthlyAnalysis !== -1 && (
                <div className="mt-2">
                  <Progress 
                    value={getUsagePercentage(usage.monthlyAnalysisCount, usage.limits.monthlyAnalysis)} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {usage.limits.monthlyAnalysis - usage.monthlyAnalysisCount} restantes
                  </p>
                </div>
              )}
              {usage.limits.monthlyAnalysis === -1 && (
                <p className="text-xs text-muted-foreground">
                  Análisis ilimitados
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exportaciones</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usage.monthlyExportCount}
                {usage.limits.monthlyExports !== -1 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /{usage.limits.monthlyExports}
                  </span>
                )}
              </div>
              {usage.limits.monthlyExports !== -1 && (
                <div className="mt-2">
                  <Progress 
                    value={getUsagePercentage(usage.monthlyExportCount, usage.limits.monthlyExports)} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {usage.limits.monthlyExports - usage.monthlyExportCount} restantes
                  </p>
                </div>
              )}
              {usage.limits.monthlyExports === -1 && (
                <p className="text-xs text-muted-foreground">
                  Exportaciones ilimitadas
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Análisis guardados</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usage.monthlySaveCount}
                {usage.limits.monthlySaves !== -1 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /{usage.limits.monthlySaves}
                  </span>
                )}
              </div>
              {usage.limits.monthlySaves !== -1 && (
                <div className="mt-2">
                  <Progress 
                    value={getUsagePercentage(usage.monthlySaveCount, usage.limits.monthlySaves)} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {usage.limits.monthlySaves - usage.monthlySaveCount} restantes
                  </p>
                </div>
              )}
              {usage.limits.monthlySaves === -1 && (
                <p className="text-xs text-muted-foreground">
                  Guardados ilimitados
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Warning for plan limits */}
      {usage && usage.plan === 'free' && (
        <Card className="mb-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                  Estás usando el plan gratuito
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Actualiza a un plan premium para obtener más análisis, exportaciones y funciones avanzadas.
                </p>
                <Button asChild size="sm" className="mt-3">
                  <Link href="/precios">
                    Ver planes premium
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Acciones rápidas
              </CardTitle>
              <CardDescription>
                Accede rápidamente a las herramientas más populares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group p-4 border rounded-lg hover:border-tech-blue-300 hover:bg-tech-blue-50 dark:hover:bg-tech-blue-950 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <action.icon className={`h-5 w-5 ${action.color} group-hover:scale-110 transition-transform`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm group-hover:text-tech-blue-700 dark:group-hover:text-tech-blue-300">
                          {action.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-tech-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/herramientas">
                    <Plus className="h-4 w-4 mr-2" />
                    Ver todas las herramientas
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Actividad reciente
              </CardTitle>
              <CardDescription>
                Tus últimas acciones en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`p-1.5 rounded-full ${
                        activity.type === 'analysis' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' :
                        activity.type === 'export' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                        'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                      }`}>
                        {activity.type === 'analysis' && <BarChart3 className="h-3 w-3" />}
                        {activity.type === 'export' && <Download className="h-3 w-3" />}
                        {activity.type === 'save' && <FileText className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.tool} • {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No hay actividad reciente
                    </p>
                  </div>
                )}
              </div>
              {recentActivity.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/analisis">
                      Ver todo el historial
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}