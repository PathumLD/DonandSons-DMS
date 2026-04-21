'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { ClipboardList, Plus } from 'lucide-react';

export default function DeliveryPlanPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Delivery Plan</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            Pre-submit delivery plans for upcoming dates (max 3 days ahead)
          </p>
        </div>
        <Button variant="primary" size="md">
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <ClipboardList className="w-16 h-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>
                Delivery Plan Module
              </h3>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                Delivery planning interface will be implemented here
              </p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                Auto-sets delivery time to 5:00 AM
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
