'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  Download, 
  Settings, 
  Palette,
  Crown,
  Loader2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolType: string;
  data: any;
  title: string;
  userPlan: string;
}

export function ExportModal({
  isOpen,
  onClose,
  toolType,
  data,
  title,
  userPlan = 'free'
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [selectedTemplate, setSelectedTemplate] = useState<'professional' | 'minimal' | 'detailed'>('professional');
  const [includeBranding, setIncludeBranding] = useState(userPlan === 'premium');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [customBranding, setCustomBranding] = useState({
    companyName: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF'
  });

  const isPremium = userPlan === 'premium';
  const isTrial = userPlan === 'trial';
  const isFree = userPlan === 'free';

  const formatOptions = [
    {
      value: 'pdf' as const,
      label: 'PDF Profesional',
      description: 'Reporte completo con gráficos y diseño profesional',
      icon: FileText,
      available: true
    },
    {
      value: 'csv' as const,
      label: 'CSV/Excel',
      description: 'Datos tabulares para análisis posterior',
      icon: FileSpreadsheet,
      available: true
    },
    {
      value: 'json' as const,
      label: 'JSON',
      description: 'Datos estructurados para integraciones',
      icon: FileJson,
      available: true
    }
  ];

  const templateOptions = [
    {
      value: 'minimal' as const,
      label: 'Minimalista',
      description: 'Diseño limpio y simple',
      available: true
    },
    {
      value: 'professional' as const,
      label: 'Profesional',
      description: 'Diseño corporativo con gráficos',
      available: true
    },
    {
      value: 'detailed' as const,
      label: 'Detallado',
      description: 'Análisis completo con recomendaciones',
      available: isPremium || isTrial
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportOptions = {
        format: selectedFormat,
        template: selectedTemplate,
        includeBranding: includeBranding && (isPremium || isTrial),
        includeCharts,
        customBranding: isPremium ? customBranding : undefined
      };

      const endpoint = selectedFormat === 'pdf' ? '/api/export/pdf' : '/api/export/data';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolType,
          data,
          title,
          format: selectedFormat,
          options: exportOptions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar el reporte');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      const extension = selectedFormat === 'pdf' ? 'pdf' : selectedFormat === 'csv' ? 'csv' : 'json';
      const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${extension}`;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Reporte ${selectedFormat.toUpperCase()} descargado exitosamente`);
      onClose();
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error(error instanceof Error ? error.message : 'Error al exportar el reporte');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = () => {
    // Implementar preview en el futuro
    toast.info('Vista previa disponible próximamente');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Reporte: {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={isPremium ? 'default' : isTrial ? 'secondary' : 'outline'}>
                {isPremium && <Crown className="h-3 w-3 mr-1" />}
                Plan {userPlan.toUpperCase()}
              </Badge>
            </div>
            {isFree && (
              <p className="text-sm text-muted-foreground">
                Funciones limitadas. <span className="text-primary cursor-pointer hover:underline">Actualizar a Premium</span>
              </p>
            )}
          </div>

          {/* Formato de Exportación */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Formato de Exportación</Label>
            <RadioGroup 
              value={selectedFormat} 
              onValueChange={(value) => setSelectedFormat(value as 'pdf' | 'csv' | 'json')}
              className="grid grid-cols-1 gap-3"
            >
              {formatOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={option.value} 
                      id={option.value}
                      disabled={!option.available}
                    />
                    <Label 
                      htmlFor={option.value} 
                      className="flex items-center gap-3 cursor-pointer flex-1 p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Plantilla (solo para PDF) */}
          {selectedFormat === 'pdf' && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Plantilla de Diseño</Label>
              <RadioGroup 
                value={selectedTemplate} 
                onValueChange={(value) => setSelectedTemplate(value as 'professional' | 'minimal' | 'detailed')}
                className="grid grid-cols-1 gap-2"
              >
                {templateOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={option.value} 
                      id={`template-${option.value}`}
                      disabled={!option.available}
                    />
                    <Label 
                      htmlFor={`template-${option.value}`} 
                      className={`flex items-center justify-between cursor-pointer flex-1 p-2 border rounded ${!option.available ? 'opacity-50' : 'hover:bg-muted/50'}`}
                    >
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {option.label}
                          {!option.available && <Crown className="h-4 w-4 text-amber-500" />}
                        </div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <Separator />

          {/* Opciones Avanzadas */}
          <div className="space-y-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Opciones Avanzadas
            </Label>

            {/* Incluir Gráficos */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-charts" 
                checked={includeCharts}
                onCheckedChange={setIncludeCharts}
              />
              <Label htmlFor="include-charts" className="cursor-pointer">
                Incluir gráficos y visualizaciones
              </Label>
            </div>

            {/* Branding */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-branding" 
                checked={includeBranding}
                onCheckedChange={setIncludeBranding}
                disabled={isFree}
              />
              <Label htmlFor="include-branding" className={`cursor-pointer ${isFree ? 'opacity-50' : ''}`}>
                Incluir branding profesional
                {isFree && <Crown className="h-4 w-4 text-amber-500 ml-1 inline" />}
              </Label>
            </div>

            {/* Branding Personalizado (Solo Premium) */}
            {isPremium && includeBranding && (
              <div className="ml-6 space-y-3 p-4 border rounded-lg bg-muted/20">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Branding Personalizado
                </Label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="company-name" className="text-xs">Nombre de la Empresa</Label>
                    <Input
                      id="company-name"
                      placeholder="Mi Empresa"
                      value={customBranding.companyName}
                      onChange={(e) => setCustomBranding(prev => ({ ...prev, companyName: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="primary-color" className="text-xs">Color Primario</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="primary-color"
                        type="color"
                        value={customBranding.primaryColor}
                        onChange={(e) => setCustomBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-12 h-9 p-1"
                      />
                      <Input
                        value={customBranding.primaryColor}
                        onChange={(e) => setCustomBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Limitaciones del Plan Free */}
          {isFree && (
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
              <h4 className="font-semibold text-amber-800 mb-2">Limitaciones del Plan Free</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Exportación básica sin branding personalizado</li>
                <li>• Datos limitados en reportes (primeros 3-5 elementos)</li>
                <li>• Sin plantillas avanzadas</li>
                <li>• Marca de agua en algunos formatos</li>
              </ul>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={isExporting}
            >
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isExporting}>
                Cancelar
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}