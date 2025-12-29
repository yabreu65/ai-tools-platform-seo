import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '../../../../lib/auth'
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: analysisId } = await params

    // Buscar análisis
    const analysis = mockAnalyses.find(
      a => a.analysis.id === analysisId && a.analysis.userId === payload.id
    )

    if (!analysis) {
      return NextResponse.json({ error: 'Análisis no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Error fetching analysis:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: analysisId } = await params
    const body = await request.json()

    // Buscar análisis
    const analysisIndex = mockAnalyses.findIndex(
      a => a.analysis.id === analysisId && a.analysis.userId === payload.id
    )

    if (analysisIndex === -1) {
      return NextResponse.json({ error: 'Análisis no encontrado' }, { status: 404 })
    }

    // Actualizar análisis
    const updatedAnalysis = {
      ...mockAnalyses[analysisIndex],
      ...body,
      updatedAt: new Date()
    }

    mockAnalyses[analysisIndex] = updatedAnalysis

    return NextResponse.json({ 
      message: 'Análisis actualizado correctamente',
      analysis: updatedAnalysis 
    })
  } catch (error) {
    console.error('Error updating analysis:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: analysisId } = await params

    // Buscar análisis
    const analysisIndex = mockAnalyses.findIndex(
      a => a.analysis.id === analysisId && a.analysis.userId === payload.id
    )

    if (analysisIndex === -1) {
      return NextResponse.json({ error: 'Análisis no encontrado' }, { status: 404 })
    }

    // Eliminar análisis
    mockAnalyses.splice(analysisIndex, 1)

    return NextResponse.json({ message: 'Análisis eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting analysis:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}