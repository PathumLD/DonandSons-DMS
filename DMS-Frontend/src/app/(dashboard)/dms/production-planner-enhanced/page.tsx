'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { ChefHat, Download, Calendar, Clock, AlertCircle } from 'lucide-react';
import { mockEnhancedProducts, mockOrderEntryProducts } from '@/lib/mock-data/enhanced-data';
import { mockSectionConfigurations, ProductionSection } from '@/lib/mock-data/enhanced-models';
import { Badge } from '@/components/ui/badge';

interface ProductionItem {
  productId: number;
  productCode: string;
  productName: string;
  regularFullQty: number;
  regularMiniQty: number;
  customizedFullQty: number;
  customizedMiniQty: number;
  totalFullQty: number;
  totalMiniQty: number;
  grandTotal: number;
  freezerStock: number;
  produceQty: number;
  isExcluded: boolean;
  sections: ProductionSection[];
}

interface CustomizedOrder {
  orderNo: string;
  productId: number;
  productCode: string;
  productName: string;
  fullQty: number;
  miniQty: number;
  customizationNotes: string;
  outletName: string;
}

export default function ProductionPlannerEnhancedPage() {
  const [selectedDate, setSelectedDate] = useState('2026-04-22');
  const [selectedTurn, setSelectedTurn] = useState('5:00 AM');
  const [useFreezerStock, setUseFreezerStock] = useState(false);

  // Mock production data
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([
    {
      productId: 1,
      productCode: 'BR2',
      productName: 'Sandwich Bread Large',
      regularFullQty: 450,
      regularMiniQty: 320,
      customizedFullQty: 15,
      customizedMiniQty: 10,
      totalFullQty: 465,
      totalMiniQty: 330,
      grandTotal: 795,
      freezerStock: 45,
      produceQty: 795,
      isExcluded: false,
      sections: ['Bakery 1'],
    },
    {
      productId: 2,
      productCode: 'BU10',
      productName: 'Vegetable Bun',
      regularFullQty: 580,
      regularMiniQty: 420,
      customizedFullQty: 30,
      customizedMiniQty: 20,
      totalFullQty: 610,
      totalMiniQty: 440,
      grandTotal: 1050,
      freezerStock: 60,
      produceQty: 1050,
      isExcluded: false,
      sections: ['Bakery 1', 'Filling Section'],
    },
    {
      productId: 3,
      productCode: 'BU12',
      productName: 'Fish Bun',
      regularFullQty: 520,
      regularMiniQty: 380,
      customizedFullQty: 0,
      customizedMiniQty: 0,
      totalFullQty: 520,
      totalMiniQty: 380,
      grandTotal: 900,
      freezerStock: 50,
      produceQty: 900,
      isExcluded: false,
      sections: ['Bakery 1', 'Filling Section'],
    },
    {
      productId: 4,
      productCode: 'EGB',
      productName: 'Egg Bun',
      regularFullQty: 380,
      regularMiniQty: 280,
      customizedFullQty: 25,
      customizedMiniQty: 15,
      totalFullQty: 405,
      totalMiniQty: 295,
      grandTotal: 700,
      freezerStock: 35,
      produceQty: 700,
      isExcluded: false,
      sections: ['Bakery 1', 'Filling Section', 'Garnish Section'],
    },
  ]);

  // Mock customized orders
  const customizedOrders: CustomizedOrder[] = [
    {
      orderNo: 'CO-2026-001',
      productId: 1,
      productCode: 'BR2',
      productName: 'Sandwich Bread Large',
      fullQty: 10,
      miniQty: 5,
      customizationNotes: 'Extra soft, no crust on sides',
      outletName: 'Colombo Main',
    },
    {
      orderNo: 'CO-2026-002',
      productId: 1,
      productCode: 'BR2',
      productName: 'Sandwich Bread Large',
      fullQty: 5,
      miniQty: 5,
      customizationNotes: 'Well-toasted edges',
      outletName: 'Kandy Branch',
    },
    {
      orderNo: 'CO-2026-003',
      productId: 2,
      productCode: 'BU10',
      productName: 'Vegetable Bun',
      fullQty: 20,
      miniQty: 10,
      customizationNotes: 'Extra spicy filling',
      outletName: 'Galle Outlet',
    },
    {
      orderNo: 'CO-2026-004',
      productId: 2,
      productCode: 'BU10',
      productName: 'Vegetable Bun',
      fullQty: 10,
      miniQty: 10,
      customizationNotes: 'Mild spice, no green chilies',
      outletName: 'Negombo Branch',
    },
    {
      orderNo: 'CO-2026-005',
      productId: 4,
      productCode: 'EGB',
      productName: 'Egg Bun',
      fullQty: 25,
      miniQty: 15,
      customizationNotes: 'Double egg garnish',
      outletName: 'Colombo Main',
    },
  ];

  const toggleProductExclusion = (productId: number) => {
    setProductionItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, isExcluded: !item.isExcluded } : item
      )
    );
  };

  const calculateProduceQty = (item: ProductionItem): number => {
    if (useFreezerStock) {
      return Math.max(0, item.grandTotal - item.freezerStock);
    }
    return item.grandTotal;
  };

  // Group by section
  const groupBySection = () => {
    const sectionGroups: { [key: string]: ProductionItem[] } = {};

    productionItems.forEach((item) => {
      item.sections.forEach((section) => {
        if (!sectionGroups[section]) {
          sectionGroups[section] = [];
        }
        if (!sectionGroups[section].find((i) => i.productId === item.productId)) {
          sectionGroups[section].push({
            ...item,
            produceQty: calculateProduceQty(item),
          });
        }
      });
    });

    return sectionGroups;
  };

  const sectionGroups = groupBySection();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            Production Planner
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Section-wise production planning with customized order tracking
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="md">
            <Download className="w-4 h-4 mr-2" />
            Export Section Reports
          </Button>
        </div>
      </div>

      {/* Delivery Plan Info */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-5 gap-4">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Delivery Date
              </p>
              <div className="flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-2" style={{ color: '#C8102E' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  {selectedDate}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Delivery Turn
              </p>
              <div className="flex items-center mt-1">
                <Clock className="w-4 h-4 mr-2" style={{ color: '#C8102E' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  {selectedTurn}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Day Type
              </p>
              <Badge variant="neutral" className="mt-1">
                Weekday
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Customized Orders
              </p>
              <p className="text-lg font-bold mt-1" style={{ color: '#C8102E' }}>
                {customizedOrders.length}
              </p>
            </div>
            <div>
              <label className="flex items-center space-x-2 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={useFreezerStock}
                  onChange={(e) => setUseFreezerStock(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium" style={{ color: '#1E40AF' }}>
                  Use Freezer Stock
                </span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customized Orders Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" style={{ color: '#F59E0B' }} />
            Customized Orders (Display Separately)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {customizedOrders.map((order) => (
              <div
                key={order.orderNo}
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--dms-orange)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span
                        className="text-xs font-mono px-2 py-1 rounded"
                        style={{ backgroundColor: 'var(--dms-orange-chip)', color: 'var(--dms-orange-chip-fg)' }}
                      >
                        {order.orderNo}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--dms-orange-fg)' }}>
                        {order.productCode} - {order.productName}
                      </span>
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--dms-orange-fg)' }}>
                      <strong>Outlet:</strong> {order.outletName} |{' '}
                      <strong>Quantity:</strong> {order.fullQty} Full, {order.miniQty} Mini
                    </p>
                    <p className="text-xs mt-1 italic" style={{ color: 'var(--dms-amber-fg)' }}>
                      {order.customizationNotes}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section-wise Production */}
      {Object.entries(sectionGroups).map(([sectionName, items]) => {
        const sectionConfig = mockSectionConfigurations.find(
          (s) => s.name === sectionName
        );

        return (
          <Card key={sectionName}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <ChefHat className="w-5 h-5 mr-2" style={{ color: '#C8102E' }} />
                  <span>{sectionName}</span>
                </div>
                {sectionConfig && (
                  <div className="flex items-center space-x-4 text-sm">
                    <span style={{ color: 'var(--muted-foreground)' }}>
                      Production Start: <strong>{sectionConfig.productionStartTime}</strong>
                    </span>
                    <span style={{ color: 'var(--muted-foreground)' }}>
                      Delivery: <strong>{sectionConfig.effectiveDeliveryTime}</strong> (
                      {sectionConfig.effectiveDeliveryDate})
                    </span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
                  <thead style={{ backgroundColor: 'var(--muted)' }}>
                    <tr>
                      <th
                        className="px-3 py-2 text-left text-xs font-medium"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        Exclude
                      </th>
                      <th
                        className="px-3 py-2 text-left text-xs font-medium"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        Code
                      </th>
                      <th
                        className="px-3 py-2 text-left text-xs font-medium"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        Product
                      </th>
                      <th
                        className="px-3 py-2 text-center text-xs font-medium"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        Regular Full
                      </th>
                      <th
                        className="px-3 py-2 text-center text-xs font-medium"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        Regular Mini
                      </th>
                      <th
                        className="px-3 py-2 text-center text-xs font-medium"
                        style={{ color: '#F59E0B' }}
                      >
                        Custom Full
                      </th>
                      <th
                        className="px-3 py-2 text-center text-xs font-medium"
                        style={{ color: '#F59E0B' }}
                      >
                        Custom Mini
                      </th>
                      <th
                        className="px-3 py-2 text-center text-xs font-medium"
                        style={{ color: '#C8102E' }}
                      >
                        Total Full
                      </th>
                      <th
                        className="px-3 py-2 text-center text-xs font-medium"
                        style={{ color: '#C8102E' }}
                      >
                        Total Mini
                      </th>
                      <th
                        className="px-3 py-2 text-center text-xs font-medium"
                        style={{ color: 'var(--dms-amber-fg)', backgroundColor: 'var(--dms-amber)' }}
                      >
                        Grand Total
                      </th>
                      {useFreezerStock && (
                        <>
                          <th
                            className="px-3 py-2 text-center text-xs font-medium"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            Freezer Stock
                          </th>
                          <th
                            className="px-3 py-2 text-center text-xs font-medium"
                            style={{ color: 'var(--dms-blue-fg)', backgroundColor: 'var(--dms-blue)' }}
                          >
                            Produce Qty
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                  >
                    {items.map((item) => (
                      <tr
                        key={item.productId}
                        style={{
                          backgroundColor: item.isExcluded
                            ? 'var(--dms-surface-muted)'
                            : 'var(--dms-surface)',
                        }}
                      >
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={item.isExcluded}
                            onChange={() => toggleProductExclusion(item.productId)}
                            className="w-4 h-4 rounded"
                          />
                        </td>
                        <td
                          className="px-3 py-2 text-sm font-mono"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          {item.productCode}
                        </td>
                        <td
                          className="px-3 py-2 text-sm font-medium"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {item.productName}
                        </td>
                        <td className="px-3 py-2 text-center text-sm">
                          {item.regularFullQty}
                        </td>
                        <td className="px-3 py-2 text-center text-sm">
                          {item.regularMiniQty}
                        </td>
                        <td
                          className="px-3 py-2 text-center text-sm font-semibold"
                          style={{ color: 'var(--status-warning)', backgroundColor: 'var(--dms-orange)' }}
                        >
                          {item.customizedFullQty}
                        </td>
                        <td
                          className="px-3 py-2 text-center text-sm font-semibold"
                          style={{ color: 'var(--status-warning)', backgroundColor: 'var(--dms-orange)' }}
                        >
                          {item.customizedMiniQty}
                        </td>
                        <td
                          className="px-3 py-2 text-center text-sm font-bold"
                          style={{ color: 'var(--dms-amber-fg)' }}
                        >
                          {item.totalFullQty}
                        </td>
                        <td
                          className="px-3 py-2 text-center text-sm font-bold"
                          style={{ color: 'var(--dms-amber-fg)' }}
                        >
                          {item.totalMiniQty}
                        </td>
                        <td
                          className="px-3 py-2 text-center text-sm font-bold"
                          style={{ color: 'var(--dms-amber-fg)', backgroundColor: 'var(--dms-amber)' }}
                        >
                          {item.grandTotal}
                        </td>
                        {useFreezerStock && (
                          <>
                            <td className="px-3 py-2 text-center text-sm">
                              {item.freezerStock}
                            </td>
                            <td
                              className="px-3 py-2 text-center text-sm font-bold"
                              style={{ color: 'var(--dms-blue-fg)', backgroundColor: 'var(--dms-blue)' }}
                            >
                              {item.produceQty}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Legend */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: 'var(--dms-success-callout)', border: '1px solid var(--dms-success-border)' }}
      >
        <p className="text-sm" style={{ color: 'var(--dms-success-text)' }}>
          <strong>Note:</strong> Customized orders are displayed separately above and
          included in the total quantities. Each section shows only products relevant to
          that section. Production start times vary by section (e.g., Bakery starts at
          11:00 PM, Short-Eats starts at 2:00 AM).
        </p>
      </div>
    </div>
  );
}
