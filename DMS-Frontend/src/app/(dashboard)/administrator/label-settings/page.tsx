'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Printer, Plus } from 'lucide-react';

export default function LabelSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Label Settings</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>
          Configure label printers, templates, and comments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Label Printers</CardTitle>
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Printer className="w-12 h-12 mx-auto mb-3" style={{ color: '#9CA3AF' }} />
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Printer configuration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Label Templates</CardTitle>
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Printer className="w-12 h-12 mx-auto mb-3" style={{ color: '#9CA3AF' }} />
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Template mapping
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Label Comments</CardTitle>
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Printer className="w-12 h-12 mx-auto mb-3" style={{ color: '#9CA3AF' }} />
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Pre-defined comments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
