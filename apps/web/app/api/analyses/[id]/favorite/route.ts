import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '../../../../../lib/auth'
import { SavedAnalysis } from '@/types/analysis'

// Mock database - en producción esto sería una base de datos real
const mockAnalyses: SavedAnalysis[] = [
  {
    analysis: {
      id: '1',
      userId: 'user1',
      title: 'Análisis SEO - Página Principal',
      toolType: 'seo-audit',
      input: {
        url: 'https://ejemplo.com'
      },
      output: {
        score: 85,
        issues: ['Missing meta description', 'Large images'],
        recommendations: ['Add meta description', 'Optimize images']
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      isFavorite: true,
      isPublic: false,
      tags: ['homepage', 'seo'],
      metadata: {
        executionTime: 1500,
        inputSize: 1024,
        outputSize: 2048,
        version: '1.0.0'
      }
    },
    user: {
      id: 'user1',
      name: 'Usuario Demo',
      avatar: 'https://example.com/avatar.jpg'
    }
  }
]

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Token de autenticación requerido' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const params = await context.params;
    const analysisId = params.id

    // Buscar análisis
    const analysisIndex = mockAnalyses.findIndex(
      a => a.analysis.id === analysisId && a.analysis.userId === payload.id
    )

    if (analysisIndex === -1) {
      return NextResponse.json({ error: 'Análisis no encontrado' }, { status: 404 })
    }

    // Alternar favorito
    mockAnalyses[analysisIndex].analysis.isFavorite = !mockAnalyses[analysisIndex].analysis.isFavorite
    mockAnalyses[analysisIndex].analysis.updatedAt = new Date()

    const action = mockAnalyses[analysisIndex].analysis.isFavorite ? 'añadido a' : 'eliminado de'

    return NextResponse.json({ 
      message: `Análisis ${action} favoritos`,
      analysis: mockAnalyses[analysisIndex]
    })
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}