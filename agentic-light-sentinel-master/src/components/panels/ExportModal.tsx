'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, Download, Loader2, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ExportModalProps {
  onClose: () => void;
}

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  dateRange: DateRange;
  includeMetadata: boolean;
  resolution: 'hourly' | 'daily' | 'weekly' | 'monthly';
  regions?: string[];
}

export function ExportModal({ onClose }: ExportModalProps) {
  const [selectedRegions, setSelectedRegions] = React.useState<string[]>([]);
  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const response = await fetch('/api/regions');
      return response.json();
    },
  });

  const [options, setOptions] = React.useState<ExportOptions>({
    format: 'csv',
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
    },
    includeMetadata: true,
    resolution: 'daily',
    regions: [],
  });
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const handleExport = async () => {
    if (!options.dateRange.from || !options.dateRange.to) {
      toast.error('Please select a date range');
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      // Start a background export job
      const startResponse = await fetch('/api/export/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (startResponse.status === 401) {
        toast.error('Please sign in to export data');
        return;
      }

      if (startResponse.status === 429) {
        const { reset } = await startResponse.json();
        const minutes = Math.ceil((reset - Date.now()) / 1000 / 60);
        toast.error(`Rate limit exceeded. Try again in ${minutes} minutes.`);
        return;
      }

      if (!startResponse.ok) {
        throw new Error('Failed to start export');
      }

      const { jobId } = await startResponse.json();

      // Poll for progress
      const interval = setInterval(async () => {
        const progressResponse = await fetch(`/api/export/progress/${jobId}`);
        if (!progressResponse.ok) {
          clearInterval(interval);
          throw new Error('Failed to get export progress');
        }

        const { progress: currentProgress, status, url } = await progressResponse.json();
        setProgress(currentProgress);

        if (status === 'completed' && url) {
          clearInterval(interval);
          setLoading(false);

          // Download the file
          const a = document.createElement('a');
          a.href = url;
          a.download = `light-pollution-data-${format(new Date(), 'yyyy-MM-dd')}.${options.format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          toast.success('Export completed successfully');
          onClose();
        } else if (status === 'failed') {
          clearInterval(interval);
          throw new Error('Export failed');
        }
      }, 1000);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Format</Label>
            <Select
              value={options.format}
              onValueChange={(value) => setOptions({ ...options, format: value as ExportOptions['format'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Resolution Selection */}
          <div className="space-y-2">
            <Label>Time Resolution</Label>
            <Select
              value={options.resolution}
              onValueChange={(value) => setOptions({ ...options, resolution: value as ExportOptions['resolution'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !options.dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {options.dateRange?.from ? (
                      options.dateRange.to ? (
                        <>
                          {format(options.dateRange.from, "LLL dd, y")} -{" "}
                          {format(options.dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(options.dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={options.dateRange?.from}
                    selected={options.dateRange}
                    onSelect={(range) => setOptions({ ...options, dateRange: range || { from: undefined, to: undefined } })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Region Selection */}
          <div className="space-y-2">
            <Label>Regions</Label>
            <Command className="rounded-lg border shadow-md">
              <CommandInput placeholder="Search regions..." />
              <CommandEmpty>No regions found.</CommandEmpty>
              <CommandGroup>
                {regions?.map((region: { id: string; name: string }) => (
                  <CommandItem
                    key={region.id}
                    onSelect={() => {
                      const newRegions = selectedRegions.includes(region.name)
                        ? selectedRegions.filter((r) => r !== region.name)
                        : [...selectedRegions, region.name];
                      setSelectedRegions(newRegions);
                      setOptions({ ...options, regions: newRegions });
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {selectedRegions.includes(region.name) && (
                        <Check className="h-4 w-4" />
                      )}
                      <span>{region.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
            {selectedRegions.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedRegions.length} region{selectedRegions.length === 1 ? '' : 's'} selected
              </p>
            )}
          </div>

          {/* Include Metadata */}
          <div className="flex items-center justify-between">
            <Label>Include Metadata</Label>
            <Switch
              checked={options.includeMetadata}
              onCheckedChange={(checked) => setOptions({ ...options, includeMetadata: checked })}
            />
          </div>

          {/* Progress Bar */}
          {loading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {progress}% complete
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}