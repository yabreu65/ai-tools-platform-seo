'use client'

import { useAuth } from '@/contexts/AuthContext'
import SavedAnalyses from '@/components/SavedAnalyses'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Plus, 
  BarChart3,
  TrendingUp,
  Heart,
  Download
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import SEOHead from '@/components/seo/SEOHead';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export default function AnalysisPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total: 0,
    favorites: 0,
    thisMonth: 0,
    exported: 0
  })

  useEffect(() => {
    // En producción, esto cargaría las estadísticas reales
    const loadStats = async () => {
      // Mock data
      setStats({
        total: 47,
        favorites: 12,
        thisMonth: 8,
        exported: 23
      })
    }

    loadStats()
  }, [])

  const analysisSchema = {
    breadcrumb: {
      items: [
        {
          name: "Inicio",
          url: "https://yatools.app"
        },
        {
          name: "Análisis",
          url: "https://yatools.app/analisis"
        }
      ]
    }
  }

  return (
    <>
      <SEOHead
        title="Análisis Guardados - YA Tools | Gestiona tus Análisis SEO"
        description="Accede y gestiona todos tus análisis SEO guardados en YA Tools. Revisa estadísticas, exporta reportes y organiza tus análisis de herramientas profesionales."
        keywords="análisis SEO guardados, reportes SEO, estadísticas análisis, gestión análisis, exportar reportes SEO"
        canonical="https://yatools.app/analisis"
        type="website"
        image="https://yatools.app/og-analysis.jpg"
        noindex={true}
        nofollow={true}
      />
      <SchemaMarkup {...analysisSchema} />
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-tech-blue-600 to-ai-purple-600 bg-clip-text text-transparent">
              Análisis Guardados
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestiona y revisa todos tus análisis SEO guardados
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/herramientas">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Análisis
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Análisis</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Análisis guardados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favorites}</div>
            <p className="text-xs text-muted-foreground">
              Marcados como favoritos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Nuevos análisis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exportados</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.exported}</div>
            <p className="text-xs text-muted-foreground">
              Reportes descargados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análisis guardados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Todos los Análisis
          </CardTitle>
          <CardDescription>
            Busca, filtra y gestiona todos tus análisis SEO guardados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SavedAnalyses />
        </CardContent>
      </Card>
    </div>
    </>
  )
}