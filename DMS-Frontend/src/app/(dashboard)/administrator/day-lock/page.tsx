'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DayLockPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Day Lock</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>
          Lock or unlock individual operational days
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <button className="p-2 rounded-lg" style={{ color: '#6B7280' }}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <CardTitle>April 2026</CardTitle>
            <button className="p-2 rounded-lg" style={{ color: '#6B7280' }}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Lock className="w-16 h-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>
                Day Lock Module
              </h3>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                Calendar-based day lock interface will be implemented here
              </p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                Hard lock prevents all edits for locked dates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
