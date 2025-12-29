'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react';
import { ExportModal } from './export-modal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ExportButtonProps {
  toolType: string;
  data: any;
  title: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ExportButton({ 
  toolType, 
  data, 
  title, 
  variant = 'outline',
  size = 'default',
  className = ''
}: ExportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, userPlan } = useAuth();

  const handleExportClick = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para exportar reportes');
      return;
    }

    if (!data || Object.keys(data).length === 0) {
      toast.error('No hay datos disponibles para exportar');
      return;
    }

    setIsModalOpen(true);
  };

  const getButtonText = () => {
    switch (size) {
      case 'sm':
        return '';
      case 'lg':
        return 'Exportar Reporte';
      default:
        return 'Exportar';
    }
  };

  const getIcon = () => {
    return size === 'sm' ? <Download className="h-4 w-4" /> : <Download className="h-4 w-4 mr-2" />;
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleExportClick}
        className={className}
        disabled={!user || !data}
      >
        {getIcon()}
        {getButtonText()}
      </Button>

      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        toolType={toolType}
        data={data}
        title={title}
        userPlan={userPlan}
      />
    </>
  );
}

// Componente específico para dropdown de exportación
export function ExportDropdown({ 
  toolType, 
  data, 
  title 
}: { 
  toolType: string; 
  data: any; 
  title: string; 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, userPlan } = useAuth();

  const handleQuickExport = async (format: 'pdf' | 'csv' | 'json') => {
    if (!user) {
      toast.error('Debes iniciar sesión para exportar reportes');
      return;
    }

    if (!data || Object.keys(data).length === 0) {
      toast.error('No hay datos disponibles para exportar');
      return;
    }

    try {
      const response = await fetch(`/api/export/${format === 'pdf' ? 'pdf' : 'data'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolType,
          data,
          title,
          format,
          options: {
            template: 'professional',
            includeBranding: userPlan === 'premium',
            includeCharts: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar el reporte');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      const extension = format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : 'json';
      const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${extension}`;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Reporte ${format.toUpperCase()} descargado exitosamente`);
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Error al exportar el reporte');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Botones de exportación rápida */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickExport('pdf')}
        disabled={!user || !data}
        title="Exportar PDF"
      >
        <FileText className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickExport('csv')}
        disabled={!user || !data}
        title="Exportar CSV"
      >
        <FileSpreadsheet className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickExport('json')}
        disabled={!user || !data}
        title="Exportar JSON"
      >
        <FileJson className="h-4 w-4" />
      </Button>

      {/* Botón para opciones avanzadas */}
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        disabled={!user || !data}
      >
        <Download className="h-4 w-4 mr-2" />
        Opciones
      </Button>

      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        toolType={toolType}
        data={data}
        title={title}
        userPlan={userPlan}
      />
    </div>
  );
}