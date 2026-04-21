'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { ClipboardList, Plus, Search, FileText } from 'lucide-react';

export default function ProductionPlanPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Production Plan</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            Generate daily production planning sheets with recipes (16 plans)
          </p>
        </div>
        <Button variant="primary" size="md">
          <Plus className="w-4 h-4 mr-2" />
          New Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Production Plans</CardTitle>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">Show Previous Records</Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="Search plans..."
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
              <ClipboardList className="w-16 h-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>
                Production Plan Module
              </h3>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                Production planning and recipe generation interface will be implemented here
              </p>
              <div className="flex items-center justify-center space-x-4 mt-6">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Recipe Sheet
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Stores Issue Note
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
