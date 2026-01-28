"use client";

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import VisualizationControls from './VisualizationControls';

// Types for our enhanced 3D data visualization
interface LightPollutionPoint {
  id: string;
  latitude: number;
  longitude: number;
  brightness: number;
  timestamp: string;
  district?: string;
  type?: 'hotspot' | 'historical' | 'demo' | 'prediction';
  severity?: 'low' | 'medium' | 'high' | 'extreme';
  trend?: 'increasing' | 'decreasing' | 'stable';
  confidence?: number; // 0-1 confidence score for AI predictions
}

interface VisualizationData {
  points: LightPollutionPoint[];
  timeRange: {
    start: Date;
    end: Date;
  };
  metadata?: {
    totalRegions: number;
    averageBrightness: number;
    trendDirection: 'improving' | 'worsening' | 'stable';
    lastAIAnalysis?: string;
  };
}

interface ViewSettings {
  showPredictions: boolean;
  showHeatZones: boolean;
  timeWindow: '1h' | '6h' | '24h' | '7d';
  colorMode: 'brightness' | 'severity' | 'trend' | 'age';
  animationSpeed: number;
  maxPoints: number;
}

// Enhanced 3D-style visualization with AI predictions and advanced features
function Enhanced3DVisualization({ 
  data, 
  viewSettings, 
  onPointSelect,
  className = ""
}: { 
  data: VisualizationData; 
  viewSettings: ViewSettings;
  onPointSelect: (point: LightPollutionPoint | null) => void;
  className?: string;
}) {
  const [animationFrame, setAnimationFrame] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  
  // Enhanced animation loop with variable speed
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + viewSettings.animationSpeed);
    }, 100 / viewSettings.animationSpeed); // Adjustable animation speed
    
    return () => clearInterval(interval);
  }, [viewSettings.animationSpeed]);

  if (!data.points.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-lg mb-2">🌍</div>
          <div>Waiting for light pollution data...</div>
          <div className="text-sm mt-1 opacity-75">Real-time stream initializing</div>
        </div>
      </div>
    );
  }

  // Calculate ranges for scaling
  const latRange = [
    Math.min(...data.points.map(p => p.latitude)),
    Math.max(...data.points.map(p => p.latitude))
  ];
  const lngRange = [
    Math.min(...data.points.map(p => p.longitude)),
    Math.max(...data.points.map(p => p.longitude))
  ];
  const brightnessRange = [
    Math.min(...data.points.map(p => p.brightness)),
    Math.max(...data.points.map(p => p.brightness))
  ];

  return (
    <div className="relative h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Pseudo-3D axes */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full">
          {/* X-axis (Longitude) */}
          <line x1="10%" y1="90%" x2="90%" y2="90%" stroke="#666" strokeWidth="2" />
          {/* Y-axis (Latitude) */}
          <line x1="10%" y1="90%" x2="10%" y2="10%" stroke="#666" strokeWidth="2" />
          {/* Z-axis (Time) - diagonal for 3D effect */}
          <line x1="10%" y1="90%" x2="30%" y2="70%" stroke="#666" strokeWidth="2" />
          
          {/* Axis labels */}
          <text x="50%" y="97%" fill="#999" fontSize="12" textAnchor="middle">
            Longitude ({lngRange[0].toFixed(2)}° to {lngRange[1].toFixed(2)}°)
          </text>
          <text x="5%" y="50%" fill="#999" fontSize="12" textAnchor="middle" transform="rotate(-90 5 50)">
            Latitude ({latRange[0].toFixed(2)}° to {latRange[1].toFixed(2)}°)
          </text>
          <text x="25%" y="75%" fill="#999" fontSize="12" textAnchor="middle" transform="rotate(-45 25 75)">
            Time
          </text>
        </svg>
      </div>

      {/* Enhanced data points with AI predictions and advanced features */}
      <div className="absolute inset-0 p-8">
        {data.points.slice(0, viewSettings.maxPoints).map((point, index) => {
          // Convert geographic coordinates to screen positions
          const x = ((point.longitude - lngRange[0]) / (lngRange[1] - lngRange[0])) * 70 + 10;
          const y = (1 - (point.latitude - latRange[0]) / (latRange[1] - latRange[0])) * 70 + 10;
          
          // Enhanced time offset calculation
          const timeAge = Date.now() - new Date(point.timestamp).getTime();
          const timeOffset = Math.min((timeAge / (60 * 60 * 1000)) * 5, 20);
          
          // Dynamic color based on view mode
          const normalizedBrightness = Math.max(0, Math.min(1, 
            (point.brightness - brightnessRange[0]) / (brightnessRange[1] - brightnessRange[0])
          ));
          
          let color: string;
          let size: number;
          
          // Color mode switching
          switch (viewSettings.colorMode) {
            case 'severity':
              const severityColors = {
                low: 'hsl(120, 100%, 50%)',    // Green
                medium: 'hsl(60, 100%, 50%)',  // Yellow
                high: 'hsl(30, 100%, 50%)',    // Orange
                extreme: 'hsl(0, 100%, 50%)'   // Red
              };
              color = severityColors[point.severity || 'low'];
              break;
            
            case 'trend':
              const trendColors = {
                increasing: 'hsl(0, 100%, 60%)',   // Red
                stable: 'hsl(60, 100%, 60%)',      // Yellow
                decreasing: 'hsl(120, 100%, 60%)'  // Green
              };
              color = trendColors[point.trend || 'stable'];
              break;
            
            case 'age':
              const ageIntensity = Math.max(0.3, 1 - (timeAge / (24 * 60 * 60 * 1000))); // Fade over 24h
              color = `hsl(240, 100%, ${30 + ageIntensity * 50}%)`;
              break;
            
            default: // brightness
              if (normalizedBrightness < 0.3) {
                color = `hsl(240, 100%, ${30 + normalizedBrightness * 50}%)`;
              } else if (normalizedBrightness < 0.7) {
                color = `hsl(${240 - (normalizedBrightness - 0.3) * 600}, 100%, 50%)`;
              } else {
                color = `hsl(${60 - (normalizedBrightness - 0.7) * 60}, 100%, 50%)`;
              }
          }
          
          // Enhanced size calculation with AI predictions
          const baseSize = Math.max(4, normalizedBrightness * 16);
          const isPrediction = point.type === 'prediction';
          const isHovered = hoveredPoint === point.id;
          
          // Special effects for different point types
          let pulseEffect = 1;
          if (isPrediction && viewSettings.showPredictions) {
            pulseEffect = 1 + Math.sin(animationFrame * 0.3 + index) * 0.4; // More dramatic pulse for predictions
          } else if (normalizedBrightness > 0.7) {
            pulseEffect = 1 + Math.sin(animationFrame * 0.2 + index) * 0.2;
          }
          
          size = baseSize * pulseEffect * (isHovered ? 1.5 : 1);
          
          // Enhanced animations
          const isRecent = timeAge < 10 * 60 * 1000;
          const floatOffset = isRecent ? Math.sin(animationFrame * 0.1 + index) * 2 : 0;
          
          // AI confidence visualization for predictions
          const confidenceRing = isPrediction && point.confidence ? 
            `0 0 ${size * 3}px hsla(${point.confidence * 120}, 100%, 50%, 0.3)` : '';

          return (
            <div
              key={point.id}
              className={`absolute rounded-full shadow-lg transition-all duration-500 cursor-pointer group ${
                isPrediction ? 'border-2 border-dashed border-white animate-pulse' : ''
              }`}
              style={{
                left: `${x - timeOffset * 0.1}%`,
                top: `${y - timeOffset * 0.1 + floatOffset}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                boxShadow: `0 0 ${size * 2}px ${color}40, 0 0 ${size}px ${color}80, ${confidenceRing}`,
                zIndex: isPrediction ? 200 : 100 - Math.floor(timeOffset),
                opacity: isPrediction ? 0.8 : Math.max(0.6, 1 - timeOffset * 0.03),
                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
              }}
              onMouseEnter={() => setHoveredPoint(point.id)}
              onMouseLeave={() => setHoveredPoint(null)}
              onClick={() => onPointSelect(point)}
            >
              {/* Enhanced tooltip with AI insights */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 max-w-xs">
                <div className="font-bold text-blue-300">{point.district || 'Unknown Region'}</div>
                <div className="mt-1">
                  <div>🔆 Brightness: {point.brightness.toFixed(2)} nW/cm²/sr</div>
                  <div>📍 Coords: {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}</div>
                  <div>⏰ Time: {new Date(point.timestamp).toLocaleTimeString('en-US', { hour12: false })}</div>
                  {point.severity && <div>⚠️ Severity: {point.severity.toUpperCase()}</div>}
                  {point.trend && <div>📈 Trend: {point.trend}</div>}
                  {isPrediction && (
                    <div className="mt-2 text-yellow-300">
                      <div>🤖 AI Prediction</div>
                      {point.confidence && <div>🎯 Confidence: {(point.confidence * 100).toFixed(0)}%</div>}
                    </div>
                  )}
                  {isRecent && <div className="text-green-400 mt-1">🔴 LIVE DATA</div>}
                </div>
              </div>
              
              {/* Type indicator icons */}
              {isPrediction && (
                <div className="absolute -top-1 -right-1 text-xs">🤖</div>
              )}
              {point.type === 'hotspot' && (
                <div className="absolute -top-1 -right-1 text-xs">🚨</div>
              )}
            </div>
          );
        })}
        
        {/* AI-powered heat zones visualization */}
        {viewSettings.showHeatZones && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Render heat zones based on data density */}
            {(() => {
              const heatZones = [];
              const gridSize = 10;
              for (let gridX = 0; gridX < gridSize; gridX++) {
                for (let gridY = 0; gridY < gridSize; gridY++) {
                  const zonePoints = data.points.filter(point => {
                    const x = ((point.longitude - lngRange[0]) / (lngRange[1] - lngRange[0])) * gridSize;
                    const y = (1 - (point.latitude - latRange[0]) / (latRange[1] - latRange[0])) * gridSize;
                    return Math.floor(x) === gridX && Math.floor(y) === gridY;
                  });
                  
                  if (zonePoints.length > 2) {
                    const avgBrightness = zonePoints.reduce((sum, p) => sum + p.brightness, 0) / zonePoints.length;
                    const intensity = Math.min(0.4, avgBrightness / 100);
                    
                    heatZones.push(
                      <div
                        key={`heat-${gridX}-${gridY}`}
                        className="absolute rounded-lg"
                        style={{
                          left: `${(gridX / gridSize) * 80 + 10}%`,
                          top: `${(gridY / gridSize) * 80 + 10}%`,
                          width: `${80 / gridSize}%`,
                          height: `${80 / gridSize}%`,
                          backgroundColor: `rgba(255, 0, 0, ${intensity})`,
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      />
                    );
                  }
                }
              }
              return heatZones;
            })()}
          </div>
        )}
      </div>

      {/* Grid lines for depth */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
            <g key={ratio}>
              <line
                x1={`${10 + ratio * 20}%`}
                y1={`${90 - ratio * 20}%`}
                x2={`${90 + ratio * 20}%`}
                y2={`${90 - ratio * 20}%`}
                stroke="#333"
                strokeWidth="1"
              />
              <line
                x1={`${10 + ratio * 20}%`}
                y1={`${90 - ratio * 20}%`}
                x2={`${10 + ratio * 20}%`}
                y2={`${10 - ratio * 20}%`}
                stroke="#333"
                strokeWidth="1"
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// Main 3D Visualization Component  
export default function RealTime3DVisualization() {
  const [visualizationData, setVisualizationData] = useState<VisualizationData>({
    points: [],
    timeRange: { start: new Date(), end: new Date() }
  });
  const [dataBuffer, setDataBuffer] = useState<LightPollutionPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  
  // Enhanced view settings with AI capabilities
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    showPredictions: true,
    showHeatZones: true,
    timeWindow: '1h',
    colorMode: 'brightness',
    animationSpeed: 1.0,
    maxPoints: 50
  });
  
  // AI Analysis state
  const [aiInsights, setAiInsights] = useState<{
    trendAnalysis: string;
    predictions: LightPollutionPoint[];
    riskAreas: string[];
    recommendations: string[];
  }>({
    trendAnalysis: '',
    predictions: [],
    riskAreas: [],
    recommendations: []
  });
  
  const [selectedPoint, setSelectedPoint] = useState<LightPollutionPoint | null>(null);
  
  // Performance optimization: Debounce data updates to prevent excessive re-renders
  useEffect(() => {
    const updateTimer = setTimeout(() => {
      if (dataBuffer.length > 0) {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        
        // Filter and limit data for optimal performance
        const filteredPoints = dataBuffer
          .filter(point => new Date(point.timestamp) > oneHourAgo) // Only recent data
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) // Sort by time
          .slice(0, 100); // Limit to 100 points for performance
        
        setVisualizationData({
          points: filteredPoints,
          timeRange: { start: oneHourAgo, end: now }
        });
        
        setLastUpdateTime(now);
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(updateTimer);
  }, [dataBuffer]);

  // Set up Server-Sent Events connection for real-time data streaming
  useEffect(() => {
    const eventSource = new EventSource('/api/stream/light-pollution');
    
    eventSource.onopen = () => {
      setConnectionStatus('connected');
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'connected') {
          console.log('3D Visualization: Connected to real-time stream');
          setConnectionStatus('connected');
        } else if (message.type === 'update') {
          // Add new data to buffer for debounced processing
          const newPoints = message.data.points || [];
          
          setDataBuffer(prevBuffer => {
            // Merge new points with existing buffer, avoiding duplicates
            const existingIds = new Set(prevBuffer.map(p => p.id));
            const uniqueNewPoints = newPoints.filter((p: LightPollutionPoint) => !existingIds.has(p.id));
            
            // Keep only recent data in buffer (last 2 hours)
            const now = new Date();
            const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
            
            const recentPoints = [...prevBuffer, ...uniqueNewPoints]
              .filter(point => new Date(point.timestamp) > twoHoursAgo)
              .slice(-200); // Keep maximum 200 points in buffer
            
            return recentPoints;
          });
          
          setIsLoading(false);
          setError(null);
        } else if (message.type === 'error') {
          setError(message.message);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
        setError('Failed to parse real-time data');
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      setConnectionStatus('disconnected');
      setError('Connection to real-time data stream lost');
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (eventSource.readyState === EventSource.CLOSED) {
          setConnectionStatus('connecting');
        }
      }, 5000);
    };

    // Cleanup on component unmount
    return () => {
      eventSource.close();
    };
  }, []);

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          3D Light Pollution Visualization
        </h3>
        <div className="text-red-600 dark:text-red-400">
          Error loading visualization: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              3D Light Pollution Visualization
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time 3D view of light pollution across geographic coordinates and time
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {visualizationData.points.length} active points
              <span className="ml-2 opacity-75">
                ({dataBuffer.length} in buffer)
              </span>
            </div>
            
            {/* Connection status indicator */}
            <div className="flex items-center space-x-1">
              <div 
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {connectionStatus === 'connected' ? 'Live' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 'Disconnected'}
              </span>
            </div>

            {isLoading && (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      </div>

      <div className="h-96 bg-gray-900 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-sm">Loading 3D visualization...</div>
          </div>
        ) : (
          <>
            <Enhanced3DVisualization 
              data={visualizationData} 
              viewSettings={viewSettings}
              onPointSelect={setSelectedPoint}
              className="h-full"
            />
            <VisualizationControls
              viewSettings={viewSettings}
              onSettingsChange={setViewSettings}
              aiInsights={{
                riskLevel: visualizationData.points.filter(p => p.brightness > 80).length > 10 ? 'critical' :
                          visualizationData.points.filter(p => p.brightness > 60).length > 5 ? 'high' :
                          visualizationData.points.filter(p => p.brightness > 40).length > 3 ? 'medium' : 'low',
                predictedHotspots: visualizationData.points.filter(p => p.type === 'prediction').length,
                trendAnalysis: visualizationData.points.filter(p => p.trend === 'increasing').length > 
                              visualizationData.points.filter(p => p.trend === 'decreasing').length ? 
                              'Increasing pollution trend detected' : 'Stable pollution levels'
              }}
            />
          </>
        )}
      </div>

      {/* Legend and controls */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="font-medium text-gray-900 dark:text-white mb-2">Color Scale</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-900 rounded"></div>
              <span className="text-gray-600 dark:text-gray-300">Low pollution</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-300">Medium pollution</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span className="text-gray-600 dark:text-gray-300">High pollution</span>
            </div>
          </div>
          
          <div>
            <div className="font-medium text-gray-900 dark:text-white mb-2">Axes</div>
            <div className="text-gray-600 dark:text-gray-300">
              <div>X-axis: Longitude</div>
              <div>Y-axis: Latitude</div>
              <div>Z-axis: Time (depth)</div>
            </div>
          </div>
          
          <div>
            <div className="font-medium text-gray-900 dark:text-white mb-2">Status</div>
            <div className="text-gray-600 dark:text-gray-300">
              <div>
                Status: 
                <span className={`ml-1 ${
                  connectionStatus === 'connected' ? 'text-green-600' :
                  connectionStatus === 'connecting' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {connectionStatus}
                </span>
              </div>
              <div>Updated: {lastUpdateTime.toLocaleTimeString('en-US', { hour12: false })}</div>
              <div>Hover points for details</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}