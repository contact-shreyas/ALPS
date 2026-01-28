import { z } from 'zod'

// Base schemas
export const DatasetSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.string(),
  coveragePct: z.number().min(0).max(100),
  lastUpdatedAt: z.string().datetime(),
  status: z.enum(['active', 'syncing', 'error']),
  recordCount: z.number().optional(),
  sizeBytes: z.number().optional(),
  format: z.string().optional(),
  description: z.string().optional(),
})

export const AlertSchema = z.object({
  id: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  title: z.string(),
  details: z.string(),
  source: z.string(),
  region: z.string(),
  createdAt: z.string().datetime(),
  acknowledgedAt: z.string().datetime().nullable(),
  entity: z.object({
    code: z.string(),
    name: z.string(),
    region: z.string(),
  }).optional(),
})

export const TrendingEntitySchema = z.object({
  code: z.string(),
  name: z.string(),
  region: z.string(),
  score: z.number(),
  spark: z.array(z.number()),
  radiance: z.number().optional(),
  severity: z.enum(['low', 'medium', 'high', 'extreme']).optional(),
})

// API Response schemas
export const DatasetsResponseSchema = z.object({
  datasets: z.array(DatasetSchema),
  total: z.number(),
})

export const AlertsResponseSchema = z.object({
  items: z.array(AlertSchema),
  totalPages: z.number(),
  currentPage: z.number(),
  total: z.number(),
})

export const TrendingEntitiesResponseSchema = z.object({
  topItems: z.array(TrendingEntitySchema),
  timestamp: z.string().datetime(),
})

// TypeScript types
export type Dataset = z.infer<typeof DatasetSchema>
export type Alert = z.infer<typeof AlertSchema>
export type TrendingEntity = z.infer<typeof TrendingEntitySchema>
export type DatasetsResponse = z.infer<typeof DatasetsResponseSchema>
export type AlertsResponse = z.infer<typeof AlertsResponseSchema>
export type TrendingEntitiesResponse = z.infer<typeof TrendingEntitiesResponseSchema>