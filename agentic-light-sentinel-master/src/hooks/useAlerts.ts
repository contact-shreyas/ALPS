import { useQuery } from '@tanstack/react-query';

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
}

export interface AlertsFilter {
  type?: Alert['type'][];
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: string;
  search?: string;
}

async function fetchAlerts(filter?: AlertsFilter): Promise<Alert[]> {
  // Build query parameters
  const params = new URLSearchParams();
  if (filter?.type?.length) {
    params.set('type', filter.type.join(','));
  }
  if (filter?.dateRange) {
    params.set('start', filter.dateRange.start.toISOString());
    params.set('end', filter.dateRange.end.toISOString());
  }
  if (filter?.location) {
    params.set('location', filter.location);
  }
  if (filter?.search) {
    params.set('search', filter.search);
  }

  const queryString = params.toString();
  const url = `/api/alerts${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch alerts');
  
  const data = await response.json();
  
  // Handle paginated response structure
  if (data && Array.isArray(data.items)) {
    // Transform API response to match Alert interface
    return data.items.map((item: any): Alert => ({
      id: item.id,
      type: item.severity === 'HIGH' ? 'error' : item.severity === 'MEDIUM' ? 'warning' : 'info',
      title: item.title,
      message: item.details,
      timestamp: item.createdAt,
      location: item.entity ? {
        lat: 0, // API doesn't provide coordinates, using default
        lng: 0,
        name: `${item.entity.name}, ${item.entity.region}`
      } : undefined
    }));
  }
  
  // Fallback for direct array response
  return Array.isArray(data) ? data : [];
}

export function useAlerts(filter?: AlertsFilter) {
  return useQuery({
    queryKey: ['alerts', filter],
    queryFn: () => fetchAlerts(filter),
  });
}