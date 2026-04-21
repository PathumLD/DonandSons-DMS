'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Workflow, Search } from 'lucide-react';

export default function WorkflowConfigPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>WorkFlow Config</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>
          Configure approval requirements for operations (14 operations)
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Operation Workflow Settings</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search operations..."
                className="pl-10 pr-4 py-2 rounded-lg text-sm"
                style={{ border: '1px solid #D1D5DB' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Workflow className="w-16 h-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>
                WorkFlow Config Module
              </h3>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                Workflow configuration interface will be implemented here
              </p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                Toggle approval requirements and assign approver roles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
