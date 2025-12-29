import { NextRequest, NextResponse } from 'next/server';

interface DisavowEntry {
  type: 'domain' | 'url';
  value: string;
  reason: string;
  toxicityScore?: number;
  dateAdded: string;
  source?: 'manual' | 'audit' | 'import';
}

interface DisavowGenerateRequest {
  domain: string;
  entries: DisavowEntry[];
  includeComments?: boolean;
  groupByReason?: boolean;
  format?: 'google' | 'bing';
}

interface DisavowFileResponse {
  success: boolean;
  data?: {
    fileContent: string;
    fileName: string;
    fileSize: number;
    totalEntries: number;
    domainEntries: number;
    urlEntries: number;
    downloadUrl: string;
    generatedAt: string;
    statistics: {
      byReason: Record<string, number>;
      bySource: Record<string, number>;
      averageToxicityScore: number;
    };
  };
  message?: string;
}

// Generar contenido del archivo disavow
const generateDisavowContent = (
  entries: DisavowEntry[], 
  includeComments: boolean = true, 
  groupByReason: boolean = false,
  format: 'google' | 'bing' = 'google'
): string => {
  let content = '';
  
  // Encabezado del archivo
  if (includeComments) {
    content += `# Disavow file generated on ${new Date().toISOString().split('T')[0]}\n`;
    content += `# This file contains ${entries.length} entries to disavow\n`;
    content += `# Format: ${format.toUpperCase()}\n`;
    content += `# Use this file with Google Search Console's Disavow Tool\n`;
    content += `#\n`;
  }

  if (groupByReason) {
    // Agrupar por razón
    const groupedEntries = entries.reduce((groups, entry) => {
      const reason = entry.reason || 'Other';
      if (!groups[reason]) {
        groups[reason] = [];
      }
      groups[reason].push(entry);
      return groups;
    }, {} as Record<string, DisavowEntry[]>);

    // Generar contenido agrupado
    Object.entries(groupedEntries).forEach(([reason, reasonEntries]) => {
      if (includeComments) {
        content += `\n# ${reason} (${reasonEntries.length} entries)\n`;
      }
      
      reasonEntries.forEach(entry => {
        if (includeComments && entry.toxicityScore) {
          content += `# Toxicity Score: ${entry.toxicityScore}/100\n`;
        }
        
        if (entry.type === 'domain') {
          content += `domain:${entry.value}\n`;
        } else {
          content += `${entry.value}\n`;
        }
      });
    });
  } else {
    // Generar contenido secuencial
    entries.forEach(entry => {
      if (includeComments) {
        content += `# ${entry.reason}`;
        if (entry.toxicityScore) {
          content += ` (Toxicity: ${entry.toxicityScore}/100)`;
        }
        content += `\n`;
      }
      
      if (entry.type === 'domain') {
        content += `domain:${entry.value}\n`;
      } else {
        content += `${entry.value}\n`;
      }
    });
  }

  return content;
};

// Calcular estadísticas del archivo
const calculateStatistics = (entries: DisavowEntry[]) => {
  const byReason = entries.reduce((acc, entry) => {
    const reason = entry.reason || 'Other';
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bySource = entries.reduce((acc, entry) => {
    const source = entry.source || 'manual';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const toxicityScores = entries
    .filter(entry => entry.toxicityScore !== undefined)
    .map(entry => entry.toxicityScore!);
  
  const averageToxicityScore = toxicityScores.length > 0
    ? Math.round(toxicityScores.reduce((sum, score) => sum + score, 0) / toxicityScores.length)
    : 0;

  return {
    byReason,
    bySource,
    averageToxicityScore
  };
};

export async function POST(request: NextRequest) {
  try {
    const body: DisavowGenerateRequest = await request.json();
    
    if (!body.domain) {
      return NextResponse.json(
        { success: false, message: 'Domain is required' },
        { status: 400 }
      );
    }

    if (!body.entries || body.entries.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one entry is required' },
        { status: 400 }
      );
    }

    // Validar entradas
    for (const entry of body.entries) {
      if (!entry.value || !entry.reason) {
        return NextResponse.json(
          { success: false, message: 'Each entry must have a value and reason' },
          { status: 400 }
        );
      }
      
      if (entry.type === 'domain' && !entry.value.includes('.')) {
        return NextResponse.json(
          { success: false, message: `Invalid domain format: ${entry.value}` },
          { status: 400 }
        );
      }
      
      if (entry.type === 'url' && !entry.value.startsWith('http')) {
        return NextResponse.json(
          { success: false, message: `Invalid URL format: ${entry.value}` },
          { status: 400 }
        );
      }
    }

    // Simular tiempo de generación
    await new Promise(resolve => setTimeout(resolve, 1000));

    const includeComments = body.includeComments !== false;
    const groupByReason = body.groupByReason === true;
    const format = body.format || 'google';

    // Generar contenido del archivo
    const fileContent = generateDisavowContent(
      body.entries, 
      includeComments, 
      groupByReason, 
      format
    );

    // Calcular métricas
    const totalEntries = body.entries.length;
    const domainEntries = body.entries.filter(entry => entry.type === 'domain').length;
    const urlEntries = body.entries.filter(entry => entry.type === 'url').length;
    const fileSize = new Blob([fileContent]).size;
    const statistics = calculateStatistics(body.entries);

    // Generar nombre de archivo
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `disavow-${body.domain.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.txt`;

    // En una implementación real, aquí se subiría el archivo a un servicio de almacenamiento
    // Por ahora, simulamos una URL de descarga
    const downloadUrl = `/api/backlink-checker/disavow/download/${fileName}`;

    const response: DisavowFileResponse = {
      success: true,
      data: {
        fileContent,
        fileName,
        fileSize,
        totalEntries,
        domainEntries,
        urlEntries,
        downloadUrl,
        generatedAt: new Date().toISOString(),
        statistics
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating disavow file:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET para obtener plantillas de disavow
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateType = searchParams.get('template');

    if (templateType === 'sample') {
      // Devolver entradas de ejemplo
      const sampleEntries: DisavowEntry[] = [
        {
          type: 'domain',
          value: 'spammy-site.com',
          reason: 'Low-quality spam domain',
          toxicityScore: 95,
          dateAdded: new Date().toISOString(),
          source: 'audit'
        },
        {
          type: 'url',
          value: 'http://bad-directory.net/links/page1.html',
          reason: 'Paid link directory',
          toxicityScore: 87,
          dateAdded: new Date().toISOString(),
          source: 'manual'
        },
        {
          type: 'domain',
          value: 'link-farm.org',
          reason: 'Link farm network',
          toxicityScore: 92,
          dateAdded: new Date().toISOString(),
          source: 'audit'
        }
      ];

      return NextResponse.json({
        success: true,
        data: {
          sampleEntries,
          reasons: [
            'Low-quality spam domain',
            'Paid link directory',
            'Link farm network',
            'Hacked website',
            'Irrelevant content',
            'Negative SEO attack',
            'Automated spam',
            'Adult content',
            'Gambling site',
            'Pharmacy spam'
          ]
        }
      });
    }

    // Devolver información general sobre disavow
    return NextResponse.json({
      success: true,
      data: {
        supportedFormats: ['google', 'bing'],
        maxFileSize: '2MB',
        maxEntries: 100000,
        guidelines: [
          'Use domain: prefix for entire domains',
          'Use full URLs for specific pages',
          'One entry per line',
          'Comments start with #',
          'File must be UTF-8 encoded',
          'Maximum file size is 2MB'
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching disavow templates:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}