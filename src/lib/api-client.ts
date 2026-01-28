import { Dataset, Alert, TrendingEntity, DatasetsResponseSchema, AlertsResponseSchema, TrendingEntitiesResponseSchema } from '../types/dashboard'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'APIError'
  }
}

async function apiRequest<T>(endpoint: string, schema: any): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new APIError(response.status, `API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    const validated = schema.parse(data)
    return validated
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const api = {
  datasets: {
    list: () => apiRequest<{ datasets: Dataset[]; total: number }>('/api/datasets', DatasetsResponseSchema),
  },
  alerts: {
    list: (params?: { page?: number; pageSize?: number; severity?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString())
      if (params?.severity) searchParams.set('severity', params.severity)
      
      const query = searchParams.toString()
      return apiRequest<{ items: Alert[]; totalPages: number; currentPage: number; total: number }>(
        `/api/alerts${query ? `?${query}` : ''}`,
        AlertsResponseSchema
      )
    },
  },
  entities: {
    trending: (params?: { range?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.range) searchParams.set('range', params.range)
      
      const query = searchParams.toString()
      return apiRequest<{ topItems: TrendingEntity[]; timestamp: string }>(
        `/api/entities/trending${query ? `?${query}` : ''}`,
        TrendingEntitiesResponseSchema
      )
    },
  },
}

// Formatter utilities
export const formatters = {
  timestamp: (isoString: string, locale = 'en-US') => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString))
  },
  
  fileSize: (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  },
  
  percentage: (value: number, decimals = 1) => {
    return `${value.toFixed(decimals)}%`
  },
}