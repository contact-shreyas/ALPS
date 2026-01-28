'use client';

import React from 'react';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableBody,
  Badge,
} from '@tremor/react';

interface Hotspot {
  id: string;
  location: string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  lastSeen: string;
  delta: string;
}

export function HotspotTable() {
  const hotspots: Hotspot[] = [
    {
      id: 'IN-UP-2',
      location: 'Buddha Nagar, UP',
      severity: 'HIGH',
      lastSeen: '2025-09-11 14:00 AM',
      delta: '+18.40',
    },
    {
      id: 'IN-UP-UDO-2',
      location: 'Urban, KA',
      severity: 'MODERATE',
      lastSeen: '2025-09-11 11:00 AM',
      delta: '+12.10',
    },
    {
      id: 'IN-GJ-1',
      location: 'Ahmedabad, GJ',
      severity: 'LOW',
      lastSeen: '2025-09-11 12:35',
      delta: '+11.20',
    },
  ];

  const getSeverityColor = (severity: Hotspot['severity']) => {
    switch (severity) {
      case 'HIGH':
        return 'red';
      case 'MODERATE':
        return 'yellow';
      case 'LOW':
        return 'emerald';
    }
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Location</TableHeaderCell>
          <TableHeaderCell>Severity</TableHeaderCell>
          <TableHeaderCell>Last Seen</TableHeaderCell>
          <TableHeaderCell>Delta</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {hotspots.map((hotspot) => (
          <TableRow key={hotspot.id}>
            <TableCell>{hotspot.location}</TableCell>
            <TableCell>
              <Badge color={getSeverityColor(hotspot.severity)}>
                {hotspot.severity}
              </Badge>
            </TableCell>
            <TableCell>{hotspot.lastSeen}</TableCell>
            <TableCell>{hotspot.delta}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}