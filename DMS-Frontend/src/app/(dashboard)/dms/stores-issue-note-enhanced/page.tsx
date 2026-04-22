'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Select from '@/components/ui/select';
import { FileText, Download, AlertTriangle } from 'lucide-react';
import { mockEnhancedIngredients } from '@/lib/mock-data/enhanced-data';
import { mockSectionConfigurations, ProductionSection } from '@/lib/mock-data/enhanced-models';
import { Badge } from '@/components/ui/badge';

interface StoresIngredient {
  ingredientId: number;
  ingredientCode: string;
  ingredientName: string;
  productionQty: number;
  extraQty: number;
  storesQty: number;
  unit: string;
  notes?: string;
  showExtraInStoresOnly: boolean;
}

interface ProductBreakdown {
  productCode: string;
  productName: string;
  fullQty: number;
  miniQty: number;
  customizedQty: number;
  totalQty: number;
}

export default function StoresIssueNoteEnhancedPage() {
  const [selectedSection, setSelectedSection] = useState<ProductionSection>('Bakery 1');
  const [selectedDate, setSelectedDate] = useState('2026-04-22');
  const [selectedTurn, setSelectedTurn] = useState('5:00 AM');
  const [useFreezerStock, setUseFreezerStock] = useState(false);

  // Mock data - Section-wise ingredients
  const storesIngredients: { [key: string]: StoresIngredient[] } = {
    'Bakery 1': [
      {
        ingredientId: 1,
        ingredientCode: 'FLR001',
        ingredientName: 'Wheat Flour',
        productionQty: 450,
        extraQty: 22.5,
        storesQty: 472.5,
        unit: 'kg',
        notes: '5% extra for spillage',
        showExtraInStoresOnly: true,
      },
      {
        ingredientId: 5,
        ingredientCode: 'SGR001',
        ingredientName: 'Sugar',
        productionQty: 65,
        extraQty: 1.95,
        storesQty: 66.95,
        unit: 'kg',
        notes: '3% buffer',
        showExtraInStoresOnly: true,
      },
      {
        ingredientId: 6,
        ingredientCode: 'YST001',
        ingredientName: 'Yeast',
        productionQty: 2800,
        extraQty: 140,
        storesQty: 2940,
        unit: 'g',
        notes: '5% buffer',
        showExtraInStoresOnly: true,
      },
      {
        ingredientId: 7,
        ingredientCode: 'BTR001',
        ingredientName: 'Butter',
        productionQty: 45,
        extraQty: 0,
        storesQty: 45,
        unit: 'kg',
        showExtraInStoresOnly: false,
      },
      {
        ingredientId: 3,
        ingredientCode: 'EGG001',
        ingredientName: 'Raw Eggs',
        productionQty: 350,
        extraQty: 0,
        storesQty: 350,
        unit: 'Nos',
        notes: 'For dough only',
        showExtraInStoresOnly: false,
      },
    ],
    'Filling Section': [
      {
        ingredientId: 2,
        ingredientCode: 'CRT001',
        ingredientName: 'Carrot',
        productionQty: 120,
        extraQty: 18,
        storesQty: 138,
        unit: 'kg',
        notes: '15% extra for cleaning loss',
        showExtraInStoresOnly: true,
      },
      {
        ingredientId: 3,
        ingredientCode: 'EGG001',
        ingredientName: 'Raw Eggs',
        productionQty: 180,
        extraQty: 0,
        storesQty: 180,
        unit: 'Nos',
        notes: 'For filling',
        showExtraInStoresOnly: false,
      },
    ],
    'Garnish Section': [
      {
        ingredientId: 4,
        ingredientCode: 'EGG002',
        ingredientName: 'Boiled Eggs',
        productionQty: 95,
        extraQty: 0,
        storesQty: 95,
        unit: 'Nos',
        notes: 'Pre-boiled',
        showExtraInStoresOnly: false,
      },
      {
        ingredientId: 3,
        ingredientCode: 'EGG001',
        ingredientName: 'Raw Eggs (for garnish)',
        productionQty: 50,
        extraQty: 0,
        storesQty: 50,
        unit: 'Nos',
        notes: 'Raw for garnishing',
        showExtraInStoresOnly: false,
      },
    ],
  };

  // Mock product breakdown
  const productBreakdown: { [key: string]: ProductBreakdown[] } = {
    'Bakery 1': [
      {
        productCode: 'BR2',
        productName: 'Sandwich Bread Large',
        fullQty: 450,
        miniQty: 320,
        customizedQty: 25,
        totalQty: 795,
      },
      {
        productCode: 'BU10',
        productName: 'Vegetable Bun (Dough)',
        fullQty: 580,
        miniQty: 420,
        customizedQty: 50,
        totalQty: 1050,
      },
      {
        productCode: 'BU12',
        productName: 'Fish Bun (Dough)',
        fullQty: 520,
        miniQty: 380,
        customizedQty: 0,
        totalQty: 900,
      },
      {
        productCode: 'EGB',
        productName: 'Egg Bun (Dough)',
        fullQty: 380,
        miniQty: 280,
        customizedQty: 40,
        totalQty: 700,
      },
    ],
    'Filling Section': [
      {
        productCode: 'BU10',
        productName: 'Vegetable Bun (Filling)',
        fullQty: 580,
        miniQty: 420,
        customizedQty: 50,
        totalQty: 1050,
      },
      {
        productCode: 'BU12',
        productName: 'Fish Bun (Filling)',
        fullQty: 520,
        miniQty: 380,
        customizedQty: 0,
        totalQty: 900,
      },
      {
        productCode: 'EGB',
        productName: 'Egg Bun (Filling)',
        fullQty: 380,
        miniQty: 280,
        customizedQty: 40,
        totalQty: 700,
      },
    ],
    'Garnish Section': [
      {
        productCode: 'EGB',
        productName: 'Egg Bun (Garnish)',
        fullQty: 380,
        miniQty: 280,
        customizedQty: 40,
        totalQty: 700,
      },
    ],
  };

  const sectionConfig = mockSectionConfigurations.find((s) => s.name === selectedSection);
  const currentIngredients = storesIngredients[selectedSection] || [];
  const currentProducts = productBreakdown[selectedSection] || [];

  const handleExport = () => {
    alert(`Exporting Stores Issue Note for ${selectedSection}`);
  };

  const calculateTotalStoresQty = () => {
    return currentIngredients.reduce((sum, ing) => {
      if (useFreezerStock) {
        // In stores sheet, we show reduced quantities
        return sum + ing.storesQty;
      }
      return sum + ing.storesQty;
    }, 0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>
            Stores Issue Note
          </h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            Section-wise ingredient requirements with extra quantities
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="primary" size="md" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Section Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Section
              </label>
              <Select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value as ProductionSection)}
                options={mockSectionConfigurations.map((s) => ({
                  value: s.name,
                  label: s.name,
                }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Delivery Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded border"
                style={{ borderColor: '#D1D5DB' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Delivery Turn
              </label>
              <Select
                value={selectedTurn}
                onChange={(e) => setSelectedTurn(e.target.value)}
                options={[
                  { value: '5:00 AM', label: '5:00 AM' },
                  { value: '10:30 AM', label: '10:30 AM' },
                  { value: '3:30 PM', label: '3:30 PM' },
                ]}
              />
            </div>
            <div>
              {sectionConfig && (
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                    Production Start
                  </label>
                  <p className="text-sm font-semibold mt-2" style={{ color: '#C8102E' }}>
                    {sectionConfig.productionStartTime}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Options
              </label>
              <label className="flex items-center space-x-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={useFreezerStock}
                  onChange={(e) => setUseFreezerStock(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm" style={{ color: '#111827' }}>
                  Use Freezer Stock
                </span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: '#FEF3C4', border: '1px solid #FDE68A' }}
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: '#92400E' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#92400E' }}>
              Extra Quantity Display Rules:
            </p>
            <ul className="text-sm mt-2 space-y-1" style={{ color: '#92400E' }}>
              <li>
                • <strong>Stores Issue Note:</strong> Shows BOTH production quantity AND extra
                quantity (total to be issued)
              </li>
              <li>
                • <strong>Production Sheet:</strong> Shows ONLY production quantity (correct
                recipe values)
              </li>
              <li>
                • <strong>Reason:</strong> Extra quantity is for handling loss (cleaning,
                spillage) - stores needs total, production needs recipe value
              </li>
              <li>
                • <strong>Freezer Stock:</strong> When enabled, shows reduced balance in stores
                sheet
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Product Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Product Breakdown - {selectedSection}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: '#E5E7EB' }}>
              <thead style={{ backgroundColor: '#F9FAFB' }}>
                <tr>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium"
                    style={{ color: '#6B7280' }}
                  >
                    Product Code
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium"
                    style={{ color: '#6B7280' }}
                  >
                    Product Name
                  </th>
                  <th
                    className="px-3 py-2 text-center text-xs font-medium"
                    style={{ color: '#6B7280' }}
                  >
                    Full Qty
                  </th>
                  <th
                    className="px-3 py-2 text-center text-xs font-medium"
                    style={{ color: '#6B7280' }}
                  >
                    Mini Qty
                  </th>
                  <th
                    className="px-3 py-2 text-center text-xs font-medium"
                    style={{ color: '#F59E0B' }}
                  >
                    Customized Qty
                  </th>
                  <th
                    className="px-3 py-2 text-center text-xs font-medium"
                    style={{ color: '#C8102E', backgroundColor: '#FEF3C4' }}
                  >
                    Total Qty
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ backgroundColor: 'white', borderColor: '#E5E7EB' }}
              >
                {currentProducts.map((product, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 text-sm font-mono" style={{ color: '#6B7280' }}>
                      {product.productCode}
                    </td>
                    <td className="px-3 py-2 text-sm" style={{ color: '#111827' }}>
                      {product.productName}
                    </td>
                    <td className="px-3 py-2 text-center text-sm">{product.fullQty}</td>
                    <td className="px-3 py-2 text-center text-sm">{product.miniQty}</td>
                    <td
                      className="px-3 py-2 text-center text-sm font-semibold"
                      style={{ color: '#F59E0B', backgroundColor: '#FFF7ED' }}
                    >
                      {product.customizedQty}
                    </td>
                    <td
                      className="px-3 py-2 text-center text-sm font-bold"
                      style={{ color: '#C8102E', backgroundColor: '#FEF3C4' }}
                    >
                      {product.totalQty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients with Extra Quantities */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredient Requirements - {selectedSection}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: '#E5E7EB' }}>
              <thead style={{ backgroundColor: '#F9FAFB' }}>
                <tr>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium"
                    style={{ color: '#6B7280' }}
                  >
                    Ingredient Code
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium"
                    style={{ color: '#6B7280' }}
                  >
                    Ingredient Name
                  </th>
                  <th
                    className="px-3 py-2 text-center text-xs font-medium"
                    style={{ color: '#6B7280' }}
                  >
                    Production Qty
                  </th>
                  <th
                    className="px-3 py-2 text-center text-xs font-medium"
                    style={{ color: '#F59E0B' }}
                  >
                    Extra Qty
                  </th>
                  <th
                    className="px-3 py-2 text-center text-xs font-medium"
                    style={{ color: '#C8102E', backgroundColor: '#FEF3C4' }}
                  >
                    Stores Qty
                  </th>
                  <th
                    className="px-3 py-2 text-center text-xs font-medium"
                    style={{ color: '#6B7280' }}
                  >
                    Unit
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium"
                    style={{ color: '#6B7280' }}
                  >
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ backgroundColor: 'white', borderColor: '#E5E7EB' }}
              >
                {currentIngredients.map((ingredient) => (
                  <tr key={ingredient.ingredientId}>
                    <td className="px-3 py-2 text-sm font-mono" style={{ color: '#6B7280' }}>
                      {ingredient.ingredientCode}
                    </td>
                    <td className="px-3 py-2 text-sm" style={{ color: '#111827' }}>
                      {ingredient.ingredientName}
                      {ingredient.showExtraInStoresOnly && (
                        <Badge variant="secondary" className="ml-2">
                          Extra in Stores Only
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center text-sm font-semibold">
                      {ingredient.productionQty}
                    </td>
                    <td
                      className="px-3 py-2 text-center text-sm font-semibold"
                      style={{
                        color: ingredient.extraQty > 0 ? '#F59E0B' : '#6B7280',
                        backgroundColor: ingredient.extraQty > 0 ? '#FFF7ED' : 'transparent',
                      }}
                    >
                      {ingredient.extraQty > 0 ? `+${ingredient.extraQty}` : '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-center text-sm font-bold"
                      style={{ color: '#C8102E', backgroundColor: '#FEF3C4' }}
                    >
                      {ingredient.storesQty}
                    </td>
                    <td className="px-3 py-2 text-center text-sm" style={{ color: '#6B7280' }}>
                      {ingredient.unit}
                    </td>
                    <td className="px-3 py-2 text-xs italic" style={{ color: '#6B7280' }}>
                      {ingredient.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC' }}
      >
        <p className="text-sm" style={{ color: '#166534' }}>
          <strong>Color Key:</strong> Production Qty (black) = Recipe quantity for production
          sheet | Extra Qty (orange) = Additional quantity for handling loss | Stores Qty (red)
          = Total to be issued by stores | Customized Qty (orange background) = Customized
          orders shown separately
        </p>
      </div>
    </div>
  );
}
