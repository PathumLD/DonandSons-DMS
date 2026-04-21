'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { XCircle, Plus, Search } from 'lucide-react';

export default function CancellationPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Cancellation</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            Record delivery cancellations (76 records)
          </p>
        </div>
        <Button variant="primary" size="md">
          <Plus className="w-4 h-4 mr-2" />
          Add Cancellation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cancellation Records</CardTitle>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">Show Previous Records</Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="Search cancellations..."
                  className="pl-10 pr-4 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #D1D5DB' }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <XCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>
                Cancellation Module
              </h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Delivery cancellation interface will be implemented here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
