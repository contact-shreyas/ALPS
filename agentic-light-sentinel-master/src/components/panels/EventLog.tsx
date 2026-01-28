"use client";

import { useState, useEffect } from "react";
import { SystemEvent } from "../../types/system-health";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "../../lib/utils";
import { EventDetailsDialog } from "./EventDetailsDialog";

interface EventLogProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function EventLog({ isExpanded = false, onToggle }: EventLogProps) {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<SystemEvent | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.details && JSON.stringify(event.details).toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "all" || event.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/system/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events when panel is expanded
  useEffect(() => {
    if (isExpanded) {
      fetchEvents();

      if (autoRefresh) {
        const interval = setInterval(fetchEvents, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
      }
    }
  }, [isExpanded, autoRefresh]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className={cn(
      "fixed bottom-0 right-0 w-full md:w-96 bg-white dark:bg-gray-800 border-t md:border-l dark:border-gray-700 transition-all duration-300 ease-in-out",
      isExpanded ? "h-96" : "h-12"
    )}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-12 border-b dark:border-gray-700"
      >
        <div className="flex items-center gap-2 cursor-pointer" onClick={onToggle}>
          <h3 className="font-medium">System Events</h3>
          {filteredEvents.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
              {filteredEvents.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <>
              <div className="flex items-center gap-2">
                <select
                  className="text-sm bg-transparent border rounded px-2 py-1"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
                <button
                  className={cn(
                    "p-1 rounded text-gray-500",
                    autoRefresh ? "bg-gray-100 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  title={autoRefresh ? "Auto-refresh enabled" : "Auto-refresh disabled"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                    />
                  </svg>
                </button>
              </div>
              <button 
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500"
                onClick={() => setEvents([])}
                title="Clear Events"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
          <button
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            onClick={onToggle}
          >
            <svg
              className={cn(
                "w-4 h-4 transition-transform",
                isExpanded ? "transform rotate-180" : ""
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <>
          <div className="p-4 border-b dark:border-gray-700">
            <input
              type="text"
              placeholder="Search events..."
              className="w-full px-3 py-1.5 text-sm bg-transparent border rounded focus:outline-none focus:ring-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="h-[calc(100%-7rem)] overflow-auto p-4">
            {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-3 p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex-shrink-0 mt-1">{getEventIcon(event.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{event.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <time className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </time>
                      {event.details && Object.keys(event.details).length > 0 && (
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="text-xs text-blue-500 hover:underline"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Info className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No system events to display</p>
            </div>
          )}
        </div>
        </>
      )}

      <EventDetailsDialog
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}