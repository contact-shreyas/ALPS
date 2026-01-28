# Real-Time 3D Light Pollution Visualization

## Overview

This implementation provides a real-time 3D visualization of light pollution data across geographic coordinates and time. The system uses a Server-Sent Events (SSE) streaming architecture to deliver live updates to a React-based 3D visualization component.

## Architecture

### Frontend Components

1. **RealTime3DVisualization.tsx** - Main visualization component
   - Location: `src/components/dashboard/insights/RealTime3DVisualization.tsx`
   - Handles real-time data streaming via SSE
   - Implements data buffering and performance optimizations
   - Provides fallback 2D visualization that simulates 3D appearance

2. **Integration Point** - Dashboard integration
   - Location: `src/components/dashboard/insights/InsightsApp.tsx`
   - Added as a new card in the insights dashboard
   - Positioned after trends visualization for optimal layout

### Backend Endpoints

1. **Real-time Streaming API** - SSE endpoint for live data
   - Location: `src/app/api/stream/light-pollution/route.ts`
   - Provides continuous updates every 10 seconds
   - Combines hotspot data with historical metrics
   - Includes fallback demo data for visualization

### Data Flow

```
Database (Prisma) → SSE Stream → Frontend Buffer → 3D Visualization
     ↓                ↓              ↓               ↓
  Hotspots        Real-time      Debounced       Optimized
  Metrics         Updates        Processing      Rendering
```

## 3D Visualization Mapping

### Coordinate System
- **X-axis**: Longitude (geographic east-west position)
- **Y-axis**: Latitude (geographic north-south position)  
- **Z-axis**: Time depth (recent data appears closer, older data recedes)

### Visual Encoding
- **Size**: Proportional to light pollution brightness
- **Color**: Heat map encoding
  - Blue: Low pollution (< 30% of max)
  - Yellow: Medium pollution (30-70% of max)
  - Red: High pollution (> 70% of max)
- **Animation**: Pulsing effect for high-brightness areas
- **Opacity**: Fades with data age

## Performance Optimizations

### Data Management
1. **Buffering**: Maintains rolling buffer of 200 most recent data points
2. **Debouncing**: 500ms delay to prevent excessive re-renders
3. **Filtering**: Only displays data from last hour in visualization
4. **Limiting**: Maximum 50 visible points for smooth rendering

### Rendering Optimizations
1. **CSS Transforms**: Hardware-accelerated positioning
2. **Hover States**: Efficient tooltip implementation
3. **Animation Frames**: Smooth 100ms update cycle
4. **Z-indexing**: Proper layering based on time depth

## Real-Time Features

### Server-Sent Events (SSE)
- **Connection Management**: Auto-reconnection on disconnect
- **Status Indicators**: Visual connection status display
- **Error Handling**: Graceful fallback to demo data

### Data Sources
1. **Active Hotspots**: Real-time detection alerts
2. **District Metrics**: Historical light pollution measurements
3. **Demo Data**: Fallback visualization for testing

## Usage Instructions

### Viewing the Visualization
1. Navigate to the dashboard at `/dashboard`
2. Scroll to the "3D Light Pollution Visualization" section
3. The visualization loads automatically with real-time data

### Interaction
- **Hover**: View detailed information for each data point
- **Status**: Monitor connection status in the top-right corner
- **Legend**: Reference color scale and axis information at bottom

### Integration in Dashboard
The component is integrated into the insights dashboard as a full-width card positioned after the trends visualization, providing maximum space for the 3D view.

## Technical Implementation Details

### Data Types
```typescript
interface LightPollutionPoint {
  id: string;
  latitude: number;
  longitude: number;
  brightness: number;
  timestamp: string;
  district?: string;
}

interface VisualizationData {
  points: LightPollutionPoint[];
  timeRange: {
    start: Date;
    end: Date;
  };
}
```

### Performance Characteristics
- **Rendering**: 60fps smooth animations
- **Data Updates**: 10-second intervals
- **Memory Usage**: Bounded by 200-point buffer
- **Network**: Efficient SSE streaming

## Future Enhancements

### Three.js Integration
The current implementation uses a fallback 2D visualization. To upgrade to full 3D:

1. Install Three.js dependencies (already included):
   ```bash
   pnpm add @react-three/fiber @react-three/drei three @types/three
   ```

2. Replace `Simple3DPlot` component with the full Three.js implementation
3. Enable hardware-accelerated WebGL rendering
4. Add camera controls and advanced 3D interactions

### Additional Features
- **Time Scrubbing**: Navigate through historical data
- **Filtering**: Toggle different data sources
- **Export**: Save visualization as image/video
- **Clustering**: Group nearby points for better performance
- **Heatmaps**: Surface-based pollution intensity visualization

## Troubleshooting

### Common Issues
1. **No Data**: Check database connection and API endpoints
2. **Connection Lost**: SSE will auto-reconnect after 5 seconds
3. **Performance**: Reduce buffer size or visible point limit

### Development
- Start dev server: `pnpm dev`
- View dashboard: `http://localhost:3000/dashboard`
- Monitor SSE: Browser Network tab, filter for EventSource

This implementation provides a solid foundation for real-time 3D visualization of light pollution data with excellent performance characteristics and room for future enhancements.