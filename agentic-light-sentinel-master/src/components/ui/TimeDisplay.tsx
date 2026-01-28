'use client';

import { useEffect, useState } from 'react';

interface TimeDisplayProps {
  timestamp: string;
}

export function TimeDisplay({ timestamp }: TimeDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return null on server-side and first render
  }

  return (
    <span>
      {new Date(timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}
    </span>
  );
}