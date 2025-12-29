'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Eye, 
  Share2, 
  Download, 
  Trash2, 
  Heart, 
  Calendar,
  Tag,
  MoreVertical,
  SortAsc,
  SortDesc
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAnalyses } from '@/hooks/useAnalyses'
import { SavedAnalysis, AnalysisFilter } from '@/types/analysis'
import { toast } from 'sonner'

interface SavedAnalysesProps {
  showFavoritesOnly?: boolean
  limit?: number
  showPagination?: boolean
}

export default function SavedAnalyses({ 
  showFavoritesOnly = false, 
  limit = 10,
  showPagination = true 
}: SavedAnalysesProps) {
  const { 
    analyses, 
    loading, 
    error, 
    pagination, 
    fetchAnalyses, 
    deleteAnalysis, 
    toggleFavorite 
  } = useAnalyses()

  const [filters, setFilters] = useState<AnalysisFilter>({
    page: 1,
    limit,
    search: '',
    toolType: '',
    isFavorite: showFavoritesOnly,
    tags: []
  })
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'tool'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchAnalyses(filters)
  }, [filters])

  const getToolDisplayName = (toolType: string) => {
    const toolNames: Record<string, string> = {
      'seo-audit': 'Auditor SEO',
      'content-optimizer': 'Optimizador de Contenido',
      'title-generator': 'Generador de Títulos',
      'duplicate-detector': 'Detector de Duplicados',
      'image-renamer': 'Renombrador de Imágenes',
      'sitemap-generator': 'Generador de Sitemap'
    }
    return toolNames[toolType] || toolType
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }))
  }

  const handleToolFilter = (toolType: string) => {
    setFilters(prev => ({ ...prev, toolType, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este análisis?')) {
      await deleteAnalysis(id)
    }
  }

  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id)
  }

  const handleShare = (analysis: SavedAnalysis) => {
    // En producción, esto generaría un enlace compartible
    navigator.clipboard.writeText(`${window.location.origin}/shared/${analysis.id}`)
    toast.success('Enlace copiado al portapapeles')
  }

  const handleExport = (analysis: SavedAnalysis) => {
    // En producción, esto exportaría el análisis
    toast.success('Exportando análisis...')
  }

  const sortedAnalyses = [...analyses].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        break
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'tool':
        comparison = getToolDisplayName(a.toolType).localeCompare(getToolDisplayName(b.toolType))
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  if (loading && analyses.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tech-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button 
          onClick={() => fetchAnalyses(filters)} 
          variant="outline" 
          className="mt-4"
        >
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar análisis..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleToolFilter('')}>
                Todas las herramientas
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleToolFilter('seo-audit')}>
                Auditor SEO
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToolFilter('content-optimizer')}>
                Optimizador de Contenido
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToolFilter('title-generator')}>
                Generador de Títulos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToolFilter('duplicate-detector')}>
                Detector de Duplicados
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('date')}>
                Ordenar por fecha
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('title')}>
                Ordenar por título
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('tool')}>
                Ordenar por herramienta
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? 'Descendente' : 'Ascendente'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Lista de análisis */}
      {sortedAnalyses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {filters.search || filters.toolType ? 
              'No se encontraron análisis con los filtros aplicados' : 
              'No tienes análisis guardados aún'
            }
          </div>
          {!filters.search && !filters.toolType && (
            <p className="text-sm text-muted-foreground">
              Comienza usando nuestras herramientas SEO y guarda tus resultados.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedAnalyses.map((analysis) => (
            <Card key={analysis.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{analysis.title}</CardTitle>
                      {analysis.isFavorite && (
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span>{getToolDisplayName(analysis.toolType)}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(analysis.updatedAt)}
                      </span>
                    </CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {}}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare(analysis)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartir
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport(analysis)}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleFavorite(analysis.id)}>
                        <Heart className="h-4 w-4 mr-2" />
                        {analysis.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(analysis.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Metadatos del análisis */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  {analysis.metadata.url && (
                    <span>URL: {analysis.metadata.url}</span>
                  )}
                  {analysis.metadata.score && (
                    <span>Puntuación: {analysis.metadata.score}/100</span>
                  )}
                  {analysis.metadata.wordCount && (
                    <span>Palabras: {analysis.metadata.wordCount}</span>
                  )}
                  {analysis.metadata.readabilityScore && (
                    <span>Legibilidad: {analysis.metadata.readabilityScore}/100</span>
                  )}
                </div>

                {/* Tags */}
                {analysis.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    {analysis.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginación */}
      {showPagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} análisis
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}