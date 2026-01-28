import prisma from '../src/lib/prisma'

async function main() {
  console.log('Seeding metrics...')

  // Clear existing metrics
  await prisma.metricHistory.deleteMany()

  // Add sample metrics for the last 7 days
  const now = new Date()
  const metrics = []

  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    // Add hotspot metrics
    metrics.push({
      type: 'HOTSPOT',
      value: Math.floor(Math.random() * 50) + 100, // 100-150 hotspots
      timestamp
    })
    
    // Add coverage metrics
    metrics.push({
      type: 'COVERAGE',
      value: Math.random() * 20 + 70, // 70-90% coverage
      timestamp
    })
    
    // Add processing time metrics
    metrics.push({
      type: 'PROCESSING_TIME',
      value: Math.random() * 2 + 1, // 1-3 seconds
      timestamp
    })
  }

  await prisma.metricHistory.createMany({
    data: metrics
  })

  console.log(`✓ Created ${metrics.length} metric records`)
}

main()
  .catch((e) => {
    console.error(e)
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1)
    }
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
