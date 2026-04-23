'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Lock, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

interface DayLock {
  date: string;
  locked: boolean;
  lockedBy?: string;
  lockedAt?: string;
}

export default function DayLockPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // January 2026
  const [dayLocks, setDayLocks] = useState<DayLock[]>([
    { date: '2026-01-01', locked: true, lockedBy: 'Admin', lockedAt: '2026-01-01 23:59' },
    { date: '2026-01-02', locked: true, lockedBy: 'Admin', lockedAt: '2026-01-02 23:59' },
    { date: '2026-01-03', locked: true, lockedBy: 'Admin', lockedAt: '2026-01-03 23:59' },
    { date: '2026-01-04', locked: true, lockedBy: 'Admin', lockedAt: '2026-01-04 23:59' },
    { date: '2026-01-05', locked: true, lockedBy: 'Admin', lockedAt: '2026-01-05 23:59' },
    { date: '2026-01-06', locked: true, lockedBy: 'Admin', lockedAt: '2026-01-06 23:59' },
    { date: '2026-01-07', locked: true, lockedBy: 'Admin', lockedAt: '2026-01-07 23:59' },
    { date: '2026-01-08', locked: true, lockedBy: 'Admin', lockedAt: '2026-01-08 23:59' },
    { date: '2026-01-09', locked: true, lockedBy: 'Admin', lockedAt: '2026-01-09 23:59' },
  ]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Adjust so Monday is 0

    const days: (number | null)[] = [];
    
    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const existingLock = dayLocks.find(l => l.date === dateStr);

    if (existingLock) {
      // Toggle lock status
      if (window.confirm(`Are you sure you want to ${existingLock.locked ? 'unlock' : 'lock'} ${dateStr}?`)) {
        setDayLocks(dayLocks.map(l => 
          l.date === dateStr 
            ? { ...l, locked: !l.locked, lockedBy: 'Admin', lockedAt: new Date().toLocaleString() }
            : l
        ));
      }
    } else {
      // Lock new day
      if (window.confirm(`Lock ${dateStr}? No entries will be allowed for this date.`)) {
        setDayLocks([
          ...dayLocks,
          { date: dateStr, locked: true, lockedBy: 'Admin', lockedAt: new Date().toLocaleString() }
        ]);
      }
    }
  };

  const isDateLocked = (day: number): boolean => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const lock = dayLocks.find(l => l.date === dateStr);
    return lock?.locked ?? false;
  };

  const days = getDaysInMonth();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          <Lock className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
          Un/Lock Daily Operations
        </h1>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Lock or unlock specific days to prevent/allow data entry. Once locked, even Admin cannot make entries.
        </p>
      </div>

      <div className="p-4 rounded-lg" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: '#DC2626' }} />
          <div>
            <h4 className="font-medium mb-1" style={{ color: '#991B1B' }}>Critical Notice</h4>
            <p className="text-sm" style={{ color: '#991B1B' }}>
              Once a day is locked, <strong>NO entries can be made for that date</strong> - not even by Admin. Only unlock if absolutely necessary.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="primary" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>
            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              {year} {monthNames[month]}
            </h2>
            <Button variant="primary" size="sm" onClick={handleNextMonth}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {/* Day Names Header */}
            <div className="grid grid-cols-7 bg-gray-50">
              {dayNames.map((dayName) => (
                <div
                  key={dayName}
                  className="p-3 text-center font-medium text-sm"
                  style={{ color: 'var(--muted-foreground)', borderRight: '1px solid var(--border)' }}
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                const isLocked = day !== null && isDateLocked(day);
                const isToday = day !== null && 
                  day === new Date().getDate() && 
                  month === new Date().getMonth() && 
                  year === new Date().getFullYear();

                return (
                  <div
                    key={index}
                    className={`relative p-4 h-20 border-r border-b cursor-pointer transition-colors ${
                      day === null ? 'bg-gray-100' : isLocked ? 'bg-gray-200' : 'hover:bg-blue-50'
                    }`}
                    style={{ 
                      borderColor: 'var(--border)',
                      backgroundColor: day === null ? '#F3F4F6' : isLocked ? '#E5E7EB' : isToday ? '#DBEAFE' : 'white'
                    }}
                    onClick={() => day !== null && handleDayClick(day)}
                  >
                    {day !== null && (
                      <>
                        <div className="flex items-start justify-between">
                          <span 
                            className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}
                            style={{ color: isToday ? '#2563EB' : '#374151' }}
                          >
                            {day}
                          </span>
                          {isLocked && (
                            <Lock className="w-4 h-4" style={{ color: '#F59E0B' }} />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-sm text-center mt-4" style={{ color: 'var(--muted-foreground)' }}>
            Click on date to Un/Lock daily operations
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
