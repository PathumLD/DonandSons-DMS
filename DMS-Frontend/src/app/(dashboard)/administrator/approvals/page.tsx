'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const approvalOperations = [
  { name: 'Daily Production', pending: 1 },
  { name: 'Delivery', pending: 3 },
  { name: 'Disposal', pending: 0 },
  { name: 'Stock Transfer', pending: 2 },
  { name: 'Stock BF', pending: 0 },
  { name: 'Cancellation', pending: 1 },
  { name: 'Delivery Return', pending: 0 },
  { name: 'Label Printing', pending: 4 },
];

export default function ApprovalsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Approvals</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>
          Central approval hub for all operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {approvalOperations.map((op) => (
          <Card key={op.name} hover>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#111827' }}>
                    {op.name}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                    {op.pending} pending
                  </p>
                </div>
                {op.pending > 0 && (
                  <Badge variant="warning" size="sm">
                    {op.pending}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <CheckSquare className="w-16 h-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>
                Approvals Module
              </h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Approval workflow interface will be implemented here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
