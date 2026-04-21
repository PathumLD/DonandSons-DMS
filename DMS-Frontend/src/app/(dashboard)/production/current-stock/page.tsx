'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Box, Search, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/button';

export default function CurrentStockPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Current Stock</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            Real-time production stock position for all products
          </p>
        </div>
        <Button variant="primary" size="md">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Production Stock</CardTitle>
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                Current Production Stock on {new Date().toLocaleString()}
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 rounded-lg text-sm"
                style={{ border: '1px solid #D1D5DB' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Box className="w-16 h-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>
                Current Stock Module
              </h3>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                Real-time stock calculation interface will be implemented here
              </p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                Formula: Open Balance + Today Production - Cancelled - Delivery + Cancelled + Returned
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
