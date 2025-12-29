'use client'

import { useState, useEffect } from 'react'
import { SavedAnalysis, AnalysisFilter } from '@/types/analysis'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface UseAnalysesReturn {
  analyses: SavedAnalysis[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  // Funciones
  fetchAnalyses: (filters?: AnalysisFilter) => Promise<void>
  saveAnalysis: (analysisData: Omit<SavedAnalysis, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<SavedAnalysis | null>
  updateAnalysis: (id: string, updates: Partial<SavedAnalysis>) => Promise<SavedAnalysis | null>
  deleteAnalysis: (id: string) => Promise<boolean>
  toggleFavorite: (id: string) => Promise<boolean>
  getAnalysis: (id: string) => Promise<SavedAnalysis | null>
}

export function useAnalyses(): UseAnalysesReturn {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const getAuthHeaders = () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1]

    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  const fetchAnalyses = async (filters: AnalysisFilter = {}) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.toolType) params.append('toolType', filters.toolType)
      if (filters.isFavorite !== undefined) params.append('isFavorite', filters.isFavorite.toString())
      if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','))

      const response = await fetch(`/api/analyses?${params.toString()}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Error al cargar los análisis')
      }

      const data = await response.json()
      setAnalyses(data.analyses)
      setPagination(data.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const saveAnalysis = async (
    analysisData: Omit<SavedAnalysis, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<SavedAnalysis | null> => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar análisis')
      return null
    }

    try {
      const response = await fetch('/api/analyses', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(analysisData)
      })

      if (!response.ok) {
        throw new Error('Error al guardar el análisis')
      }

      const data = await response.json()
      toast.success('Análisis guardado correctamente')
      
      // Actualizar la lista local
      setAnalyses(prev => [data.analysis, ...prev])
      
      return data.analysis
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar'
      toast.error(errorMessage)
      return null
    }
  }

  const updateAnalysis = async (
    id: string, 
    updates: Partial<SavedAnalysis>
  ): Promise<SavedAnalysis | null> => {
    if (!user) return null

    try {
      const response = await fetch(`/api/analyses/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el análisis')
      }

      const data = await response.json()
      toast.success('Análisis actualizado correctamente')
      
      // Actualizar la lista local
      setAnalyses(prev => 
        prev.map(analysis => 
          analysis.id === id ? data.analysis : analysis
        )
      )
      
      return data.analysis
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar'
      toast.error(errorMessage)
      return null
    }
  }

  const deleteAnalysis = async (id: string): Promise<boolean> => {
    if (!user) return false

    try {
      const response = await fetch(`/api/analyses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el análisis')
      }

      toast.success('Análisis eliminado correctamente')
      
      // Actualizar la lista local
      setAnalyses(prev => prev.filter(analysis => analysis.id !== id))
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar'
      toast.error(errorMessage)
      return false
    }
  }

  const toggleFavorite = async (id: string): Promise<boolean> => {
    if (!user) return false

    try {
      const response = await fetch(`/api/analyses/${id}/favorite`, {
        method: 'POST',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Error al cambiar favorito')
      }

      const data = await response.json()
      toast.success(data.message)
      
      // Actualizar la lista local
      setAnalyses(prev => 
        prev.map(analysis => 
          analysis.id === id ? data.analysis : analysis
        )
      )
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar favorito'
      toast.error(errorMessage)
      return false
    }
  }

  const getAnalysis = async (id: string): Promise<SavedAnalysis | null> => {
    if (!user) return null

    try {
      const response = await fetch(`/api/analyses/${id}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Error al cargar el análisis')
      }

      const data = await response.json()
      return data.analysis
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar'
      toast.error(errorMessage)
      return null
    }
  }

  // Cargar análisis al montar el componente
  useEffect(() => {
    if (user) {
      fetchAnalyses()
    }
  }, [user])

  return {
    analyses,
    loading,
    error,
    pagination,
    fetchAnalyses,
    saveAnalysis,
    updateAnalysis,
    deleteAnalysis,
    toggleFavorite,
    getAnalysis
  }
}