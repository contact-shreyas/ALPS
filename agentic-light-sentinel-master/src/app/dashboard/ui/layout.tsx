import LightPollutionMap from "@/components/LightPollutionMap";
import { Legend } from "@/components/map/Legend";
import { AlertsPanel } from "@/components/panels/AlertsPanel";
import { MetricsPanel } from "@/components/dashboard/MetricsPanel";
import { ActionPanel } from "@/components/dashboard/ActionPanel";
import { AutonomousLoopPanel } from "@/components/dashboard/AutonomousLoopPanel";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { ThemeProvider } from "@/lib/theme-context";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

type DashboardLayoutProps = {
  children?: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  type MetricSummary = {
    hotspotPrecision: number;
    hotspotRecall: number;
    ingestToAlertLatencyP50: number;
    ingestToAlertLatencyP95: number;
    districtCoverage: number;
    timestamp: string;
  };

  type Insights = {
    topStates: Array<{ id: string; count: number }>;
    topDistricts: Array<{ id: string; name: string; count: number }>;
    nationalTrend: Array<{ date: string; value: number }>;
  };

  const [metrics, setMetrics] = useState<MetricSummary | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);

  // Fetch metrics and insights
  useEffect(() => {
    Promise.all([
      fetch("/api/metrics").then(r => r.json()),
      fetch("/api/insights").then(r => r.json())
    ]).then(([metricsData, insightsData]) => {
      setMetrics(metricsData);
      setInsights(insightsData);
    });
  }, []);

  const { showToast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const sendReport = async () => {
    setIsSending(true);
    try {
      const response = await fetch("/api/email/report", { method: "POST" });
      if (!response.ok) throw new Error('Failed to send report');
      showToast('Report sent successfully!', 'success');
    } catch (error) {
      showToast('Failed to send report. Please try again.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          {/* Top bar with title and controls */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Light Pollution Sentinel
              </h1>
              <div className="flex items-center gap-4">
                <Legend />
                <ThemeSwitcher />
                <button 
                  onClick={sendReport}
                  disabled={isSending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
                           text-white rounded-lg text-sm transition-all duration-200 shadow-sm
                           flex items-center gap-2 group relative overflow-hidden"
                >
                  <span className="flex items-center gap-2 transition-transform duration-200 group-hover:translate-x-1">
                    {isSending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <PaperAirplaneIcon className="w-4 h-4" />
                    )}
                    {isSending ? 'Sending...' : 'Send Report'}
                  </span>
                </button>
              </div>
            </div>
          </header>

      {/* Main content area */}
      <div className="flex-1 grid grid-cols-4 gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Left side - Map */}
        <div className="col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-full">
            <LightPollutionMap />
          </div>
        </div>

        {/* Right side - Panels */}
        <div className="space-y-4">
          <AutonomousLoopPanel />
          <ActionPanel />
          {metrics && <MetricsPanel metrics={metrics} />}
          <AlertsPanel />
          {insights && insights.nationalTrend && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                National Trend
              </h3>
              <div className="h-[150px] w-full">
                {/* Replace TrendChart with placeholder for now */}
                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">Trend data visualization</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional content */}
      {children}
    </div>
    </ToastProvider>
    </ThemeProvider>
  );
}