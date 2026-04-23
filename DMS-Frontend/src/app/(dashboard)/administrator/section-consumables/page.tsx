'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mockSectionConsumables, SectionConsumable } from '@/lib/mock-data/section-consumables';
import { ProductionSection } from '@/lib/mock-data/enhanced-models';

export default function SectionConsumablesPage() {
  const [consumables, setConsumables] = useState<SectionConsumable[]>(mockSectionConsumables);
  const [selectedSection, setSelectedSection] = useState<ProductionSection | 'all'>('all');

  const sections: (ProductionSection | 'all')[] = [
    'all',
    'Bakery 1',
    'Filling Section',
    'Pastry Section',
    'Short-Eats 1',
    'Rotty Section',
    'Packing Section'
  ];

  const filteredConsumables = selectedSection === 'all'
    ? consumables
    : consumables.filter(c => c.sectionName === selectedSection);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Section Consumables</h1>
        <p className="text-gray-600 mt-1">
          Manage non-ingredient consumables per production section
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium">Filter by Section:</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value as any)}
              className="px-3 py-2 border rounded-lg"
            >
              {sections.map(section => (
                <option key={section} value={section}>
                  {section === 'all' ? 'All Sections' : section}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Consumables ({filteredConsumables.length})</CardTitle>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Consumable
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold">Section</th>
                  <th className="text-left p-3 text-sm font-semibold">Item Name</th>
                  <th className="text-center p-3 text-sm font-semibold">UoM</th>
                  <th className="text-center p-3 text-sm font-semibold">Calc Basis</th>
                  <th className="text-center p-3 text-sm font-semibold">Qty</th>
                  <th className="text-left p-3 text-sm font-semibold">Description</th>
                  <th className="text-center p-3 text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsumables.map(consumable => (
                  <tr key={consumable.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm font-medium">{consumable.sectionName}</td>
                    <td className="p-3 font-medium">{consumable.name}</td>
                    <td className="p-3 text-center text-sm">{consumable.uom}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded ${
                        consumable.calcBasis === 'PerUnit' ? 'bg-blue-100 text-blue-800' :
                        consumable.calcBasis === 'Batch' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {consumable.calcBasis}
                      </span>
                    </td>
                    <td className="p-3 text-center text-sm">
                      {consumable.qtyPerUnit || consumable.qtyPerBatch || consumable.fixedQty || '-'}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {consumable.description || '-'}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded ${consumable.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {consumable.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Calculation Basis Explained</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Per Unit:</strong> Quantity calculated per item produced (e.g., 1 label per product)</li>
          <li><strong>Batch:</strong> Quantity calculated per production batch (e.g., 10 gloves per batch of 100)</li>
          <li><strong>Fixed:</strong> Fixed quantity per day regardless of production volume</li>
        </ul>
      </div>
    </div>
  );
}
