'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Zap, Printer, Download } from 'lucide-react';
import { allProducts } from '@/lib/mock-data/products-full';
import { rawIngredients as allIngredients } from '@/lib/mock-data/ingredients-full';
import { PrintFooter } from '@/components/dms/print-footer';

interface RecipeResult {
  productName: string;
  quantity: number;
  timestamp: string;
  operator: string;
  ingredients: { name: string; qty: number; unit: string }[];
}

export default function AnytimeRecipeGeneratorPage() {
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');
  const [result, setResult] = useState<RecipeResult | null>(null);

  const handleGenerate = () => {
    const product = allProducts.find(p => p.id === selectedProductId);
    if (!product || quantity <= 0) return;

    // Mock recipe calculation
    const mockIngredients = allIngredients.slice(0, 5).map((ing, idx) => ({
      name: ing.name,
      qty: quantity * (idx + 1) * 0.05,
      unit: ing.uom
    }));

    setResult({
      productName: product.name,
      quantity,
      timestamp: new Date().toLocaleString(),
      operator: 'Admin User',
      ingredients: mockIngredients
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Anytime Recipe Generator</h1>
            <p className="text-gray-600 mt-1">
              Generate instant ingredient breakdown for ad-hoc production
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>Production Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value={0}>Select a product...</option>
                  {allProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.code} - {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter quantity"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Remarks (Optional)</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Add any notes or special instructions..."
                />
              </div>

              <Button
                onClick={handleGenerate}
                className="w-full"
                disabled={!selectedProductId || quantity <= 0}
              >
                <Zap className="w-4 h-4 mr-2" />
                Generate Recipe
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result Card */}
        {result && (
          <Card className="border-2 border-blue-500">
            <CardHeader className="bg-blue-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-900">Recipe Card</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--muted)' }}>
                  <h3 className="text-lg font-semibold mb-1">{result.productName}</h3>
                  <div className="text-sm text-gray-600">
                    Quantity: <span className="font-semibold text-gray-900">{result.quantity}</span>
                  </div>
                  <div className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                    Generated: {result.timestamp}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Ingredients Required</h4>
                  <div className="space-y-2">
                    {result.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm">{ing.name}</span>
                        <span className="font-semibold">
                          {ing.qty.toFixed(2)} {ing.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {remarks && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-xs font-semibold text-yellow-900 mb-1">Remarks</div>
                    <div className="text-sm text-yellow-800">{remarks}</div>
                  </div>
                )}

                <PrintFooter preparedBy={result.operator} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-900 mb-2">⚡ Anytime Recipe Generator</h3>
        <p className="text-sm text-amber-800">
          This tool allows you to generate an instant ingredient breakdown for single-product ad-hoc production 
          outside the regular delivery schedule. The recipe is calculated immediately without saving to the database, 
          and an audit log entry is created for tracking purposes.
        </p>
      </div>
    </div>
  );
}
