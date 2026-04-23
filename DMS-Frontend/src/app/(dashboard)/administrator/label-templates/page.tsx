'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Plus, Edit, Eye, Printer } from 'lucide-react';

interface LabelTemplate {
  id: number;
  name: string;
  productCode?: string;
  productName?: string;
  width: number;
  height: number;
  orientation: 'Portrait' | 'Landscape';
  fields: string[];
  isDefault: boolean;
  isActive: boolean;
}

export default function LabelTemplatesPage() {
  const [templates] = useState<LabelTemplate[]>([
    {
      id: 1,
      name: 'Standard Product Label',
      width: 100,
      height: 50,
      orientation: 'Landscape',
      fields: ['Product Name', 'Code', 'Date', 'Time', 'Batch No'],
      isDefault: true,
      isActive: true
    },
    {
      id: 2,
      name: 'Egg Sandwich Label',
      productCode: 'SAN1',
      productName: 'Egg Sandwich',
      width: 80,
      height: 40,
      orientation: 'Landscape',
      fields: ['Product Name', 'Qty', 'Date', 'Barcode'],
      isDefault: false,
      isActive: true
    },
    {
      id: 3,
      name: 'Bakery Item Label',
      width: 120,
      height: 60,
      orientation: 'Portrait',
      fields: ['Product Name', 'Weight', 'Ingredients', 'Best Before', 'Barcode'],
      isDefault: false,
      isActive: true
    }
  ]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Label Templates</h1>
        <p className="text-gray-600 mt-1">
          Manage product label templates with per-product customization
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Templates ({templates.length})</CardTitle>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    {template.productName && (
                      <p className="text-sm text-gray-600 mt-1">
                        Bound to: <span className="font-medium">{template.productCode} - {template.productName}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {template.isDefault && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                        Default
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-600">Size:</span>{' '}
                    <span className="font-medium">{template.width}mm × {template.height}mm</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Orientation:</span>{' '}
                    <span className="font-medium">{template.orientation}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-sm text-gray-600">Fields:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.fields.map((field, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Edit className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Printer className="w-3 h-3" />
                    Test Print
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-900 mb-2">Template Binding</h3>
        <p className="text-sm text-amber-800">
          Templates can be bound to specific products (like "Egg Sandwich Label" for product SAN1). 
          When printing from the Production Planner, the product-specific template will be used automatically. 
          If no product-specific template exists, the default template will be used.
        </p>
      </div>
    </div>
  );
}
