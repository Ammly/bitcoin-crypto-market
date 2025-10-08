'use client';

import { useState } from 'react';

interface DateRangePickerProps {
  onDateRangeChange?: (days: number) => void;
  defaultDays?: number;
}

const presets = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: '180 Days', days: 180 },
  { label: '1 Year', days: 365 },
  { label: '2 Years', days: 730 },
  { label: 'All Time', days: 3000 },
];

export default function DateRangePicker({ onDateRangeChange, defaultDays = 90 }: DateRangePickerProps) {
  const [selectedDays, setSelectedDays] = useState(defaultDays);

  const handlePresetClick = (days: number) => {
    setSelectedDays(days);
    if (onDateRangeChange) {
      onDateRangeChange(days);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <button
          key={preset.days}
          onClick={() => handlePresetClick(preset.days)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedDays === preset.days
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
