import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../ui/LoadingSpinner';

type AnalysisData = {
  trend: number;
  percentChange: number;
  hotspots: number;
  coverage: number;
  comparisonYear?: number;
};

type AnalysisPanelProps = {
  selectedRegion?: string;
  onSelectRegion?: (region: string | null) => void;
  timeRange: [Date, Date];
  onTimeRangeChange: (range: [Date, Date]) => void;
};

export function AnalysisPanel({ 
  selectedRegion, 
  onSelectRegion,
  timeRange,
  onTimeRangeChange
}: AnalysisPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [analysisType, setAnalysisType] = useState<'trend' | 'comparison'>('trend');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalysisData | null>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: selectedRegion,
          timeRange,
          type: analysisType
        })
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg z-10
                 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        title="Analysis Tools"
      >
        <AdjustmentsHorizontalIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-lg z-50"
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analysis Tools</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Analysis Type Selector */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setAnalysisType('trend')}
                  className={`flex-1 p-3 rounded-lg border ${
                    analysisType === 'trend'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } transition-colors duration-200`}
                >
                  <ArrowTrendingUpIcon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Trend Analysis</span>
                </button>
                <button
                  onClick={() => setAnalysisType('comparison')}
                  className={`flex-1 p-3 rounded-lg border ${
                    analysisType === 'comparison'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } transition-colors duration-200`}
                >
                  <ChartBarIcon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Year Comparison</span>
                </button>
              </div>

              {/* Region Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Region
                </label>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {selectedRegion || 'Click on map to select a region'}
                  </span>
                  {selectedRegion && (
                    <button
                      onClick={() => onSelectRegion?.(null)}
                      className="ml-auto text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Analysis Results */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <LoadingSpinner />
                  </div>
                ) : data ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Trend</div>
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {data.trend > 0 ? '+' : ''}{data.trend}%
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Change</div>
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {data.percentChange > 0 ? '+' : ''}{data.percentChange}%
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Hotspots</div>
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {data.hotspots}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Coverage</div>
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {data.coverage}%
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <ChartBarIcon className="w-8 h-8 mb-2" />
                    <p className="text-sm">Select a region and analysis type to begin</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={fetchAnalysis}
                  disabled={!selectedRegion || loading}
                  className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white disabled:bg-gray-300 
                           dark:disabled:bg-gray-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    'Run Analysis'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}