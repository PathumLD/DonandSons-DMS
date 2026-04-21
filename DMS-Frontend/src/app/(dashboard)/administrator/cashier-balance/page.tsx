'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DollarSign } from 'lucide-react';

export default function CashierBalancePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Cashier Balance</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>
          Daily cashier cash declaration per showroom
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cashier Balance Form</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <DollarSign className="w-16 h-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>
                Cashier Balance Module
              </h3>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                Cashier balance interface will be implemented here
              </p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                Must be approved before Day-End Process
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
