'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AlertsFilter } from '@/hooks/useAlerts';
import { Input } from '@/components/ui/input';

const alertTypes = [
  { value: 'info', label: 'Information' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'success', label: 'Success' },
] as const;

interface AlertsFilterBarProps {
  onFilterChange: (filter: AlertsFilter) => void;
}

export function AlertsFilterBar({ onFilterChange }: AlertsFilterBarProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [date, setDate] = React.useState<DateRange | undefined>(() => ({
    from: new Date(),
    to: addDays(new Date(), 7),
  }));
  const [search, setSearch] = React.useState('');

  // Use a ref to track if this is the initial render
  const isInitialMount = React.useRef(true);
  const timeoutIdRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    // Skip the first render to avoid calling onFilterChange immediately
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const filter: AlertsFilter = {
      type: selectedTypes.length > 0 ? selectedTypes as AlertsFilter['type'] : undefined,
      dateRange: date && date.from && date.to ? {
        start: date.from,
        end: date.to,
      } : undefined,
      search: search.trim() || undefined,
    };

    // Clear existing timeout
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    // Debounce the filter changes
    timeoutIdRef.current = setTimeout(() => {
      onFilterChange(filter);
    }, 300);

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [selectedTypes, date, search, onFilterChange]);

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Search alerts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between min-w-[200px]"
          >
            {selectedTypes.length === 0
              ? "Select types..."
              : `${selectedTypes.length} selected`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search alert types..." />
            <CommandEmpty>No type found.</CommandEmpty>
            <CommandGroup>
              {alertTypes.map((type) => (
                <CommandItem
                  key={type.value}
                  onSelect={() => {
                    setSelectedTypes((prev) =>
                      prev.includes(type.value)
                        ? prev.filter((t) => t !== type.value)
                        : [...prev, type.value]
                    );
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedTypes.includes(type.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {type.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal min-w-[240px]",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
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
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}