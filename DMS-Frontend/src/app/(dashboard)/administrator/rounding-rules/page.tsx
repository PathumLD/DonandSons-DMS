'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Save, Filter } from 'lucide-react';
import { allProducts, getBakeryRoundingProducts } from '@/lib/mock-data/products-full';
import { ProductionSection } from '@/lib/mock-data/enhanced-models';

export default function RoundingRulesPage() {
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [previewMode, setPreviewMode] = useState(false);
  const [bulkRoundingValue, setBulkRoundingValue] = useState<number>(1);

  const sections: (ProductionSection | 'all')[] = [
    'all',
    'Bakery 1',
    'Bakery 2',
    'Filling Section',
    'Plain Roll Section',
    'Pastry Section',
    'Short-Eats 1',
    'Rotty Section'
  ];

  const filteredProducts = selectedSection === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.section === selectedSection);

  const handleBulkApply = () => {
    if (confirm(`Apply rounding value ${bulkRoundingValue} to ${filteredProducts.length} products?`)) {
      setPreviewMode(false);
      alert('Bulk rounding rules applied successfully!');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rounding Rules Manager</h1>
        <p className="text-gray-600 mt-1">
          Bulk manage rounding values for products by section
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {sections.map(section => (
                  <option key={section} value={section}>
                    {section === 'all' ? 'All Sections' : section}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium mb-2">Bulk Rounding Value</label>
              <select
                value={bulkRoundingValue}
                onChange={(e) => setBulkRoundingValue(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value={1}>Round to 1</option>
                <option value={5}>Round to 5</option>
                <option value={10}>Round to 10</option>
                <option value={0.25}>Round to 0.25</option>
              </select>
            </div>
            <Button
              onClick={() => setPreviewMode(true)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Preview ({filteredProducts.length} items)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {previewMode && (
        <Card className="mb-6 border-2 border-blue-500">
          <CardHeader className="bg-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-900">Preview Changes</CardTitle>
              <div className="flex gap-2">
                <Button onClick={handleBulkApply} variant="primary">
                  <Save className="w-4 h-4 mr-2" />
                  Apply to {filteredProducts.length} Products
                </Button>
                <Button onClick={() => setPreviewMode(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-sm font-semibold">Code</th>
                  <th className="text-left p-2 text-sm font-semibold">Product Name</th>
                  <th className="text-left p-2 text-sm font-semibold">Section</th>
                  <th className="text-center p-2 text-sm font-semibold">Current Rounding</th>
                  <th className="text-center p-2 text-sm font-semibold">
                    {previewMode ? 'New Rounding' : 'New Value'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-sm">{product.code}</td>
                    <td className="p-2">{product.name}</td>
                    <td className="p-2 text-sm text-gray-600">{product.section}</td>
                    <td className="p-2 text-center">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm font-semibold">
                        {product.roundingValue}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      {previewMode ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold">
                          {bulkRoundingValue}
                        </span>
                      ) : (
                        <input
                          type="number"
                          step="0.25"
                          defaultValue={product.roundingValue}
                          className="w-20 px-2 py-1 border rounded text-center"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
