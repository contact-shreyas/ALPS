import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartBarIcon, MapIcon } from '@heroicons/react/24/outline';

type HistoricalBin = {
  c: string;
  t: string;
  desc: string;
  icon: string;
};

type LiveBin = {
  c: string;
  t: string;
  desc: string;
  gradient: boolean;
};

export function Legend() {
  const [activeTab, setActiveTab] = useState<'historical' | 'live'>('live');

  const historicalBins: HistoricalBin[] = [
    { c: "#7f1d1d", t: "Extreme (> 30)", desc: "Critical light pollution", icon: "⚠️" },
    { c: "#b91c1c", t: "High (27–30)", desc: "Severe impact", icon: "⚡" },
    { c: "#dc2626", t: "Medium (23–26)", desc: "Moderate impact", icon: "⚪" },
    { c: "#ef4444", t: "Low (19–22)", desc: "Minor impact", icon: "🔅" },
    { c: "#f97316", t: "Very Low (15–18)", desc: "Minimal impact", icon: "🔆" },
    { c: "#fde68a", t: "Natural (≤ 14)", desc: "Background level", icon: "✨" }
  ];

  const liveBins: LiveBin[] = [
    { c: "rgba(255, 0, 0, 1)", t: "Very High", desc: "Extreme light pollution", gradient: true },
    { c: "rgba(255, 69, 0, 0.8)", t: "High", desc: "Significant light pollution", gradient: true },
    { c: "rgba(255, 165, 0, 0.6)", t: "Medium", desc: "Moderate light pollution", gradient: true },
    { c: "rgba(255, 255, 0, 0.4)", t: "Low", desc: "Minor light pollution", gradient: true },
    { c: "rgba(255, 255, 0, 0.2)", t: "Very Low", desc: "Minimal light pollution", gradient: true }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'live'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ChartBarIcon className="w-4 h-4" />
            Live Data
          </div>
        </button>
        <button
          onClick={() => setActiveTab('historical')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'historical'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MapIcon className="w-4 h-4" />
            Historical
          </div>
        </button>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-2">
              {activeTab === 'historical' ? (
                historicalBins.map((b) => (
                  <div key={b.t} className="flex items-center gap-2 group relative">
                    <div className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded w-full cursor-help transition-colors">
                      <span className="inline-block w-4 h-4 rounded" style={{ background: b.c }} />
                      <span className="text-sm flex-1 text-gray-900 dark:text-white">{b.t}</span>
                      <span>{b.icon}</span>
                    </div>
                    <div className="absolute left-full ml-2 bg-gray-900 dark:bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity w-48 z-50 shadow-lg">
                      {b.desc}
                    </div>
                  </div>
                ))
              ) : (
                liveBins.map((b, i) => (
                  <div key={b.t} className="flex items-center gap-2 group relative">
                    <div className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded w-full cursor-help transition-colors">
                      <div className="w-full h-4 rounded overflow-hidden">
                        <div
                          className="w-full h-full"
                          style={{
                            background: `linear-gradient(to right, ${liveBins
                              .slice(i)
                              .map(bin => bin.c)
                              .join(', ')})`
                          }}
                        />
                      </div>
                    </div>
                    <div className="absolute left-full ml-2 bg-gray-900 dark:bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity w-48 z-50 shadow-lg">
                      {b.desc}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
