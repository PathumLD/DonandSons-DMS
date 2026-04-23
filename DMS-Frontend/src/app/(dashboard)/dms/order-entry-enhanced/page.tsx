'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Save, Download, Info, Calendar, Clock } from 'lucide-react';
import { mockOutlets } from '@/lib/mock-data/dms-orders';
import { 
  mockOrderEntryProducts, 
  mockEnhancedProducts,
  mockEnhancedRecipes 
} from '@/lib/mock-data/enhanced-data';
import { 
  mockDeliveryTurnConfigurations,
  OrderEntryProduct,
  DeliveryTurnConfiguration 
} from '@/lib/mock-data/enhanced-models';

export default function OrderEntryEnhancedPage() {
  const [products, setProducts] = useState(mockOrderEntryProducts);
  const [outlets] = useState(mockOutlets);
  const [activeOutlets, setActiveOutlets] = useState<{ [outletId: number]: boolean }>({});
  const [selectedDeliveryTurn, setSelectedDeliveryTurn] = useState<DeliveryTurnConfiguration>(
    mockDeliveryTurnConfigurations[0]
  );
  const [selectedDate, setSelectedDate] = useState('2026-04-22');
  const [orderData, setOrderData] = useState<{
    [productId: number]: {
      [outletId: number]: {
        full: number | string;
        mini: number | string;
      };
    };
  }>({});
  const [extras, setExtras] = useState<{
    [productId: number]: { full: number | string; mini: number | string };
  }>({});
  const [useFreezerStock, setUseFreezerStock] = useState(false);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    // Initialize order data
    const initialData: any = {};
    const initialExtras: any = {};
    const initialActiveOutlets: { [outletId: number]: boolean } = {};

    products.forEach((product) => {
      initialData[product.id] = {};
      initialExtras[product.id] = { full: '', mini: '' };

      outlets.forEach((outlet) => {
        initialData[product.id][outlet.id] = {
          full: '',
          mini: '',
        };
      });
    });

    outlets.forEach((outlet) => {
      initialActiveOutlets[outlet.id] = true;
    });

    setOrderData(initialData);
    setExtras(initialExtras);
    setActiveOutlets(initialActiveOutlets);
  }, [products, outlets]);

  const handleCellChange = (
    productId: number,
    outletId: number,
    type: 'full' | 'mini',
    value: string
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Handle decimal input
    let processedValue: number | string = value;
    if (value !== '') {
      if (product.allowDecimal) {
        // Allow decimal input
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          processedValue = value; // Keep as string to preserve decimal input
        }
      } else {
        // Integer only
        const numValue = parseInt(value);
        processedValue = isNaN(numValue) ? '' : numValue;
      }
    }

    setOrderData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [outletId]: {
          ...prev[productId][outletId],
          [type]: processedValue,
        },
      },
    }));
  };

  const toggleOutlet = (outletId: number) => {
    setActiveOutlets((prev) => ({ ...prev, [outletId]: !prev[outletId] }));
  };

  const toggleProductIncluded = (productId: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isIncluded: !p.isIncluded } : p))
    );
  };

  const handleExtraChange = (
    productId: number,
    type: 'full' | 'mini',
    value: string
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    let processedValue: number | string = value;
    if (value !== '') {
      if (product.allowDecimal) {
        processedValue = value;
      } else {
        const numValue = parseInt(value);
        processedValue = isNaN(numValue) ? '' : numValue;
      }
    }

    setExtras((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [type]: processedValue,
      },
    }));
  };

  const calculateTotal = (productId: number, type: 'full' | 'mini'): number => {
    let total = 0;

    // Add extra
    const extraValue = extras[productId]?.[type];
    if (extraValue !== '' && extraValue !== undefined) {
      total += parseFloat(extraValue.toString()) || 0;
    }

    // Add all outlet quantities
    outlets.forEach((outlet) => {
      if (activeOutlets[outlet.id]) {
        const cellValue = orderData[productId]?.[outlet.id]?.[type];
        if (cellValue !== '' && cellValue !== undefined) {
          total += parseFloat(cellValue.toString()) || 0;
        }
      }
    });

    return total;
  };

  const calculateAvailableBalance = (productId: number, type: 'full' | 'mini'): number => {
    const total = calculateTotal(productId, type);
    if (!useFreezerStock) return total;

    const product = products.find((p) => p.id === productId);
    if (!product) return total;

    // Simple logic: reduce freezer stock from full quantity
    if (type === 'full') {
      return Math.max(0, total - product.freezerBalance);
    }
    return total;
  };

  const formatValue = (value: number, product: OrderEntryProduct): string => {
    if (product.allowDecimal) {
      return value.toFixed(product.decimalPlaces);
    }
    return value.toString();
  };

  const handleSave = () => {
    console.log('Saving order data:', { orderData, extras, useFreezerStock });
    alert('Order saved successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            Enhanced Order Entry Grid
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Multi-turn, decimal support, section-based production planning
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="md">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" size="md" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Order
          </Button>
        </div>
      </div>

      {/* Delivery Turn & Date Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Delivery Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded border"
                style={{ borderColor: 'var(--input)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Delivery Turn
              </label>
              <select
                value={selectedDeliveryTurn.id}
                onChange={(e) => {
                  const turn = mockDeliveryTurnConfigurations.find(
                    (t) => t.id === parseInt(e.target.value)
                  );
                  if (turn) setSelectedDeliveryTurn(turn);
                }}
                className="w-full px-3 py-2 rounded border"
                style={{ borderColor: 'var(--input)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              >
                {mockDeliveryTurnConfigurations.map((turn) => (
                  <option key={turn.id} value={turn.id}>
                    {turn.name} ({turn.time})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: 'var(--dms-warn-box)', border: '1px solid var(--dms-warn-box-border)' }}
              >
                <p className="text-xs font-medium" style={{ color: 'var(--dms-warn-label)' }}>
                  Order Entry For:
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--dms-warn-accent)' }}>
                  {selectedDeliveryTurn.name}
                </p>
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useFreezerStock}
                  onChange={(e) => setUseFreezerStock(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium" style={{ color: 'var(--dms-link)' }}>
                  Use Freezer Stock
                </span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Order Grid - {outlets.length} Outlets × {products.length} Products
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
                {/* Header Row 1: Outlet Names with Checkboxes */}
                <thead style={{ backgroundColor: 'var(--muted)' }}>
                  <tr>
                    <th
                      className="sticky left-0 z-20 px-3 py-3 text-left text-xs font-medium"
                      style={{
                        backgroundColor: 'var(--muted)',
                        color: 'var(--muted-foreground)',
                        minWidth: '80px',
                      }}
                    >
                      Y/N
                    </th>
                    <th
                      className="sticky left-20 z-20 px-3 py-3 text-left text-xs font-medium"
                      style={{
                        backgroundColor: 'var(--muted)',
                        color: 'var(--muted-foreground)',
                        minWidth: '200px',
                      }}
                    >
                      Product
                    </th>
                    <th
                      className="px-3 py-3 text-left text-xs font-medium"
                      style={{ color: 'var(--muted-foreground)', minWidth: '100px' }}
                    >
                      Code
                    </th>
                    <th
                      className="px-3 py-3 text-center text-xs font-medium"
                      style={{ color: 'var(--muted-foreground)', minWidth: '80px' }}
                    >
                      BAL
                    </th>
                    <th
                      className="px-3 py-3 text-center text-xs font-medium"
                      style={{ color: 'var(--muted-foreground)', minWidth: '120px' }}
                    >
                      Section
                    </th>

                    {/* Outlet columns */}
                    {outlets.map((outlet) => (
                      <th
                        key={outlet.id}
                        colSpan={2}
                        className="px-3 py-3 text-center text-xs font-medium border-l"
                        style={{
                          color: 'var(--muted-foreground)',
                          borderColor: 'var(--input)',
                          minWidth: '120px',
                        }}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <input
                            type="checkbox"
                            checked={activeOutlets[outlet.id]}
                            onChange={() => toggleOutlet(outlet.id)}
                            className="rounded"
                            style={{ cursor: 'pointer' }}
                          />
                          <span>{outlet.code}</span>
                        </div>
                      </th>
                    ))}

                    <th
                      colSpan={2}
                      className="px-3 py-3 text-center text-xs font-medium border-l"
                      style={{
                        color: 'var(--muted-foreground)',
                        borderColor: 'var(--input)',
                        minWidth: '120px',
                      }}
                    >
                      Extra
                    </th>
                    <th
                      colSpan={2}
                      className="px-3 py-3 text-center text-xs font-medium border-l"
                      style={{
                        color: 'var(--muted-foreground)',
                        borderColor: 'var(--input)',
                        minWidth: '120px',
                        backgroundColor: 'var(--dms-amber)',
                      }}
                    >
                      Total
                    </th>
                    {useFreezerStock && (
                      <th
                        colSpan={2}
                        className="px-3 py-3 text-center text-xs font-medium border-l"
                        style={{
                          color: 'var(--muted-foreground)',
                          borderColor: 'var(--input)',
                          minWidth: '120px',
                          backgroundColor: 'var(--dms-blue)',
                        }}
                      >
                        Available
                      </th>
                    )}
                  </tr>

                  {/* Header Row 2: F/M columns */}
                  <tr style={{ backgroundColor: 'var(--muted)' }}>
                    <th colSpan={5}></th>

                    {outlets.map((outlet) => (
                      <React.Fragment key={outlet.id}>
                        <th
                          className="px-2 py-2 text-center text-xs"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          F
                        </th>
                        <th
                          className="px-2 py-2 text-center text-xs border-r"
                          style={{ color: 'var(--muted-foreground)', borderColor: 'var(--input)' }}
                        >
                          M
                        </th>
                      </React.Fragment>
                    ))}

                    <th
                      className="px-2 py-2 text-center text-xs"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      F
                    </th>
                    <th
                      className="px-2 py-2 text-center text-xs border-r"
                      style={{ color: 'var(--muted-foreground)', borderColor: 'var(--input)' }}
                    >
                      M
                    </th>
                    <th
                      className="px-2 py-2 text-center text-xs font-semibold"
                      style={{ color: 'var(--dms-amber-fg)', backgroundColor: 'var(--dms-amber)' }}
                    >
                      F
                    </th>
                    <th
                      className="px-2 py-2 text-center text-xs font-semibold"
                      style={{ color: 'var(--dms-amber-fg)', backgroundColor: 'var(--dms-amber)' }}
                    >
                      M
                    </th>
                    {useFreezerStock && (
                      <>
                        <th
                          className="px-2 py-2 text-center text-xs font-semibold"
                          style={{ color: 'var(--dms-blue-fg)', backgroundColor: 'var(--dms-blue)' }}
                        >
                          F
                        </th>
                        <th
                          className="px-2 py-2 text-center text-xs font-semibold"
                          style={{ color: 'var(--dms-blue-fg)', backgroundColor: 'var(--dms-blue)' }}
                        >
                          M
                        </th>
                      </>
                    )}
                  </tr>
                </thead>

                {/* Body */}
                <tbody
                  className="divide-y"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      style={{
                        backgroundColor: product.isIncluded
                          ? 'var(--dms-surface)'
                          : 'var(--dms-surface-muted)',
                      }}
                    >
                      {/* Y/N Toggle */}
                      <td
                        className="sticky left-0 z-10 px-3 py-2 text-center"
                        style={{
                          backgroundColor: product.isIncluded
                            ? 'var(--dms-surface)'
                            : 'var(--dms-surface-muted)',
                        }}
                      >
                        <button
                          onClick={() => toggleProductIncluded(product.id)}
                          className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                          type="button"
                          style={{
                            backgroundColor: product.isIncluded
                              ? 'var(--status-success)'
                              : 'var(--neutral-300)',
                            color: '#ffffff',
                          }}
                        >
                          {product.isIncluded ? 'Y' : 'N'}
                        </button>
                      </td>

                      {/* Product Name */}
                      <td
                        className="sticky left-20 z-10 px-3 py-2 text-sm font-medium"
                        style={{
                          color: 'var(--foreground)',
                          backgroundColor: product.isIncluded
                            ? 'var(--dms-surface)'
                            : 'var(--dms-surface-muted)',
                        }}
                      >
                        {product.name}
                        {product.allowDecimal && (
                          <span
                            className="ml-2 text-xs px-1 rounded"
                            style={{ backgroundColor: 'var(--dms-blue)', color: 'var(--dms-blue-fg)' }}
                          >
                            ±{product.decimalPlaces}
                          </span>
                        )}
                      </td>

                      {/* Product Code */}
                      <td
                        className="px-3 py-2 text-sm font-mono"
                        style={{
                          color: 'var(--foreground)',
                          backgroundColor: product.isIncluded
                            ? 'var(--dms-surface)'
                            : 'var(--dms-surface-muted)',
                        }}
                      >
                        {product.code}
                      </td>

                      {/* Freezer Balance */}
                      <td
                        className="px-3 py-2 text-center text-sm font-semibold"
                        style={{
                          color: 'var(--dms-amber-fg)',
                          backgroundColor: product.isIncluded
                            ? 'var(--dms-surface)'
                            : 'var(--dms-surface-muted)',
                        }}
                      >
                        {product.freezerBalance}
                      </td>

                      {/* Primary Section */}
                      <td
                        className="px-3 py-2 text-center text-xs font-medium"
                        style={{
                          color: 'var(--foreground)',
                          backgroundColor: product.isIncluded
                            ? 'var(--dms-surface)'
                            : 'var(--dms-surface-muted)',
                        }}
                      >
                        {product.primarySection}
                      </td>

                      {/* Outlet columns */}
                      {outlets.map((outlet) => {
                        const isOutletActive = activeOutlets[outlet.id];
                        const bgColor = !isOutletActive
                          ? 'var(--dms-surface-muted)'
                          : product.isIncluded
                            ? 'var(--dms-surface)'
                            : 'var(--dms-surface-muted)';
                        const isDisabled = !product.isIncluded || !isOutletActive;

                        // Check if product is available for selected delivery turn
                        const productHasTurn = product.deliveryTurns.some(
                          (t) => t.id === selectedDeliveryTurn.id
                        );

                        return (
                          <React.Fragment key={`${product.id}-${outlet.id}`}>
                            {/* Full */}
                            {product.hasFull && productHasTurn && (
                              <td className="px-1 py-1">
                                <input
                                  type={product.allowDecimal ? 'text' : 'number'}
                                  step={
                                    product.allowDecimal
                                      ? Math.pow(10, -product.decimalPlaces)
                                      : 1
                                  }
                                  min="0"
                                  value={orderData[product.id]?.[outlet.id]?.full || ''}
                                  onChange={(e) =>
                                    handleCellChange(
                                      product.id,
                                      outlet.id,
                                      'full',
                                      e.target.value
                                    )
                                  }
                                  disabled={isDisabled}
                                  className="w-full px-2 py-1 text-sm text-center rounded"
                                  style={{
                                    border: '1px solid var(--input)',
                                    backgroundColor: bgColor,
                                    color: 'var(--foreground)',
                                  }}
                                />
                              </td>
                            )}
                            {(!product.hasFull || !productHasTurn) && (
                              <td
                                className="px-1 py-1"
                                style={{ backgroundColor: 'var(--muted)' }}
                              ></td>
                            )}

                            {/* Mini */}
                            {product.hasMini && productHasTurn && (
                              <td className="px-1 py-1 border-r" style={{ borderColor: 'var(--input)' }}>
                                <input
                                  type={product.allowDecimal ? 'text' : 'number'}
                                  step={
                                    product.allowDecimal
                                      ? Math.pow(10, -product.decimalPlaces)
                                      : 1
                                  }
                                  min="0"
                                  value={orderData[product.id]?.[outlet.id]?.mini || ''}
                                  onChange={(e) =>
                                    handleCellChange(
                                      product.id,
                                      outlet.id,
                                      'mini',
                                      e.target.value
                                    )
                                  }
                                  disabled={isDisabled}
                                  className="w-full px-2 py-1 text-sm text-center rounded"
                                  style={{
                                    border: '1px solid var(--input)',
                                    backgroundColor: bgColor,
                                    color: 'var(--foreground)',
                                  }}
                                />
                              </td>
                            )}
                            {(!product.hasMini || !productHasTurn) && (
                              <td
                                className="px-1 py-1 border-r"
                                style={{
                                  backgroundColor: 'var(--muted)',
                                  borderColor: 'var(--input)',
                                }}
                              ></td>
                            )}
                          </React.Fragment>
                        );
                      })}

                      {/* Extra columns */}
                      <td className="px-1 py-1">
                        <input
                          type={product.allowDecimal ? 'text' : 'number'}
                          step={
                            product.allowDecimal
                              ? Math.pow(10, -product.decimalPlaces)
                              : 1
                          }
                          min="0"
                          value={extras[product.id]?.full || ''}
                          onChange={(e) =>
                            handleExtraChange(product.id, 'full', e.target.value)
                          }
                          disabled={!product.isIncluded}
                          className="w-full px-2 py-1 text-sm text-center rounded"
                          style={{
                            border: '1px solid var(--input)',
                            backgroundColor: product.isIncluded
                              ? 'var(--dms-amber-tint)'
                              : 'var(--dms-surface-muted)',
                            color: 'var(--foreground)',
                          }}
                        />
                      </td>
                      <td
                        className="px-1 py-1 border-r"
                        style={{ borderColor: 'var(--input)' }}
                      >
                        <input
                          type={product.allowDecimal ? 'text' : 'number'}
                          step={
                            product.allowDecimal
                              ? Math.pow(10, -product.decimalPlaces)
                              : 1
                          }
                          min="0"
                          value={extras[product.id]?.mini || ''}
                          onChange={(e) =>
                            handleExtraChange(product.id, 'mini', e.target.value)
                          }
                          disabled={!product.isIncluded}
                          className="w-full px-2 py-1 text-sm text-center rounded"
                          style={{
                            border: '1px solid var(--input)',
                            backgroundColor: product.isIncluded
                              ? 'var(--dms-amber-tint)'
                              : 'var(--dms-surface-muted)',
                            color: 'var(--foreground)',
                          }}
                        />
                      </td>

                      {/* Total columns */}
                      <td
                        className="px-3 py-2 text-center text-sm font-bold"
                        style={{ color: 'var(--dms-amber-fg)', backgroundColor: 'var(--dms-amber)' }}
                      >
                        {formatValue(calculateTotal(product.id, 'full'), product)}
                      </td>
                      <td
                        className="px-3 py-2 text-center text-sm font-bold"
                        style={{ color: 'var(--dms-amber-fg)', backgroundColor: 'var(--dms-amber)' }}
                      >
                        {formatValue(calculateTotal(product.id, 'mini'), product)}
                      </td>

                      {/* Available Balance (if freezer stock enabled) */}
                      {useFreezerStock && (
                        <>
                          <td
                            className="px-3 py-2 text-center text-sm font-bold"
                            style={{ color: 'var(--dms-blue-fg)', backgroundColor: 'var(--dms-blue)' }}
                          >
                            {formatValue(
                              calculateAvailableBalance(product.id, 'full'),
                              product
                            )}
                          </td>
                          <td
                            className="px-3 py-2 text-center text-sm font-bold"
                            style={{ color: 'var(--dms-blue-fg)', backgroundColor: 'var(--dms-blue)' }}
                          >
                            {formatValue(
                              calculateAvailableBalance(product.id, 'mini'),
                              product
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div
        className="p-4 rounded-lg space-y-2"
        style={{ backgroundColor: 'var(--dms-success-callout)', border: '1px solid var(--dms-success-border)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--input)' }}
              ></div>
              <span className="text-sm" style={{ color: 'var(--dms-success-text)' }}>
                Included (Y)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: 'var(--muted)' }}
              ></div>
              <span className="text-sm" style={{ color: 'var(--dms-success-text)' }}>
                Excluded (N) / Inactive Outlet
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: 'var(--dms-blue)' }}
              ></div>
              <span className="text-sm" style={{ color: 'var(--dms-success-text)' }}>
                Decimal Input (±2)
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm" style={{ color: 'var(--dms-success-text)' }}>
          <strong>Features:</strong> Select delivery turn at top • Decimal input support •
          Section-based production • Freezer stock calculation • Outlet exclusion • Product
          exclusion • F = Full, M = Mini • BAL = Freezer Balance
        </p>
      </div>
    </div>
  );
}
