'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Calendar, AlertCircle, Truck, Plus } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { addDaysISO } from '@/lib/date-restrictions';

/**
 * 6.vi Delivery Plan
 *
 * Per spec:
 *  - Delivery Plan must be set 3 days in advance
 *  - Delivery Plan allows users to load pre-loaded delivery plans
 *  - When selecting future date, delivery time automatically updates to 5:00 AM
 *  - When user submits, delivery plan is updated in Delivery tables
 */

interface DeliverySchedule {
  id: number;
  days: string;
  time: string;
}

const defaultSchedules: DeliverySchedule[] = [
  { id: 1, days: 'Thursday Friday', time: '5:00 am' },
  { id: 2, days: 'Sunday', time: '5:00 am' },
  { id: 3, days: 'Saturday', time: '5:00 am' },
  { id: 4, days: 'Monday Tuesday Wednesday', time: '5:00 am' },
];

export default function DeliveryPlanPage() {
  const user = useAuthStore((s) => s.user);
  const allowed =
    !!user?.isSuperAdmin ||
    user?.permissions?.includes('*') ||
    user?.permissions?.includes('administrator.delivery-plan.allow') ||
    user?.permissions?.includes('administrator.delivery-plan.create');

  const [schedules, setSchedules] = useState<DeliverySchedule[]>(defaultSchedules);
  const [visibleCount, setVisibleCount] = useState(4);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  const handleLoadSchedule = (schedule: DeliverySchedule) => {
    if (!allowed) {
      alert('You do not have permission to submit delivery plans.');
      return;
    }
    alert(`Loading delivery plan for ${schedule.days} at ${schedule.time}.\n\nDelivery records will be pre-loaded into the Delivery tables with 5:00 AM delivery time.`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            <Calendar className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Delivery Plan
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Pre-load delivery schedules for the next 3 days. Delivery time is automatically set to 5:00 AM.
          </p>
        </div>
      </div>

      {!allowed && (
        <div className="p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
          <AlertCircle className="w-5 h-5" style={{ color: '#DC2626' }} />
          <div className="text-sm" style={{ color: '#991B1B' }}>
            Only users granted the <code>administrator.delivery-plan.allow</code> permission can submit delivery plans. Contact the administrator if you need access.
          </div>
        </div>
      )}

      <div className="p-4 rounded-lg flex items-start gap-2" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FFD100' }}>
        <Calendar className="w-4 h-4 mt-0.5" style={{ color: '#92400E' }} />
        <div className="text-sm" style={{ color: '#92400E' }}>
          <strong>Note:</strong> Delivery plans must be set 3 days in advance. When you load a plan, it will pre-populate the delivery tables with 5:00 AM delivery time.
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {schedules.slice(0, visibleCount).map((schedule) => (
              <div
                key={schedule.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5" style={{ color: '#C8102E' }} />
                  <div>
                    <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {schedule.days} - {schedule.time}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLoadSchedule(schedule)}
                  disabled={!allowed}
                >
                  Load Plan
                </Button>
              </div>
            ))}
          </div>

          {visibleCount < schedules.length && (
            <div className="p-4 text-center border-t" style={{ borderColor: 'var(--border)' }}>
              <Button variant="ghost" size="sm" onClick={handleLoadMore}>
                <Plus className="w-4 h-4 mr-2" />
                Load More
              </Button>
            </div>
          )}

          {schedules.length === 0 && (
            <div className="p-12 text-center" style={{ color: 'var(--muted-foreground)' }}>
              <Truck className="w-12 h-12 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
              <p className="text-sm">No delivery schedules available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
