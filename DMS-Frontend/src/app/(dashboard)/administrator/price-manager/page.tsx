'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { TrendingUp, Plus, Search } from 'lucide-react';

export default function PriceManagerPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Price Manager</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            Schedule product price changes (2,072 records)
          </p>
        </div>
        <Button variant="primary" size="md">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Price Change
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Price Change History</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search price changes..."
                className="pl-10 pr-4 py-2 rounded-lg text-sm"
                style={{ border: '1px solid #D1D5DB' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>
                Price Manager Module
              </h3>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                Price management interface will be implemented here
              </p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                Schedule future price changes with audit trail
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
