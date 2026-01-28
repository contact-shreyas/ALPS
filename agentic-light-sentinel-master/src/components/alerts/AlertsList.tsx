'use client';

import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Alert } from '@/hooks/useAlerts';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AlertsListProps {
  alerts: Alert[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  // Ensure alerts is always an array
  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  if (safeAlerts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            No alerts to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {safeAlerts.map((alert) => (
        <Card
          key={alert.id}
          className={cn(
            'transition-all hover:shadow-md',
            getAlertColor(alert.type)
          )}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              {getAlertIcon(alert.type)}
              <CardTitle className="text-lg">{alert.title}</CardTitle>
            </div>
            <CardDescription>{alert.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                {alert.location && (
                  <span>📍 {alert.location.name}</span>
                )}
              </div>
              <time dateTime={alert.timestamp}>
                {new Date(alert.timestamp).toLocaleString()}
              </time>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}