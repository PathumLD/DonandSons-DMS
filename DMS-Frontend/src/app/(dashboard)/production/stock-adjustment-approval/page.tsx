'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

export default function StockAdjustmentApprovalPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Stock Adjustment Approval</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>
          Approve or reject submitted stock adjustments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Adjustments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <CheckSquare className="w-16 h-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>
                Stock Adjustment Approval
              </h3>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                Approval interface will be implemented here
              </p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                No pending adjustments at this time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
