'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DayLock {
  date: string;
  locked: boolean;
  lockedBy?: string;
  lockedAt?: string;
}

export default function DayLockPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayLocks] = useState<DayLock[]>([
    { date: '2026-04-20', locked: true, lockedBy: 'Manager', lockedAt: '2026-04-20 23:45' },
    { date: '2026-04-19', locked: true, lockedBy: 'Manager', lockedAt: '2026-04-19 23:30' },
    { date: '2026-04-18', locked: true, lockedBy: 'Manager', lockedAt: '2026-04-18 23:50' },
    { date: '2026-04-21', locked: false },
  ]);

  const currentLock = dayLocks.find(d => d.date === selectedDate);

  const handleLock = () => {
    console.log('Locking day:', selectedDate);
    alert(`Day ${selectedDate} has been locked. No further transactions can be made.`);
  };

  const handleUnlock = () => {
    if (window.confirm('Are you sure you want to unlock this day? This will allow modifications to locked transactions.')) {
      console.log('Unlocking day:', selectedDate);
      alert(`Day ${selectedDate} has been unlocked.`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Day Lock</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>Lock/unlock daily transactions to prevent modifications</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Lock Day</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Select Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              fullWidth
            />

            {currentLock && (
              <div className={`p-6 rounded-lg ${currentLock.locked ? 'bg-red-50' : 'bg-green-50'}`} style={{ border: `2px solid ${currentLock.locked ? '#FCA5A5' : '#86EFAC'}` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      {currentLock.locked ? (
                        <Lock className="w-6 h-6" style={{ color: '#DC2626' }} />
                      ) : (
                        <Unlock className="w-6 h-6" style={{ color: '#10B981' }} />
                      )}
                      <span className="text-xl font-bold" style={{ color: currentLock.locked ? '#991B1B' : '#166534' }}>
                        {currentLock.locked ? 'Day is Locked' : 'Day is Unlocked'}
                      </span>
                    </div>
                    {currentLock.locked && currentLock.lockedBy && (
                      <p className="text-sm" style={{ color: '#991B1B' }}>
                        Locked by {currentLock.lockedBy} on {currentLock.lockedAt}
                      </p>
                    )}
                  </div>
                  {currentLock.locked ? (
                    <Button variant="danger" size="md" onClick={handleUnlock}>
                      <Unlock className="w-4 h-4 mr-2" />Unlock Day
                    </Button>
                  ) : (
                    <Button variant="primary" size="md" onClick={handleLock}>
                      <Lock className="w-4 h-4 mr-2" />Lock Day
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg" style={{ backgroundColor: '#FEF3C4', border: '1px solid #FFD100' }}>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: '#92400E' }} />
                <div>
                  <h4 className="font-medium mb-1" style={{ color: '#78350F' }}>Important Notice</h4>
                  <p className="text-sm" style={{ color: '#92400E' }}>
                    Locking a day will prevent any modifications to transactions on that date. Only administrators can unlock days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Locked Days</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dayLocks.filter(d => d.locked).map((lock, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg" style={{ border: '1px solid #E5E7EB' }}>
                <div>
                  <p className="font-medium" style={{ color: '#111827' }}>{new Date(lock.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>Locked by {lock.lockedBy} • {lock.lockedAt}</p>
                </div>
                <Badge variant="danger" size="sm"><Lock className="w-3 h-3 mr-1" />Locked</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
