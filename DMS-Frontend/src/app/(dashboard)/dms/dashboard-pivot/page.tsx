'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { FileBarChart, Filter, Download } from 'lucide-react';
import { mockDeliveryTurns } from '@/lib/mock-data/delivery-turns';
import { mockDayTypes } from '@/lib/mock-data/day-types';
import { mockOutletsFull } from '@/lib/mock-data/outlets-with-variants';
import { allProducts } from '@/lib/mock-data/products-full';

export default function DashboardPivotPage() {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedTurns, setSelectedTurns] = useState<number[]>([1]);
  const [selectedOutlets, setSelectedOutlets] = useState<number[]>([]);
  const [dateFrom, setDateFrom] = useState('2026-04-01');
  const [dateTo, setDateTo] = useState('2026-04-22');

  // Mock pivot data
  const mockPivotData: Array<{ product: string; [key: string]: string | number }> = 
    selectedProducts.length > 0 && selectedOutlets.length > 0
      ? allProducts
          .filter(p => selectedProducts.includes(p.id))
          .slice(0, 5)
          .map(product => ({
            product: product.name,
            ...Object.fromEntries(
              mockOutletsFull
                .filter(o => selectedOutlets.includes(o.id))
                .slice(0, 4)
                .map(outlet => [outlet.code, Math.floor(Math.random() * 100)])
            )
          }))
      : [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <FileBarChart className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pivot Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Multi-dimensional analysis with slicer filters (Product × Turn × Route × Day-Type)
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
            <Button variant="outline" size="sm">
              Reset Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Products (Multi-select)</label>
              <select
                multiple
                value={selectedProducts.map(String)}
                onChange={(e) => setSelectedProducts(
                  Array.from(e.target.selectedOptions).map(o => parseInt(o.value))
                )}
                className="w-full px-3 py-2 border rounded-lg h-32"
              >
                {allProducts.slice(0, 20).map(product => (
                  <option key={product.id} value={product.id}>
                    {product.code} - {product.name}
                  </option>
                ))}
              </select>
              <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {selectedProducts.length} selected
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Delivery Turns</label>
              <select
                multiple
                value={selectedTurns.map(String)}
                onChange={(e) => setSelectedTurns(
                  Array.from(e.target.selectedOptions).map(o => parseInt(o.value))
                )}
                className="w-full px-3 py-2 border rounded-lg h-32"
              >
                {mockDeliveryTurns.map(turn => (
                  <option key={turn.id} value={turn.id}>
                    {turn.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Routes/Outlets</label>
              <select
                multiple
                value={selectedOutlets.map(String)}
                onChange={(e) => setSelectedOutlets(
                  Array.from(e.target.selectedOptions).map(o => parseInt(o.value))
                )}
                className="w-full px-3 py-2 border rounded-lg h-32"
              >
                {mockOutletsFull.map(outlet => (
                  <option key={outlet.id} value={outlet.id}>
                    {outlet.code} - {outlet.name}
                  </option>
                ))}
              </select>
              <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {selectedOutlets.length} selected
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="flex items-end">
              <Button className="w-full">
                <FileBarChart className="w-4 h-4 mr-2" />
                Generate Pivot
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pivot Grid */}
      {mockPivotData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pivot Grid</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: 'var(--muted)' }}>
                    <th className="border p-2 text-left font-semibold" style={{ borderColor: 'var(--border)' }}>Product</th>
                    {mockOutletsFull.filter(o => selectedOutlets.includes(o.id)).slice(0, 4).map(outlet => (
                      <th key={outlet.id} className="border p-2 text-center font-semibold">
                        {outlet.code}
                      </th>
                    ))}
                    <th className="border p-2 text-center font-semibold bg-blue-100">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPivotData.map((row, idx) => {
                    const outlets = mockOutletsFull.filter(o => selectedOutlets.includes(o.id)).slice(0, 4);
                    const total = outlets.reduce((sum, outlet) => sum + (Number(row[outlet.code]) || 0), 0);
                    return (
                      <tr key={idx} className="[&:hover]:bg-[var(--muted)]" style={{ backgroundColor: 'var(--card)' }}>
                        <td className="border p-2 font-medium" style={{ borderColor: 'var(--border)' }}>{row.product}</td>
                        {outlets.map(outlet => (
                          <td key={outlet.id} className="border p-2 text-center" style={{ borderColor: 'var(--border)' }}>
                            {row[outlet.code] || 0}
                          </td>
                        ))}
                        <td
                          className="border p-2 text-center font-bold"
                          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--dms-blue)' }}
                        >
                          {total}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {mockPivotData.length === 0 && (
        <div
          className="text-center py-12 rounded-lg border-2 border-dashed"
          style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}
        >
          <FileBarChart className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>
            Select products and outlets, then generate the pivot to see the analysis
          </p>
        </div>
      )}
    </div>
  );
}
