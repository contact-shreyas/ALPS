'use client';

import { useState, useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

interface FilterPanelProps {
  onClose: () => void;
  onFilterChange: (filters: FilterOptions) => void;
}

interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  brightnessRange: {
    min: number;
    max: number;
  };
  regions: string[];
  dataQuality: string[];
}

export function FilterPanel({ onClose, onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      end: new Date().toISOString().split('T')[0],
    },
    brightnessRange: {
      min: 0,
      max: 100,
    },
    regions: [],
    dataQuality: ['high', 'medium'],
  });

  // Listen for the toggleFilters event
  useEffect(() => {
    const handleToggleFilters = (event: CustomEvent) => {
      if (!event.detail.show) {
        onClose();
      }
    };

    window.addEventListener('toggleFilters' as any, handleToggleFilters);
    return () => {
      window.removeEventListener('toggleFilters' as any, handleToggleFilters);
    };
  }, [onClose]);

  const handleFilterChange = (
    category: keyof FilterOptions,
    value: any
  ) => {
    setFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  return (
    <div className="absolute top-20 right-4 bg-white p-6 rounded-lg shadow-lg z-[1000] w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <SlidersHorizontal className="w-5 h-5 mr-2" />
          Filters
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) =>
                  handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    start: e.target.value,
                  })
                }
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) =>
                  handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    end: e.target.value,
                  })
                }
                className="w-full p-2 border rounded text-sm"
              />
            </div>
          </div>
        </div>

        {/* Brightness Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brightness Range
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={filters.brightnessRange.max}
              onChange={(e) =>
                handleFilterChange('brightnessRange', {
                  ...filters.brightnessRange,
                  max: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{filters.brightnessRange.min}</span>
              <span>{filters.brightnessRange.max}</span>
            </div>
          </div>
        </div>

        {/* Data Quality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Quality
          </label>
          <div className="space-y-2">
            {['high', 'medium', 'low'].map((quality) => (
              <label key={quality} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.dataQuality.includes(quality)}
                  onChange={(e) => {
                    const newQuality = e.target.checked
                      ? [...filters.dataQuality, quality]
                      : filters.dataQuality.filter((q) => q !== quality);
                    handleFilterChange('dataQuality', newQuality);
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600 capitalize">{quality}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setFilters({
            dateRange: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end: new Date().toISOString().split('T')[0],
            },
            brightnessRange: {
              min: 0,
              max: 100,
            },
            regions: [],
            dataQuality: ['high', 'medium'],
          });
        }}
        className="mt-6 w-full py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
      >
        Reset Filters
      </button>
    </div>
  );
}