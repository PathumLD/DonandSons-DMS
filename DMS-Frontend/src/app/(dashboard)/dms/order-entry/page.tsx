'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Grid, Save, Download, Eye, EyeOff } from 'lucide-react';
import { mockOutlets, mockOrderProducts } from '@/lib/mock-data/dms-orders';

export default function OrderEntryPage() {
  const [products, setProducts] = useState(mockOrderProducts);
  const [outlets] = useState(mockOutlets);
  const [activeOutlets, setActiveOutlets] = useState<{ [outletId: number]: boolean }>({});
  const [orderData, setOrderData] = useState<{ [productId: number]: { [outletId: number]: { full: number; mini: number; turn1030Full?: number; turn1030Mini?: number; turn1530Full?: number; turn1530Mini?: number } } }>({});
  const [extras, setExtras] = useState<{ [productId: number]: { full: number; mini: number } }>({});
  const [focusedCell, setFocusedCell] = useState<{ productId: number; outletId: number; type: 'full' | 'mini' } | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    // Initialize order data and active outlets
    const initialData: { [productId: number]: { [outletId: number]: { full: number; mini: number; turn1030Full?: number; turn1030Mini?: number; turn1530Full?: number; turn1530Mini?: number } } } = {};
    const initialExtras: { [productId: number]: { full: number; mini: number } } = {};
    const initialActiveOutlets: { [outletId: number]: boolean } = {};
    
    products.forEach(product => {
      initialData[product.id] = {};
      initialExtras[product.id] = { full: 0, mini: 0 };
      outlets.forEach(outlet => {
        const baseData: any = { full: 0, mini: 0 };
        // Add multi-turn columns for products with hasMultiTurn
        if (product.hasMultiTurn) {
          baseData.turn1030Full = 0;
          baseData.turn1030Mini = 0;
          baseData.turn1530Full = 0;
          baseData.turn1530Mini = 0;
        }
        initialData[product.id][outlet.id] = baseData;
      });
    });
    
    outlets.forEach(outlet => {
      initialActiveOutlets[outlet.id] = true; // All outlets active by default
    });
    
    setOrderData(initialData);
    setExtras(initialExtras);
    setActiveOutlets(initialActiveOutlets);
  }, [products, outlets]);

  const handleCellChange = (productId: number, outletId: number, type: 'full' | 'mini' | 'turn1030Full' | 'turn1030Mini' | 'turn1530Full' | 'turn1530Mini', value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    setOrderData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [outletId]: {
          ...prev[productId][outletId],
          [type]: numValue,
        },
      },
    }));
  };

  const toggleOutlet = (outletId: number) => {
    setActiveOutlets(prev => ({ ...prev, [outletId]: !prev[outletId] }));
  };

  const handleExtraChange = (productId: number, type: 'full' | 'mini', value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    setExtras(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [type]: numValue,
      },
    }));
  };

  const calculateTotal = (productId: number, type: 'full' | 'mini') => {
    let total = extras[productId]?.[type] || 0;
    const product = products.find(p => p.id === productId);
    
    outlets.forEach(outlet => {
      if (activeOutlets[outlet.id]) {
        total += orderData[productId]?.[outlet.id]?.[type] || 0;
        
        // Add multi-turn quantities if applicable
        if (product?.hasMultiTurn) {
          if (type === 'full') {
            total += (orderData[productId]?.[outlet.id]?.turn1030Full || 0);
            total += (orderData[productId]?.[outlet.id]?.turn1530Full || 0);
          } else {
            total += (orderData[productId]?.[outlet.id]?.turn1030Mini || 0);
            total += (orderData[productId]?.[outlet.id]?.turn1530Mini || 0);
          }
        }
      }
    });
    return total;
  };

  const toggleProductIncluded = (productId: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, isIncluded: !p.isIncluded } : p));
  };

  const handleKeyDown = (e: React.KeyboardEvent, productId: number, outletId: number, type: 'full' | 'mini') => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      // Find next cell
      const currentProductIndex = products.findIndex(p => p.id === productId);
      const currentOutletIndex = outlets.findIndex(o => o.id === outletId);
      
      let nextProductIndex = currentProductIndex;
      let nextOutletIndex = currentOutletIndex;
      let nextType: 'full' | 'mini' = type;
      
      // Move to next column
      if (type === 'full' && products[currentProductIndex].hasMini) {
        nextType = 'mini';
      } else {
        nextType = 'full';
        nextOutletIndex++;
        if (nextOutletIndex >= outlets.length) {
          nextOutletIndex = 0;
          nextProductIndex++;
          if (nextProductIndex >= products.length) {
            nextProductIndex = 0;
          }
        }
      }
      
      const nextKey = `${products[nextProductIndex].id}-${outlets[nextOutletIndex].id}-${nextType}`;
      inputRefs.current[nextKey]?.focus();
    }
  };

  const handleSave = () => {
    console.log('Saving order data:', { orderData, extras });
    alert('Order saved successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Order Entry Grid</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Spreadsheet-style order entry for all outlets</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="md"><Download className="w-4 h-4 mr-2" />Export</Button>
          <Button variant="primary" size="md" onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save Order</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Order Grid - {outlets.length} Outlets × {products.length} Products</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y" style={{ borderColor: '#E5E7EB' }}>
                <thead style={{ backgroundColor: '#F9FAFB' }}>
                  <tr>
                    <th className="sticky left-0 z-20 px-3 py-3 text-left text-xs font-medium" style={{ backgroundColor: '#F9FAFB', color: '#6B7280', minWidth: '80px' }}>Y/N</th>
                    <th className="sticky left-20 z-20 px-3 py-3 text-left text-xs font-medium" style={{ backgroundColor: '#F9FAFB', color: '#6B7280', minWidth: '200px' }}>Product</th>
                    <th className="px-3 py-3 text-left text-xs font-medium" style={{ color: '#6B7280', minWidth: '100px' }}>Code</th>
                    <th className="px-3 py-3 text-center text-xs font-medium" style={{ color: '#6B7280', minWidth: '80px' }}>BAL</th>
                    
                    {outlets.map(outlet => {
                      const product = products[0]; // Check first product to see if any have multi-turn
                      const hasAnyMultiTurn = products.some(p => p.hasMultiTurn);
                      const baseColSpan = 2;
                      const multiTurnColSpan = hasAnyMultiTurn ? 4 : 0; // 2 for 10:30, 2 for 3:30
                      
                      return (
                        <th key={outlet.id} colSpan={baseColSpan} className="px-3 py-3 text-center text-xs font-medium border-l" style={{ color: '#6B7280', borderColor: '#D1D5DB', minWidth: '120px' }}>
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
                      );
                    })}
                    
                    <th colSpan={2} className="px-3 py-3 text-center text-xs font-medium border-l" style={{ color: '#6B7280', borderColor: '#D1D5DB', minWidth: '120px' }}>Extra</th>
                    <th colSpan={2} className="px-3 py-3 text-center text-xs font-medium border-l" style={{ color: '#6B7280', borderColor: '#D1D5DB', minWidth: '120px', backgroundColor: '#FEF3C4' }}>Total</th>
                  </tr>
                  <tr style={{ backgroundColor: '#F9FAFB' }}>
                    <th colSpan={4}></th>
                    {outlets.map(outlet => (
                      <React.Fragment key={outlet.id}>
                        <th className="px-2 py-2 text-center text-xs" style={{ color: '#6B7280' }}>5AM F</th>
                        <th className="px-2 py-2 text-center text-xs border-r" style={{ color: '#6B7280', borderColor: '#D1D5DB' }}>5AM M</th>
                      </React.Fragment>
                    ))}
                    <th className="px-2 py-2 text-center text-xs" style={{ color: '#6B7280' }}>F</th>
                    <th className="px-2 py-2 text-center text-xs border-r" style={{ color: '#6B7280', borderColor: '#D1D5DB' }}>M</th>
                    <th className="px-2 py-2 text-center text-xs font-semibold" style={{ color: '#C8102E', backgroundColor: '#FEF3C4' }}>F</th>
                    <th className="px-2 py-2 text-center text-xs font-semibold" style={{ color: '#C8102E', backgroundColor: '#FEF3C4' }}>M</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ backgroundColor: 'white', borderColor: '#E5E7EB' }}>
                  {products.map((product) => (
                    <tr key={product.id} style={{ backgroundColor: product.isIncluded ? 'white' : '#F3F4F6' }}>
                      <td className="sticky left-0 z-10 px-3 py-2 text-center" style={{ backgroundColor: product.isIncluded ? 'white' : '#F3F4F6' }}>
                        <button
                          onClick={() => toggleProductIncluded(product.id)}
                          className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                          style={{ backgroundColor: product.isIncluded ? '#10B981' : '#D1D5DB', color: 'white' }}
                        >
                          {product.isIncluded ? 'Y' : 'N'}
                        </button>
                      </td>
                      <td className="sticky left-20 z-10 px-3 py-2 text-sm font-medium" style={{ color: '#111827', backgroundColor: product.isIncluded ? 'white' : '#F3F4F6' }}>{product.name}</td>
                      <td className="px-3 py-2 text-sm font-mono" style={{ color: '#6B7280' }}>{product.code}</td>
                      <td className="px-3 py-2 text-center text-sm font-semibold" style={{ color: '#C8102E' }}>{product.freezerBalance}</td>
                      
                      {outlets.map(outlet => {
                        const isOutletActive = activeOutlets[outlet.id];
                        const bgColor = !isOutletActive ? '#F3F4F6' : (product.isIncluded ? 'white' : '#F3F4F6');
                        const isDisabled = !product.isIncluded || !isOutletActive;
                        
                        return (
                          <React.Fragment key={`${product.id}-${outlet.id}`}>
                            {product.hasFull && (
                              <td className="px-1 py-1">
                                <input
                                  ref={el => { inputRefs.current[`${product.id}-${outlet.id}-full`] = el; }}
                                  type="number"
                                  min="0"
                                  value={orderData[product.id]?.[outlet.id]?.full || ''}
                                  onChange={(e) => handleCellChange(product.id, outlet.id, 'full', e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, product.id, outlet.id, 'full')}
                                  disabled={isDisabled}
                                  className="w-full px-2 py-1 text-sm text-center rounded"
                                  style={{ border: '1px solid #D1D5DB', backgroundColor: bgColor }}
                                />
                              </td>
                            )}
                            {!product.hasFull && <td className="px-1 py-1 bg-gray-100"></td>}
                            
                            {product.hasMini && (
                              <td className="px-1 py-1 border-r" style={{ borderColor: '#D1D5DB' }}>
                                <input
                                  ref={el => { inputRefs.current[`${product.id}-${outlet.id}-mini`] = el; }}
                                  type="number"
                                  min="0"
                                  value={orderData[product.id]?.[outlet.id]?.mini || ''}
                                  onChange={(e) => handleCellChange(product.id, outlet.id, 'mini', e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, product.id, outlet.id, 'mini')}
                                  disabled={isDisabled}
                                  className="w-full px-2 py-1 text-sm text-center rounded"
                                  style={{ border: '1px solid #D1D5DB', backgroundColor: bgColor }}
                                />
                              </td>
                            )}
                            {!product.hasMini && <td className="px-1 py-1 border-r bg-gray-100" style={{ borderColor: '#D1D5DB' }}></td>}
                          </React.Fragment>
                        );
                      })}
                      
                      <td className="px-1 py-1">
                        <input
                          type="number"
                          min="0"
                          value={extras[product.id]?.full || ''}
                          onChange={(e) => handleExtraChange(product.id, 'full', e.target.value)}
                          disabled={!product.isIncluded}
                          className="w-full px-2 py-1 text-sm text-center rounded"
                          style={{ border: '1px solid #D1D5DB', backgroundColor: product.isIncluded ? '#FFFBEB' : '#F3F4F6' }}
                        />
                      </td>
                      <td className="px-1 py-1 border-r" style={{ borderColor: '#D1D5DB' }}>
                        <input
                          type="number"
                          min="0"
                          value={extras[product.id]?.mini || ''}
                          onChange={(e) => handleExtraChange(product.id, 'mini', e.target.value)}
                          disabled={!product.isIncluded}
                          className="w-full px-2 py-1 text-sm text-center rounded"
                          style={{ border: '1px solid #D1D5DB', backgroundColor: product.isIncluded ? '#FFFBEB' : '#F3F4F6' }}
                        />
                      </td>
                      
                      <td className="px-3 py-2 text-center text-sm font-bold" style={{ color: '#C8102E', backgroundColor: '#FEF3C4' }}>
                        {calculateTotal(product.id, 'full')}
                      </td>
                      <td className="px-3 py-2 text-center text-sm font-bold" style={{ color: '#C8102E', backgroundColor: '#FEF3C4' }}>
                        {calculateTotal(product.id, 'mini')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC' }}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'white', border: '1px solid #D1D5DB' }}></div>
            <span className="text-sm" style={{ color: '#166534' }}>Included (Y)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F3F4F6' }}></div>
            <span className="text-sm" style={{ color: '#166534' }}>Excluded (N) / Inactive Outlet</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FEF3C4' }}></div>
            <span className="text-sm" style={{ color: '#166534' }}>Totals</span>
          </div>
        </div>
        <p className="text-sm" style={{ color: '#166534' }}>
          Use Tab/Enter to navigate • Check/uncheck outlets to include/exclude • F = Full, M = Mini • BAL = Freezer Balance
        </p>
      </div>
    </div>
  );
}
