'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Filter,
  Download,
  Share2,
  Map,
  AlertTriangle,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import { ShareModal } from '@/components/panels/ShareModal';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  description: string;
}

export function QuickActions() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const handleAction = async (action: string, callback: () => Promise<void>) => {
    setLoading(action);
    try {
      await callback();
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
    } finally {
      setLoading(null);
    }
  };

  const actions: QuickAction[] = [
    {
      icon: <Map className="w-5 h-5" />,
      label: "View Map",
      description: "Open interactive light pollution map",
      onClick: () => handleAction("map", async () => {
        const mapElement = document.getElementById('map-section');
        if (mapElement) {
          mapElement.scrollIntoView({ behavior: 'smooth' });
        } else {
          router.push('/?view=map');
        }
      })
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: "Alerts",
      description: "View and manage active alerts",
      onClick: () => handleAction("alerts", async () => {
        router.push('/alerts');
      })
    },
    {
      icon: <Filter className="w-5 h-5" />,
      label: "Filter",
      description: "Filter dashboard data",
      onClick: () => handleAction("filter", async () => {
        setShowFilters(!showFilters);
        // Dispatch event for map component to show filter panel
        window.dispatchEvent(new CustomEvent('toggleFilters', {
          detail: { show: !showFilters }
        }));
      })
    },
    {
      icon: <BarChart2 className="w-5 h-5" />,
      label: "Reports",
      description: "Generate analysis reports",
      onClick: () => handleAction("reports", async () => {
        router.push('/reports');
      })
    },
    {
      icon: <Download className="w-5 h-5" />,
      label: "Export",
      description: "Export dashboard data",
      onClick: () => handleAction("export", async () => {
        const response = await fetch('/api/export-data');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `light-pollution-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      label: "Share",
      description: "Share dashboard view",
      onClick: () => handleAction("share", async () => {
        setShowShare(true);
      })
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      description: "Configure dashboard settings",
      onClick: () => handleAction("settings", async () => {
        router.push('/settings');
      })
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors relative group"
            disabled={loading !== null}
          >
            <div className="relative">
              {loading === action.label ? (
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
              ) : (
                <div className="text-gray-500">{action.icon}</div>
              )}
            </div>
            <span className="mt-2 text-xs font-medium text-gray-700">{action.label}</span>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {action.description}
            </div>
          </button>
        ))}
      </div>

      {/* Share Modal */}
      {showShare && (
        <ShareModal
          onClose={() => setShowShare(false)}
          currentUrl={window.location.href}
        />
      )}
    </div>
  );
}