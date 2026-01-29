"use client";

import { useState } from "react";
import useSWR from 'swr';
import { api, formatters } from '../../../lib/api-client';
import { Alert } from '../../../types/dashboard';

export function AlertsTable() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [severity, setSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | undefined>(undefined);

  const { data, error, isLoading } = useSWR(
    ['alerts', page, pageSize, severity],
    () => api.alerts.list({ page, pageSize, severity }),
    { 
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Hotspot Alerts</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Hotspot Alerts</h3>
        <div className="text-center py-8">
          <div className="text-red-500 text-sm">Failed to load alerts</div>
          <div className="text-gray-400 text-xs mt-1">
            {error.message || 'An error occurred'}
          </div>
        </div>
      </div>
    )
  }

  const alerts = data?.items || []
  const totalPages = data?.totalPages || 1

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Hotspot Alerts</h3>
        <select
          aria-label="Severity filter"
          value={severity ?? "ALL"}
          onChange={(e) => {
            const v = e.target.value;
            setPage(1);
            setSeverity(v === "ALL" ? undefined : (v as any));
          }}
          className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-900"
        >
          <option value="ALL">All</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No alerts found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4">Severity</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Source</th>
                <th className="py-2 pr-4">Region</th>
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
              <tr key={a.id} className="border-t border-gray-100 dark:border-gray-700">
                <td className="py-2 pr-4">
                  <span
                    className={
                      "px-2 py-1 rounded text-xs font-semibold " +
                      (a.severity === "HIGH"
                        ? "bg-red-100 text-red-700"
                        : a.severity === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700")
                    }
                  >
                    {a.severity}
                  </span>
                </td>
                <td className="py-2 pr-4 max-w-xs truncate" title={a.details}>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{a.title}</div>
                  <div className="text-gray-500 text-xs">{a.details}</div>
                </td>
                <td className="py-2 pr-4">{a.entity?.code || '-'}</td>
                <td className="py-2 pr-4">{a.entity?.region || '-'}</td>
                <td className="py-2 pr-4">{formatters.timestamp(a.createdAt)}</td>
                <td className="py-2 pr-4">
                  <button
                    className="text-blue-600 hover:underline text-xs"
                    onClick={async () => {
                      await fetch("/api/act/notify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ to: "demo@local", alertId: a.id }),
                      });
                      alert("Notification enqueued")
                    }}
                  >
                    Notify
                  </button>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            className="px-2 py-1 border rounded text-sm disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <div className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </div>
          <button
            className="px-2 py-1 border rounded text-sm disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

