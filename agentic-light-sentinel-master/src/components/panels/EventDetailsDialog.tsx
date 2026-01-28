"use client";

import { SystemEvent } from "@/types/system-health";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface EventDetailsDialogProps {
  event: SystemEvent | null;
  onClose: () => void;
}

export function EventDetailsDialog({ event, onClose }: EventDetailsDialogProps) {
  if (!event) return null;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/50';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50';
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getEventIcon(event.type)}
            <span>Event Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className={cn(
          "rounded-lg border p-4",
          getStatusColor(event.type)
        )}>
          <p className="text-sm font-medium mb-2">{event.message}</p>
          <time className="text-xs text-gray-500">
            {new Date(event.timestamp).toLocaleString()}
          </time>
        </div>

        {event.details && Object.keys(event.details).length > 0 && (
          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-medium">Additional Details</h4>
            <div className="rounded-lg border dark:border-gray-700 divide-y dark:divide-gray-700">
              {Object.entries(event.details).map(([key, value]) => (
                <div key={key} className="flex px-3 py-2 text-sm">
                  <span className="font-medium text-gray-500 w-32">{key}</span>
                  <span className="flex-1">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}