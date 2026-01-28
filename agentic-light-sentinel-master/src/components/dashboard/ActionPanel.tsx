import { useState } from 'react';

type Action = {
  id: string;
  label: string;
  description: string;
  icon: string;
  endpoint: string;
  method?: 'GET' | 'POST';
};

const actions: Action[] = [
  {
    id: 'ingest',
    label: 'Fetch New Data',
    description: 'Pull latest VIIRS satellite data',
    icon: '🛰️',
    endpoint: '/api/ingest',
    method: 'POST'
  },
  {
    id: 'detect',
    label: 'Detect Hotspots',
    description: 'Run ML detection on latest data',
    icon: '🔍',
    endpoint: '/api/learn',
    method: 'POST'
  },
  {
    id: 'report',
    label: 'Send Report',
    description: 'Email dashboard summary',
    icon: '📧',
    endpoint: '/api/email/report',
    method: 'POST'
  },
  {
    id: 'alert',
    label: 'Test Alert',
    description: 'Send test notification',
    icon: '🔔',
    endpoint: '/api/email',
    method: 'POST'
  }
];

export function ActionPanel() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{id: string, success: boolean} | null>(null);

  async function triggerAction(action: Action) {
    setLoading(action.id);
    try {
      const res = await fetch(action.endpoint, { method: action.method || 'GET' });
      setResult({ id: action.id, success: res.ok });
      setTimeout(() => setResult(null), 3000);
    } catch (error) {
      setResult({ id: action.id, success: false });
      setTimeout(() => setResult(null), 3000);
    }
    setLoading(null);
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => triggerAction(action)}
            disabled={loading !== null}
            className={`
              relative flex flex-col items-center p-3 rounded-lg
              ${loading === action.id ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'}
              transition-colors duration-200
              ${result?.id === action.id ? (result.success ? 'ring-2 ring-green-500' : 'ring-2 ring-red-500') : ''}
            `}
          >
            <span className="text-2xl mb-1">{action.icon}</span>
            <span className="text-sm font-medium">{action.label}</span>
            <span className="text-xs text-gray-500 text-center mt-1">{action.description}</span>
            {loading === action.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}