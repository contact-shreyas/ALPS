import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DatasetCard } from '@/components/dashboard/insights/DatasetCard'
import { AlertsTable } from '@/components/dashboard/insights/AlertsTable'

describe('Insights UI', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders dataset card with seeded data', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sources: [
          { id: '1', name: 'OpenFoodFacts', kind: 'FOOD', coveragePct: 75.5, lastUpdatedAt: new Date().toISOString() },
        ],
        alerts: { total: 0, high: 0, medium: 0, low: 0 },
        metrics: { avgLatency: 0, precisionAtK: 0.9, totalAlerts7d: 0, actionsSent: 0 },
        lastUpdated: new Date().toISOString(),
      }),
    } as any)

    render(<DatasetCard />)
    expect(await screen.findByText('Datasets')).toBeInTheDocument()
    expect(await screen.findByText('OpenFoodFacts')).toBeInTheDocument()
  })

  it('supports alerts pagination and severity filter', async () => {
    const fetchMock = vi.spyOn(global, 'fetch')
    // First load: all severities
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [
        { id: 'a1', severity: 'HIGH', title: 'X', details: 'd', createdAt: new Date().toISOString(), acknowledgedAt: null, entity: { code: 'C1', name: 'N1', region: 'R1' } },
      ], page: 1, pageSize: 10, totalPages: 2 }),
    } as any)
    // Second load (after filter to MEDIUM)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [
        { id: 'a2', severity: 'MEDIUM', title: 'Y', details: 'd', createdAt: new Date().toISOString(), acknowledgedAt: null, entity: { code: 'C2', name: 'N2', region: 'R2' } },
      ], page: 1, pageSize: 10, totalPages: 1 }),
    } as any)

    render(<AlertsTable />)
    expect(await screen.findByText('Hotspot Alerts')).toBeInTheDocument()
    expect(await screen.findByText('HIGH')).toBeInTheDocument()

    const select = await screen.findByLabelText('Severity filter')
    fireEvent.change(select, { target: { value: 'MEDIUM' } })

    await waitFor(() => {
      expect(screen.getByText('MEDIUM')).toBeInTheDocument()
    })
  })
})

