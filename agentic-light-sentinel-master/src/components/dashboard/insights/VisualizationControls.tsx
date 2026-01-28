'use client';

import React, { useState } from 'react';

interface VisualizationControlsProps {
  viewSettings: {
    colorMode: 'brightness' | 'severity' | 'trend' | 'age';
    showPredictions: boolean;
    showHeatZones: boolean;
    animationSpeed: number;
    maxPoints: number;
  };
  onSettingsChange: (settings: any) => void;
  aiInsights: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    predictedHotspots: number;
    trendAnalysis: string;
  };
}

export default function VisualizationControls({ 
  viewSettings, 
  onSettingsChange, 
  aiInsights 
}: VisualizationControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    onSettingsChange({
      ...viewSettings,
      [key]: value
    });
  };

  return (
    <div className="absolute top-4 left-4 z-20">
      {/* Control Panel Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-black/80 hover:bg-black/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
      >
        <span>🎛️</span>
        <span className="text-sm font-medium">AI Controls</span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>⌄</span>
      </button>

      {/* Expanded Control Panel */}
      {isExpanded && (
        <div className="mt-2 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white text-sm min-w-80 max-w-md shadow-2xl border border-gray-600">
          {/* AI Insights Header */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🤖</span>
              <span className="font-semibold text-blue-300">AI Analysis</span>
              <div className={`px-2 py-1 rounded text-xs font-bold ${
                aiInsights.riskLevel === 'critical' ? 'bg-red-500 text-white' :
                aiInsights.riskLevel === 'high' ? 'bg-orange-500 text-white' :
                aiInsights.riskLevel === 'medium' ? 'bg-yellow-500 text-black' :
                'bg-green-500 text-white'
              }`}>
                {aiInsights.riskLevel.toUpperCase()}
              </div>
            </div>
            <div className="text-xs text-gray-300 space-y-1">
              <div>🎯 Predicted hotspots: <span className="text-yellow-400 font-bold">{aiInsights.predictedHotspots}</span></div>
              <div>📈 Trend: <span className="text-blue-400">{aiInsights.trendAnalysis}</span></div>
            </div>
          </div>

          {/* Color Mode Controls */}
          <div className="mb-4">
            <label className="block text-gray-300 font-medium mb-2">🎨 Color Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'brightness', label: 'Brightness', icon: '💡' },
                { key: 'severity', label: 'Severity', icon: '⚠️' },
                { key: 'trend', label: 'Trend', icon: '📈' },
                { key: 'age', label: 'Data Age', icon: '⏰' },
              ].map(mode => (
                <button
                  key={mode.key}
                  onClick={() => handleSettingChange('colorMode', mode.key)}
                  className={`p-2 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                    viewSettings.colorMode === mode.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <span>{mode.icon}</span>
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <span>🤖</span>
                <span>AI Predictions</span>
              </label>
              <button
                onClick={() => handleSettingChange('showPredictions', !viewSettings.showPredictions)}
                className={`w-12 h-6 rounded-full transition-all duration-200 ${
                  viewSettings.showPredictions ? 'bg-blue-600' : 'bg-gray-600'
                } relative`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 ${
                  viewSettings.showPredictions ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <span>🔥</span>
                <span>Heat Zones</span>
              </label>
              <button
                onClick={() => handleSettingChange('showHeatZones', !viewSettings.showHeatZones)}
                className={`w-12 h-6 rounded-full transition-all duration-200 ${
                  viewSettings.showHeatZones ? 'bg-red-600' : 'bg-gray-600'
                } relative`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 ${
                  viewSettings.showHeatZones ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Animation Speed Control */}
          <div className="mb-4">
            <label className="block text-gray-300 font-medium mb-2">⚡ Animation Speed</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={viewSettings.animationSpeed}
              onChange={(e) => handleSettingChange('animationSpeed', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Slow</span>
              <span className="text-blue-400 font-bold">{viewSettings.animationSpeed}x</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Max Points Control */}
          <div className="mb-4">
            <label className="block text-gray-300 font-medium mb-2">📊 Max Points</label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={viewSettings.maxPoints}
              onChange={(e) => handleSettingChange('maxPoints', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10</span>
              <span className="text-green-400 font-bold">{viewSettings.maxPoints}</span>
              <span>100</span>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="p-3 bg-purple-900/30 rounded border border-purple-500/30">
            <div className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
              <span>💡</span>
              <span>AI Recommendations</span>
            </div>
            <div className="text-xs text-gray-300 space-y-1">
              {aiInsights.riskLevel === 'critical' && (
                <div className="text-red-300">⚠️ Enable all tracking features for emergency monitoring</div>
              )}
              {aiInsights.predictedHotspots > 10 && (
                <div className="text-yellow-300">🤖 Switch to Prediction mode to view forecasted areas</div>
              )}
              {viewSettings.maxPoints < 50 && (
                <div className="text-blue-300">📈 Consider increasing max points for better coverage</div>
              )}
              <div className="text-green-300">✅ Current settings optimized for real-time performance</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button 
              onClick={() => onSettingsChange({
                colorMode: 'brightness',
                showPredictions: true,
                showHeatZones: true,
                animationSpeed: 1.5,
                maxPoints: 50
              })}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors"
            >
              🎯 Optimal Settings
            </button>
            <button
              onClick={() => onSettingsChange({
                colorMode: 'severity',
                showPredictions: true,
                showHeatZones: false,
                animationSpeed: 2,
                maxPoints: 100
              })}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors"
            >
              🚨 Emergency Mode
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}