'use client';

import { useState, useEffect } from 'react';

interface ClientTimeProps {
  timestamp: string | Date;
  format?: 'time' | 'date' | 'datetime';
  className?: string;
}

export default function ClientTime({ timestamp, format = 'time', className = '' }: ClientTimeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder during SSR to avoid hydration mismatch
    return <span className={className}>--:--:--</span>;
  }

  const date = new Date(timestamp);
  
  switch (format) {
    case 'time':
      return (
        <span className={className}>
          {date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </span>
      );
    case 'date':
      return (
        <span className={className}>
          {date.toLocaleDateString('en-US')}
        </span>
      );
    case 'datetime':
      return (
        <span className={className}>
          {date.toLocaleString('en-US', {
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </span>
      );
    default:
      return <span className={className}>Invalid format</span>;
  }
}