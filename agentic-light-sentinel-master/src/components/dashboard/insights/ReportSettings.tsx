'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { INDIAN_STATES, State } from '@/types/states';

interface ReportSchedule {
  id: string;
  email?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  days?: string[];
  time: string;
  state?: string;
  reportType: 'summary' | 'detailed';
}

interface ReportSettingsProps {
  onSend: (email?: string) => Promise<void>;
}

export function ReportSettings({ onSend }: ReportSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [schedule, setSchedule] = useState('never');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/reports/download?state=${selectedState}&type=${reportType}`);
      if (!response.ok) throw new Error('Failed to generate report');
      const blob = await response.blob();
      
      // Create and download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `light-pollution-report-${selectedState || 'all'}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // If email is provided, send the report via email
      if (email && email.trim()) {
        try {
          const emailResponse = await fetch('/api/reports/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email.trim(),
              state: selectedState,
              reportType,
            }),
          });
          
          if (emailResponse.ok) {
            console.log('Report sent via email successfully');
            // You could add a toast notification here
          } else {
            console.error('Failed to send email');
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      const response = await fetch('/api/reports/schedules');
      if (!response.ok) throw new Error('Failed to load schedules');
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const saveSchedule = async () => {
    if (schedule === 'never') return;
    setIsLoading(true);
    try {
      const scheduleData: Omit<ReportSchedule, 'id'> = {
        email: email || undefined,
        frequency: schedule as 'daily' | 'weekly' | 'custom',
        time: scheduleTime,
        state: selectedState,
        reportType,
        ...(schedule === 'custom' ? { days: selectedDays } : {}),
      };

      const response = await fetch('/api/reports/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) throw new Error('Failed to save schedule');
      await loadSchedules();
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm font-medium"
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 3a2 2 0 012-2h10a2 2 0 012 2v2h-2V3H5v14h10v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V3z" />
          <path d="M13 7h4a1 1 0 010 2h-4v2l-3-3 3-3v2z" />
        </svg>
        Send Report
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Report Settings</h3>
          
          <div className="space-y-4">
            {/* State Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All States</option>
                {INDIAN_STATES.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Report Type
              </label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="summary"
                    checked={reportType === 'summary'}
                    onChange={(e) => setReportType(e.target.value as 'summary')}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Summary</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="detailed"
                    checked={reportType === 'detailed'}
                    onChange={(e) => setReportType(e.target.value as 'detailed')}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Detailed</span>
                </label>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Send to Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address (optional)"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Download Report
            </button>

            {/* Schedule Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Schedule Report
              </label>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="never">Send manually</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom days</option>
              </select>
            </div>

            {/* Time Selection */}
            {schedule !== 'never' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Send at
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            )}

            {/* Custom Days Selection */}
            {schedule === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {days.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedDays.includes(day)
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Existing Schedules */}
          {schedules.length > 0 && (
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Active Schedules
              </h4>
              <div className="space-y-2">
                {schedules.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {s.frequency === 'custom'
                          ? `Custom: ${s.days?.join(', ')}`
                          : s.frequency.charAt(0).toUpperCase() + s.frequency.slice(1)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {s.state ? INDIAN_STATES.find(state => state.code === s.state)?.name || s.state : 'All States'} - {s.reportType}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {s.email || 'Default email'} at {s.time}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await fetch(`/api/reports/schedules?id=${s.id}`, {
                            method: 'DELETE',
                          });
                          await loadSchedules();
                        } catch (error) {
                          console.error('Error deleting schedule:', error);
                        }
                      }}
                      className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            {schedule === 'never' ? (
              <button
                onClick={async () => {
                  await onSend(email || undefined);
                  setIsOpen(false);
                }}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50"
              >
                Send Now
              </button>
            ) : (
              <button
                onClick={saveSchedule}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors disabled:opacity-50"
              >
                Save Schedule
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}