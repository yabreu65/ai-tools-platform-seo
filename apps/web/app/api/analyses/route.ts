import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '../../../lib/auth'
import { SavedAnalysis, AnalysisFilter } from '@/types/analysis'

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
  },
  {
    analysis: {
      id: '2',
      userId: 'user1',
      title: 'Contenido Optimizado - Blog Post',
      toolType: 'content-optimizer',
      input: {
        originalText: 'Texto original...'
      },
      output: {
        optimizedText: 'Texto optimizado...',
        improvements: ['Better keywords', 'Improved readability']
      },
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-14'),
      isFavorite: false,
      isPublic: false,
      tags: ['blog', 'contenido'],
      metadata: {
        executionTime: 2000,
        inputSize: 1200,
        outputSize: 1800,
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

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const toolType = searchParams.get('toolType') || ''
    const isFavorite = searchParams.get('isFavorite') === 'true'
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []

    // Filtrar análisis del usuario
    let userAnalyses = mockAnalyses.filter(analysis => analysis.analysis.userId === payload.id)

    // Aplicar filtros
    if (search) {
      userAnalyses = userAnalyses.filter(analysis =>
        analysis.analysis.title.toLowerCase().includes(search.toLowerCase()) ||
        analysis.analysis.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }

    if (toolType) {
      userAnalyses = userAnalyses.filter(analysis => analysis.analysis.toolType === toolType)
    }

    if (isFavorite) {
      userAnalyses = userAnalyses.filter(analysis => analysis.analysis.isFavorite)
    }

    if (tags.length > 0) {
      userAnalyses = userAnalyses.filter(analysis =>
        tags.some(tag => analysis.analysis.tags.includes(tag))
      )
    }

    // Ordenar por fecha de actualización (más reciente primero)
    userAnalyses.sort((a, b) => b.analysis.updatedAt.getTime() - a.analysis.updatedAt.getTime())

    // Paginación
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedAnalyses = userAnalyses.slice(startIndex, endIndex)

    return NextResponse.json({
      analyses: paginatedAnalyses,
      pagination: {
        page,
        limit,
        total: userAnalyses.length,
        totalPages: Math.ceil(userAnalyses.length / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching analyses:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { title, toolType, input, output, tags = [], metadata = {} } = body

    // Crear nuevo análisis
    const newAnalysis: SavedAnalysis = {
      analysis: {
        id: Date.now().toString(),
        userId: payload.id,
        title,
        toolType,
        input,
        output,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
        isPublic: false,
        tags,
        metadata
      },
      user: {
        id: payload.id,
        name: payload.name || 'Usuario',
        avatar: 'https://example.com/avatar.jpg'
      }
    }

    // Agregar a la base de datos mock
    mockAnalyses.push(newAnalysis)

    return NextResponse.json({ analysis: newAnalysis }, { status: 201 })

  } catch (error) {
    console.error('Error creating analysis:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}