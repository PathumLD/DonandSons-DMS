'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Save, Download, Info, Calendar, Clock, Loader2, CheckCircle2, Plus } from 'lucide-react';
import { ordersApi, type BulkUpsertOrderItemDto } from '@/lib/api/orders';
import { productsApi, type Product } from '@/lib/api/products';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { deliveryTurnsApi, type DeliveryTurn } from '@/lib/api/delivery-turns';
import { dayTypesApi, type DayType } from '@/lib/api/day-types';
import { toast } from 'sonner';

interface OrderGridData {
  [productId: string]: {
    [outletId: string]: {
      [turnId: string]: {
        full: number | string;
        mini: number | string;
      };
    };
  };
}

interface ExtraItems {
  [productId: string]: {
    [turnId: string]: {
      full: number | string;
      mini: number | string;
    };
  };
}

export default function OrderEntryEnhancedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [deliveryTurns, setDeliveryTurns] = useState<DeliveryTurn[]>([]);
  const [dayTypes, setDayTypes] = useState<DayType[]>([]);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDayTypeId, setSelectedDayTypeId] = useState('');
  const [useFreezerStock, setUseFreezerStock] = useState(false);
  const [notes, setNotes] = useState('');
  
  const [orderData, setOrderData] = useState<OrderGridData>({});
  const [extras, setExtras] = useState<ExtraItems>({});
  const [activeOutlets, setActiveOutlets] = useState<{ [outletId: string]: boolean }>({});
  const [includedProducts, setIncludedProducts] = useState<{ [productId: string]: boolean }>({});
  
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (products.length > 0 && outlets.length > 0 && deliveryTurns.length > 0) {
      initializeGridData();
    }
  }, [products, outlets, deliveryTurns]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, outletsRes, turnsRes, dayTypesRes] = await Promise.all([
        productsApi.getAll(1, 100, undefined, undefined, true),
        outletsApi.getAll(1, 100, undefined, undefined, true),
        deliveryTurnsApi.getAll(1, 100, undefined, true),
        dayTypesApi.getAll(1, 100, undefined, true),
      ]);

      setProducts(productsRes.products);
      setOutlets(outletsRes.outlets);
      setDeliveryTurns(turnsRes.deliveryTurns);
      setDayTypes(dayTypesRes.dayTypes);

      if (dayTypesRes.dayTypes.length > 0) {
        setSelectedDayTypeId(dayTypesRes.dayTypes[0].id);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeGridData = () => {
    const initialData: OrderGridData = {};
    const initialExtras: ExtraItems = {};
    const initialActiveOutlets: { [outletId: string]: boolean } = {};
    const initialIncluded: { [productId: string]: boolean } = {};

    products.forEach((product) => {
      initialData[product.id] = {};
      initialExtras[product.id] = {};
      initialIncluded[product.id] = true;

      outlets.forEach((outlet) => {
        initialData[product.id][outlet.id] = {};
        
        deliveryTurns.forEach((turn) => {
          initialData[product.id][outlet.id][turn.id] = { full: '', mini: '' };
        });
      });

      deliveryTurns.forEach((turn) => {
        initialExtras[product.id][turn.id] = { full: '', mini: '' };
      });
    });

    outlets.forEach((outlet) => {
      initialActiveOutlets[outlet.id] = true;
    });

    setOrderData(initialData);
    setExtras(initialExtras);
    setActiveOutlets(initialActiveOutlets);
    setIncludedProducts(initialIncluded);
  };

  const handleCellChange = (
    productId: string,
    outletId: string,
    turnId: string,
    type: 'full' | 'mini',
    value: string
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    let processedValue: number | string = value;
    if (value !== '') {
      if (product.allowDecimal) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          processedValue = value;
        }
      } else {
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
          [turnId]: {
            ...prev[productId][outletId][turnId],
            [type]: processedValue,
          },
        },
      },
    }));
  };

  const handleExtraChange = (
    productId: string,
    turnId: string,
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
        [turnId]: {
          ...prev[productId][turnId],
          [type]: processedValue,
        },
      },
    }));
  };

  const toggleOutlet = (outletId: string) => {
    setActiveOutlets((prev) => ({ ...prev, [outletId]: !prev[outletId] }));
  };

  const toggleProductIncluded = (productId: string) => {
    setIncludedProducts((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const calculateTotal = (productId: string, turnId: string, type: 'full' | 'mini'): number => {
    let total = 0;

    const extraValue = extras[productId]?.[turnId]?.[type];
    if (extraValue !== '' && extraValue !== undefined) {
      total += parseFloat(extraValue.toString()) || 0;
    }

    outlets.forEach((outlet) => {
      if (activeOutlets[outlet.id]) {
        const cellValue = orderData[productId]?.[outlet.id]?.[turnId]?.[type];
        if (cellValue !== '' && cellValue !== undefined) {
          total += parseFloat(cellValue.toString()) || 0;
        }
      }
    });

    return total;
  };

  const formatValue = (value: number, product: Product): string => {
    if (product.allowDecimal) {
      return value.toFixed(product.decimalPlaces);
    }
    return value.toString();
  };

  const handleCreateOrder = async () => {
    try {
      setIsSubmitting(true);
      
      const orderDto = {
        orderDate: selectedDate,
        dayTypeId: selectedDayTypeId,
        useFreezerStock,
        notes,
      };

      const order = await ordersApi.create(orderDto);
      setCurrentOrderId(order.id);
      
      toast.success('Order created! Now save the items.');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveItems = async () => {
    if (!currentOrderId) {
      toast.error('Please create an order first');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const items: BulkUpsertOrderItemDto[] = [];

      products.forEach((product) => {
        if (!includedProducts[product.id]) return;

        outlets.forEach((outlet) => {
          if (!activeOutlets[outlet.id]) return;

          deliveryTurns.forEach((turn) => {
            const cellData = orderData[product.id]?.[outlet.id]?.[turn.id];
            if (cellData) {
              const fullQty = parseFloat(cellData.full.toString()) || 0;
              const miniQty = parseFloat(cellData.mini.toString()) || 0;

              if (fullQty > 0 || miniQty > 0) {
                items.push({
                  outletId: outlet.id,
                  productId: product.id,
                  deliveryTurnId: turn.id,
                  fullQuantity: fullQty,
                  miniQuantity: miniQty,
                  isExtraItem: false,
                });
              }
            }
          });
        });

        deliveryTurns.forEach((turn) => {
          const extraData = extras[product.id]?.[turn.id];
          if (extraData) {
            const fullQty = parseFloat(extraData.full.toString()) || 0;
            const miniQty = parseFloat(extraData.mini.toString()) || 0;

            if (fullQty > 0 || miniQty > 0) {
              items.push({
                outletId: outlets[0].id,
                productId: product.id,
                deliveryTurnId: turn.id,
                fullQuantity: fullQty,
                miniQuantity: miniQty,
                isExtraItem: true,
              });
            }
          }
        });
      });

      await ordersApi.bulkUpsertItems(currentOrderId, items);
      
      toast.success(`Order items saved successfully! (${items.length} items)`);
    } catch (error) {
      console.error('Error saving items:', error);
      toast.error('Failed to save order items');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!currentOrderId) {
      toast.error('Please create an order first');
      return;
    }

    try {
      setIsSubmitting(true);
      await ordersApi.submit(currentOrderId);
      toast.success('Order submitted successfully!');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to submit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--brand-primary)' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>Loading order entry grid...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            Order Entry Grid
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Multi-turn, decimal support, section-based production planning
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {!currentOrderId ? (
            <Button variant="primary" size="md" onClick={handleCreateOrder} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Order
                </>
              )}
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="md" onClick={handleSaveItems} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Items
                  </>
                )}
              </Button>
              <Button variant="primary" size="md" onClick={handleSubmitOrder} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Submit Order
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Order Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={!!currentOrderId}
              fullWidth
            />
            <Select
              label="Day Type"
              value={selectedDayTypeId}
              onChange={(e) => setSelectedDayTypeId(e.target.value)}
              options={dayTypes.map((dt) => ({ value: dt.id, label: dt.name }))}
              disabled={!!currentOrderId}
              fullWidth
            />
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useFreezerStock}
                  onChange={(e) => setUseFreezerStock(e.target.checked)}
                  disabled={!!currentOrderId}
                  className="rounded"
                />
                <span className="text-sm font-medium">Use Freezer Stock</span>
              </label>
            </div>
          </div>
          <div className="mt-4">
            <Input
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!!currentOrderId}
              fullWidth
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Grid - {products.length} Products × {outlets.length} Outlets × {deliveryTurns.length} Turns</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Active Outlets:</span>
              <div className="flex items-center space-x-2">
                {outlets.map((outlet) => (
                  <button
                    key={outlet.id}
                    onClick={() => toggleOutlet(outlet.id)}
                    className="px-2 py-1 text-xs rounded transition-colors"
                    style={{
                      backgroundColor: activeOutlets[outlet.id] ? 'var(--brand-primary)' : 'var(--muted)',
                      color: activeOutlets[outlet.id] ? '#ffffff' : 'var(--muted-foreground)',
                    }}
                  >
                    {outlet.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
              <thead className="sticky top-0 z-20" style={{ backgroundColor: 'var(--muted)' }}>
                <tr>
                  <th className="sticky left-0 z-30 px-3 py-2 text-left text-xs font-medium" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', minWidth: '150px' }}>
                    Product
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)', minWidth: '60px' }}>
                    Inc
                  </th>
                  {deliveryTurns.map((turn) => (
                    <th key={turn.id} colSpan={outlets.filter((o) => activeOutlets[o.id]).length * 2 + 2} className="px-3 py-2 text-center text-xs font-medium border-l" style={{ color: 'var(--muted-foreground)', borderColor: 'var(--input)' }}>
                      {turn.name}
                    </th>
                  ))}
                </tr>
                <tr style={{ backgroundColor: 'var(--muted)' }}>
                  <th colSpan={2}></th>
                  {deliveryTurns.map((turn) => (
                    <React.Fragment key={turn.id}>
                      {outlets.filter((o) => activeOutlets[o.id]).map((outlet) => (
                        <React.Fragment key={outlet.id}>
                          <th className="px-2 py-1 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            {outlet.name} F
                          </th>
                          <th className="px-2 py-1 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            M
                          </th>
                        </React.Fragment>
                      ))}
                      <th className="px-2 py-1 text-center text-xs border-l" style={{ color: 'var(--muted-foreground)', borderColor: 'var(--input)' }}>
                        Extra F
                      </th>
                      <th className="px-2 py-1 text-center text-xs border-r" style={{ color: 'var(--muted-foreground)', borderColor: 'var(--input)' }}>
                        M
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                {products.map((product) => (
                  <tr key={product.id} style={{ opacity: includedProducts[product.id] ? 1 : 0.5 }}>
                    <td className="sticky left-0 z-10 px-3 py-2 text-sm font-medium" style={{ color: 'var(--foreground)', backgroundColor: 'var(--card)' }}>
                      <div className="flex items-center space-x-2">
                        <span>{product.name}</span>
                        {product.allowDecimal && (
                          <span className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--dms-notes)', color: 'var(--dms-notes-title)' }}>
                            DEC
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={includedProducts[product.id]}
                        onChange={() => toggleProductIncluded(product.id)}
                        className="rounded"
                      />
                    </td>
                    {deliveryTurns.map((turn) => (
                      <React.Fragment key={turn.id}>
                        {outlets.filter((o) => activeOutlets[o.id]).map((outlet) => (
                          <React.Fragment key={outlet.id}>
                            <td className="px-1 py-1">
                              <input
                                type="number"
                                step={product.allowDecimal ? '0.01' : '1'}
                                min="0"
                                value={orderData[product.id]?.[outlet.id]?.[turn.id]?.full || ''}
                                onChange={(e) => handleCellChange(product.id, outlet.id, turn.id, 'full', e.target.value)}
                                disabled={!includedProducts[product.id]}
                                className="w-16 px-1 py-1 text-sm text-center rounded"
                                style={{ border: '1px solid var(--input)', backgroundColor: 'var(--background)' }}
                              />
                            </td>
                            <td className="px-1 py-1">
                              <input
                                type="number"
                                step={product.allowDecimal ? '0.01' : '1'}
                                min="0"
                                value={orderData[product.id]?.[outlet.id]?.[turn.id]?.mini || ''}
                                onChange={(e) => handleCellChange(product.id, outlet.id, turn.id, 'mini', e.target.value)}
                                disabled={!includedProducts[product.id]}
                                className="w-16 px-1 py-1 text-sm text-center rounded"
                                style={{ border: '1px solid var(--input)', backgroundColor: 'var(--background)' }}
                              />
                            </td>
                          </React.Fragment>
                        ))}
                        <td className="px-1 py-1 border-l" style={{ borderColor: 'var(--input)' }}>
                          <input
                            type="number"
                            step={product.allowDecimal ? '0.01' : '1'}
                            min="0"
                            value={extras[product.id]?.[turn.id]?.full || ''}
                            onChange={(e) => handleExtraChange(product.id, turn.id, 'full', e.target.value)}
                            disabled={!includedProducts[product.id]}
                            className="w-16 px-1 py-1 text-sm text-center rounded"
                            style={{ border: '1px solid var(--input)', backgroundColor: 'var(--dms-notes)' }}
                          />
                        </td>
                        <td className="px-1 py-1 border-r" style={{ borderColor: 'var(--input)' }}>
                          <input
                            type="number"
                            step={product.allowDecimal ? '0.01' : '1'}
                            min="0"
                            value={extras[product.id]?.[turn.id]?.mini || ''}
                            onChange={(e) => handleExtraChange(product.id, turn.id, 'mini', e.target.value)}
                            disabled={!includedProducts[product.id]}
                            className="w-16 px-1 py-1 text-sm text-center rounded"
                            style={{ border: '1px solid var(--input)', backgroundColor: 'var(--dms-notes)' }}
                          />
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 z-20" style={{ backgroundColor: 'var(--muted)' }}>
                <tr>
                  <td colSpan={2} className="px-3 py-2 text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                    Totals
                  </td>
                  {deliveryTurns.map((turn) => (
                    <React.Fragment key={turn.id}>
                      {outlets.filter((o) => activeOutlets[o.id]).map((outlet) => (
                        <React.Fragment key={outlet.id}>
                          <td className="px-2 py-2 text-sm text-center font-medium" style={{ color: 'var(--foreground)' }}>
                            {products.reduce((sum, p) => {
                              const val = orderData[p.id]?.[outlet.id]?.[turn.id]?.full;
                              return sum + (val ? parseFloat(val.toString()) : 0);
                            }, 0).toFixed(2)}
                          </td>
                          <td className="px-2 py-2 text-sm text-center font-medium" style={{ color: 'var(--foreground)' }}>
                            {products.reduce((sum, p) => {
                              const val = orderData[p.id]?.[outlet.id]?.[turn.id]?.mini;
                              return sum + (val ? parseFloat(val.toString()) : 0);
                            }, 0).toFixed(2)}
                          </td>
                        </React.Fragment>
                      ))}
                      <td colSpan={2} className="px-2 py-2 text-sm text-center font-medium border-l border-r" style={{ color: 'var(--foreground)', borderColor: 'var(--input)' }}>
                        Extra Total
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--dms-notes)', border: '1px solid var(--dms-notes-border)' }}>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--dms-notes-title)' }}>How to use:</p>
        <ul className="text-sm space-y-1" style={{ color: 'var(--dms-notes-fg)' }}>
          <li>• Configure order date, day type, and freezer stock option</li>
          <li>• Click <strong>Create Order</strong> to initialize a new order</li>
          <li>• Enter quantities for each product/outlet/turn combination (supports decimals where configured)</li>
          <li>• Use the <strong>Inc</strong> checkbox to include/exclude products</li>
          <li>• Toggle outlets to show/hide columns</li>
          <li>• Click <strong>Save Items</strong> to save your entries</li>
          <li>• Click <strong>Submit Order</strong> to finalize the order</li>
        </ul>
      </div>
    </div>
  );
}
