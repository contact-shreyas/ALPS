import { createContext, useContext, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'

// Types from the API response
export type DashboardData = {
  autonomousLoop: {
    sense: {
      status: 'success' | 'error' | 'running'
      lastRun: string | null
      errorCount: number
    }
    reason: {
      status: 'success' | 'error' | 'running'
      lastRun: string | null
      errorCount: number
    }
    act: {
      status: 'success' | 'error' | 'running'
      queueLength: number
      lastAction: string | null
    }
  }
  metrics: {
    hotspots: {
      last24h: number
      last7d: number
      trend: number
    }
    processing: {
      avgLatencyMs: number
      successRate: number
      totalProcessed: number
    }
    coverage: {
      percentage: number
      lastUpdate: string
    }
  }
  alerts: {
    active: {
      high: number
      medium: number
      low: number
    }
    recent: Array<{
      id: string
      level: string
      message: string
      severity: number
      createdAt: string
    }>
  }
  trends: {
    daily: Array<{
      date: string
      hotspots: number
      coverage: number
      processingTime: number
    }>
    topRegions: Array<{
      name: string
      count: number
    }>
  }
}

type DashboardContextType = {
  data: DashboardData | undefined
  isLoading: boolean
  error: unknown
  refetch: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to fetch dashboard data')
      return res.json()
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  })

  return (
    <DashboardContext.Provider value={{ data, isLoading, error, refetch }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}