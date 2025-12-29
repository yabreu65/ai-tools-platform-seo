'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Download, ExternalLink } from 'lucide-react';

interface SharedResultViewProps {
  id: string;
}

function SharedResultView({ id }: SharedResultViewProps) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de resultado compartido
    const loadSharedResult = async () => {
      try {
        // Aquí iría la llamada a la API para obtener el resultado compartido
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setResult({
          id,
          title: 'Resultado Compartido',
          description: 'Este es un resultado compartido de ejemplo',
          data: {},
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error loading shared result:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSharedResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Resultado no encontrado</CardTitle>
            <CardDescription>
              El resultado compartido que buscas no existe o ha expirado.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{result.title}</CardTitle>
                <CardDescription>{result.description}</CardDescription>
              </div>
              <Badge variant="secondary">Compartido</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Contenido del resultado compartido...</p>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar enlace
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver original
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { SharedResultView };
export default SharedResultView;