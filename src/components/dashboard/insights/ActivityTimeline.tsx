import { useEffect, useState } from 'react';
import { 
  BeakerIcon, 
  BoltIcon, 
  ExclamationCircleIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { TimeDisplay } from '@/components/ui/TimeDisplay';

interface TimelineEvent {
  id: string;
  phase: string;
  message: string;
  meta?: any;
  at: string;
}

export function ActivityTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/system/events');
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getEventIcon = (phase?: string) => {
    if (!phase) {
      return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
    
    switch (phase.toUpperCase()) {
      case 'SENSE':
        return <BeakerIcon className="w-5 h-5 text-blue-500" />;
      case 'REASON':
        return <BoltIcon className="w-5 h-5 text-purple-500" />;
      case 'ACT':
        return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />;
      case 'LEARN':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return <TimeDisplay timestamp={dateString} />;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Activity Timeline
      </h3>

      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {events.map((event, eventIdx) => (
            <li key={event.id}>
              <div className="relative pb-8">
                {eventIdx !== events.length - 1 ? (
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                      {getEventIcon(event.phase)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {event.phase}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        {formatTime(event.at)}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      <p>{event.message}</p>
                      {event.meta && (
                        <pre className="mt-1 text-xs bg-gray-50 dark:bg-gray-700/50 p-2 rounded overflow-auto">
                          {JSON.stringify(event.meta, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {events.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No recent activity
        </p>
      )}
    </div>
  );
}