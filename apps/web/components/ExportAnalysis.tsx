'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson,
  Image,
  Settings,
  Calendar,
  User,
  Globe
} from 'lucide-react'
import { SavedAnalysis } from '@/types/analysis'
import { toast } from 'sonner'

interface ExportAnalysisProps {
  analysis: SavedAnalysis
  trigger?: React.ReactNode
}

interface ExportOptions {
  format: 'pdf' | 'csv' | 'json' | 'png'
  includeMetadata: boolean
  includeCharts: boolean
  includeRecommendations: boolean
  template: 'professional' | 'simple' | 'detailed'
  branding: boolean
  fileName: string
}

export function ExportAnalysis({ analysis, trigger }: ExportAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeMetadata: true,
    includeCharts: true,
    includeRecommendations: true,
    template: 'professional',
    branding: true,
    fileName: `${analysis.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`
  })

  const formatOptions = [
    {
      value: 'pdf',
      label: 'PDF Report',
      description: 'Reporte profesional en formato PDF',
      icon: FileText,
      color: 'text-red-600'
    },
    {
      value: 'csv',
      label: 'CSV Data',
      description: 'Datos en formato CSV para análisis',
      icon: FileSpreadsheet,
      color: 'text-green-600'
    },
    {
      value: 'json',
      label: 'JSON Export',
      description: 'Datos estructurados en formato JSON',
      icon: FileJson,
      color: 'text-blue-600'
    },
    {
      value: 'png',
      label: 'PNG Image',
      description: 'Imagen del reporte para compartir',
      icon: Image,
      color: 'text-purple-600'
    }
  ]

  const templateOptions = [
    {
      value: 'professional',
      label: 'Profesional',
      description: 'Diseño corporativo con gráficos detallados'
    },
    {
      value: 'simple',
      label: 'Simple',
      description: 'Formato limpio y minimalista'
    },
    {
      value: 'detailed',
      label: 'Detallado',
      description: 'Incluye todos los datos y análisis técnicos'
    }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Simular exportación - en producción esto haría una llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generar el archivo según el formato
      switch (options.format) {
        case 'pdf':
          await generatePDF()
          break
        case 'csv':
          await generateCSV()
          break
        case 'json':
          await generateJSON()
          break
        case 'png':
          await generatePNG()
          break
      }
      
      toast.success(`Análisis exportado como ${options.format.toUpperCase()}`)
      setIsOpen(false)
    } catch (error) {
      toast.error('Error al exportar el análisis')
    } finally {
      setIsExporting(false)
    }
  }

  const generatePDF = async () => {
    // En producción, esto usaría una librería como jsPDF o llamaría a un endpoint
    const content = generateReportContent()
    const blob = new Blob([content], { type: 'application/pdf' })
    downloadFile(blob, `${options.fileName}.pdf`)
  }

  const generateCSV = async () => {
    const csvContent = generateCSVContent()
    const blob = new Blob([csvContent], { type: 'text/csv' })
    downloadFile(blob, `${options.fileName}.csv`)
  }

  const generateJSON = async () => {
    const jsonContent = JSON.stringify(analysis, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    downloadFile(blob, `${options.fileName}.json`)
  }

  const generatePNG = async () => {
    // En producción, esto capturaría el componente como imagen
    toast.info('Generando imagen...')
  }

  const generateReportContent = () => {
    return `
# Reporte de Análisis SEO
## ${analysis.title}

**Herramienta:** ${analysis.toolType}
**Fecha:** ${new Date(analysis.createdAt).toLocaleDateString('es-ES')}
**URL:** ${analysis.metadata.url || 'N/A'}

### Resultados
${JSON.stringify(analysis.result, null, 2)}

### Metadatos
- Puntuación: ${analysis.metadata.score || 'N/A'}
- Palabras: ${analysis.metadata.wordCount || 'N/A'}
- Legibilidad: ${analysis.metadata.readabilityScore || 'N/A'}

---
Generado por YA Tools SEO
    `
  }

  const generateCSVContent = () => {
    const headers = ['Campo', 'Valor']
    const rows = [
      ['Título', analysis.title],
      ['Herramienta', analysis.toolType],
      ['Fecha', new Date(analysis.createdAt).toLocaleDateString('es-ES')],
      ['URL', analysis.metadata.url || ''],
      ['Puntuación', analysis.metadata.score?.toString() || ''],
      ['Palabras', analysis.metadata.wordCount?.toString() || ''],
      ['Legibilidad', analysis.metadata.readabilityScore?.toString() || '']
    ]
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const selectedFormat = formatOptions.find(f => f.value === options.format)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Exportar Análisis</DialogTitle>
          <DialogDescription>
            Configura las opciones de exportación para tu análisis "{analysis.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formato de exportación */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Formato de exportación</Label>
            <div className="grid grid-cols-2 gap-3">
              {formatOptions.map((format) => {
                const Icon = format.icon
                return (
                  <Card 
                    key={format.value}
                    className={`cursor-pointer transition-all ${
                      options.format === format.value 
                        ? 'ring-2 ring-tech-blue-500 bg-tech-blue-50 dark:bg-tech-blue-950' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setOptions(prev => ({ ...prev, format: format.value as any }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${format.color}`} />
                        <div>
                          <div className="font-medium">{format.label}</div>
                          <div className="text-sm text-muted-foreground">{format.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Nombre del archivo */}
          <div className="space-y-2">
            <Label htmlFor="fileName">Nombre del archivo</Label>
            <Input
              id="fileName"
              value={options.fileName}
              onChange={(e) => setOptions(prev => ({ ...prev, fileName: e.target.value }))}
              placeholder="nombre_del_archivo"
            />
          </div>

          {/* Plantilla (solo para PDF) */}
          {options.format === 'pdf' && (
            <div className="space-y-2">
              <Label>Plantilla de reporte</Label>
              <Select 
                value={options.template} 
                onValueChange={(value) => setOptions(prev => ({ ...prev, template: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templateOptions.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      <div>
                        <div className="font-medium">{template.label}</div>
                        <div className="text-sm text-muted-foreground">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Opciones de contenido */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Contenido a incluir</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={options.includeMetadata}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeMetadata: !!checked }))
                  }
                />
                <Label htmlFor="metadata" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Metadatos del análisis
                </Label>
              </div>

              {(options.format === 'pdf' || options.format === 'png') && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="charts"
                    checked={options.includeCharts}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeCharts: !!checked }))
                    }
                  />
                  <Label htmlFor="charts" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Gráficos y visualizaciones
                  </Label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommendations"
                  checked={options.includeRecommendations}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeRecommendations: !!checked }))
                  }
                />
                <Label htmlFor="recommendations" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Recomendaciones y sugerencias
                </Label>
              </div>

              {options.format === 'pdf' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="branding"
                    checked={options.branding}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, branding: !!checked }))
                    }
                  />
                  <Label htmlFor="branding" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Incluir marca YA Tools SEO
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Vista previa de información */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {selectedFormat && <selectedFormat.icon className={`h-4 w-4 ${selectedFormat.color}`} />}
                Vista previa del archivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                <span>Nombre: {options.fileName}.{options.format}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Fecha: {new Date(analysis.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>Herramienta: {analysis.toolType}</span>
              </div>
              {analysis.metadata.url && (
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  <span>URL: {analysis.metadata.url}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar {selectedFormat?.label}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}