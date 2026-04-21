'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function ShowroomLabelPrintingPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Showroom Label Printing</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>
          Print labels showing showroom code names
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Showroom Label Print Request</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <Printer className="w-16 h-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>
                Showroom Label Printing
              </h3>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                Select showroom code, enter custom text, and specify label count to generate print requests
              </p>
              <Button variant="primary" size="md">
                <Printer className="w-4 h-4 mr-2" />
                Create Print Request
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
