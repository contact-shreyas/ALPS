import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Generate sample analytics data
    const now = new Date()
    const labels = []
    const detections = []
    const accuracy = []
    const coverage = []

    // Generate 30 days of data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      
      // Random data for visualization
      detections.push(Math.floor(Math.random() * 100) + 50)
      accuracy.push(Math.floor(Math.random() * 30) + 70)
      coverage.push(Math.floor(Math.random() * 20) + 80)
    }

    return NextResponse.json({
      labels,
      detections,
      accuracy,
      coverage
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
