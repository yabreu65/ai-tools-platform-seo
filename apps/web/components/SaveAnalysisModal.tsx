'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Save, 
  Tag, 
  X,
  Heart,
  FileText,
  Calendar,
  Globe
} from 'lucide-react'
import { useAnalyses } from '@/hooks/useAnalyses'
import { toast } from 'sonner'

interface SaveAnalysisModalProps {
  toolType: string
  result: any
  metadata?: {
    url?: string
    score?: number
    wordCount?: number
    readabilityScore?: number
    [key: string]: any
  }
  trigger?: React.ReactNode
  onSaved?: () => void
}

export function SaveAnalysisModal({ 
  toolType, 
  result, 
  metadata = {}, 
  trigger,
  onSaved 
}: SaveAnalysisModalProps) {
  const { saveAnalysis, loading } = useAnalyses()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)

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

  const generateDefaultTitle = () => {
    const toolName = getToolDisplayName(toolType)
    const date = new Date().toLocaleDateString('es-ES')
    
    if (metadata.url) {
      const domain = new URL(metadata.url).hostname.replace('www.', '')
      return `${toolName} - ${domain} (${date})`
    }
    
    return `${toolName} - ${date}`
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Por favor, ingresa un título para el análisis')
      return
    }

    try {
      await saveAnalysis({
        title: title.trim(),
        description: description.trim(),
        toolType,
        result,
        metadata,
        tags,
        isFavorite
      })

      toast.success('Análisis guardado exitosamente')
      setIsOpen(false)
      
      // Resetear formulario
      setTitle('')
      setDescription('')
      setTags([])
      setNewTag('')
      setIsFavorite(false)
      
      onSaved?.()
    } catch (error) {
      toast.error('Error al guardar el análisis')
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && !title) {
      setTitle(generateDefaultTitle())
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Guardar Análisis
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Guardar Análisis</DialogTitle>
          <DialogDescription>
            Guarda este análisis para consultarlo más tarde
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del análisis */}
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              <span className="font-medium">{getToolDisplayName(toolType)}</span>
            </div>
            
            {metadata.url && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span className="truncate">{metadata.url}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date().toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>

            {/* Métricas del análisis */}
            <div className="flex gap-2 flex-wrap">
              {metadata.score && (
                <Badge variant="secondary" className="text-xs">
                  Puntuación: {metadata.score}/100
                </Badge>
              )}
              {metadata.wordCount && (
                <Badge variant="secondary" className="text-xs">
                  {metadata.wordCount} palabras
                </Badge>
              )}
              {metadata.readabilityScore && (
                <Badge variant="secondary" className="text-xs">
                  Legibilidad: {metadata.readabilityScore}/100
                </Badge>
              )}
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del análisis"
              maxLength={100}
            />
            <div className="text-xs text-muted-foreground text-right">
              {title.length}/100
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade una descripción o notas sobre este análisis..."
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Añadir etiqueta"
                className="flex-1"
                maxLength={20}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim())}
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              Máximo 10 etiquetas, 20 caracteres cada una
            </div>
          </div>

          {/* Favorito */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${
                isFavorite 
                  ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300' 
                  : 'hover:bg-muted'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              <span className="text-sm">
                {isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
              </span>
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !title.trim()}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}