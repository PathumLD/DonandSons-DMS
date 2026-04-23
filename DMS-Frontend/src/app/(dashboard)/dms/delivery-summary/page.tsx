'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { FileDown, Printer, Calculator } from 'lucide-react';
import { mockOutlets, mockOrderProducts } from '@/lib/mock-data/dms-orders';

export default function DeliverySummaryPage() {
  const [products] = useState(mockOrderProducts);
  const [outlets] = useState(mockOutlets);
  const [useFreezerStock, setUseFreezerStock] = useState(false);
  const [productData, setProductData] = useState<{ [productId: number]: { [outletId: number]: number; includeProd: boolean; customizedOrders?: Array<{ customerName: string; qtyFull: number; qtyMini: number; notes: string }> } }>({
    1: { 1: 50, 2: 45, 3: 40, 4: 55, 5: 35, 6: 30, 7: 25, 8: 45, 9: 50, 10: 40, 11: 35, 12: 30, 13: 25, 14: 20, includeProd: true, customizedOrders: [{ customerName: 'Special Order - Hotel ABC', qtyFull: 10, qtyMini: 5, notes: 'Extra soft, no crust' }] },
    5: { 1: 60, 2: 55, 3: 50, 4: 65, 5: 45, 6: 40, 7: 35, 8: 55, 9: 60, 10: 50, 11: 45, 12: 40, 13: 35, 14: 30, includeProd: true },
    6: { 1: 50, 2: 45, 3: 40, 4: 55, 5: 35, 6: 30, 7: 25, 8: 45, 9: 50, 10: 40, 11: 35, 12: 30, 13: 25, 14: 20, includeProd: true, customizedOrders: [{ customerName: 'Custom - Restaurant XYZ', qtyFull: 15, qtyMini: 10, notes: 'Less spicy' }] },
  });

  const toggleProductInclude = (productId: number) => {
    setProductData(prev => ({
      ...prev,
      [productId]: { ...prev[productId], includeProd: !prev[productId].includeProd },
    }));
  };

  const calculateGrandTotal = (productId: number) => {
    let total = 0;
    outlets.forEach(outlet => {
      total += productData[productId]?.[outlet.id] || 0;
    });
    
    // Add customized orders
    const customOrders = productData[productId]?.customizedOrders || [];
    customOrders.forEach(order => {
      total += order.qtyFull + order.qtyMini;
    });
    
    return total;
  };

  const calculateAvailableBalance = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    return calculateGrandTotal(productId) - product.freezerBalance;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Delivery Summary</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Complete delivery summary with outlet quantities and totals</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="md"><Printer className="w-4 h-4 mr-2" />Print</Button>
          <Button variant="primary" size="md"><FileDown className="w-4 h-4 mr-2" />Export Excel</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Summary - Plan DP-2026-002 • Weekday • 5:00 AM</CardTitle>
            <Toggle checked={useFreezerStock} onChange={setUseFreezerStock} label="☑ Use Freezer Stock" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
              <thead style={{ backgroundColor: 'var(--muted)' }}>
                <tr>
                  <th className="sticky left-0 z-10 px-4 py-3 text-left text-xs font-medium" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', minWidth: '200px' }}>Product</th>
                  <th className="px-3 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)', minWidth: '60px' }}>Y/N</th>
                  
                  {outlets.map(outlet => (
                    <th key={outlet.id} className="px-3 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)', minWidth: '80px' }}>{outlet.code}</th>
                  ))}
                  
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)', minWidth: '100px', backgroundColor: 'var(--dms-amber)' }}>Grand Total</th>
                  
                  {useFreezerStock && (
                    <>
                      <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)', minWidth: '100px' }}>Freezer Stock</th>
                      <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)', minWidth: '120px', backgroundColor: 'var(--dms-green)' }}>Avail. Balance</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                {products.filter(p => productData[p.id]?.includeProd).map((product) => (
                  <React.Fragment key={product.id}>
                    <tr>
                      <td className="sticky left-0 z-10 px-4 py-3 text-sm font-medium" style={{ color: 'var(--foreground)', backgroundColor: 'var(--card)' }}>
                        {product.code} - {product.name}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => toggleProductInclude(product.id)}
                          className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold text-white transition-colors"
                          style={{ backgroundColor: productData[product.id]?.includeProd ? 'var(--status-success)' : 'var(--neutral-300)', cursor: 'pointer' }}
                        >
                          {productData[product.id]?.includeProd ? 'Y' : 'N'}
                        </button>
                      </td>
                      
                      {outlets.map(outlet => (
                        <td key={outlet.id} className="px-3 py-3 text-center text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                          {productData[product.id]?.[outlet.id] || 0}
                        </td>
                      ))}
                      
                      <td className="px-4 py-3 text-center text-lg font-bold" style={{ color: 'var(--dms-amber-fg)', backgroundColor: 'var(--dms-amber)' }}>
                        {calculateGrandTotal(product.id)}
                      </td>
                      
                      {useFreezerStock && (
                        <>
                          <td className="px-4 py-3 text-center text-sm font-semibold" style={{ color: 'var(--dms-red-text)' }}>
                            {product.freezerBalance}
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-bold" style={{ color: 'var(--dms-green-fg)', backgroundColor: 'var(--dms-green)' }}>
                            {calculateAvailableBalance(product.id)}
                          </td>
                        </>
                      )}
                    </tr>
                    
                    {/* Customized Order Sub-rows */}
                    {productData[product.id]?.customizedOrders?.map((order, idx) => (
                      <tr key={`${product.id}-custom-${idx}`} style={{ backgroundColor: 'var(--dms-amber-tint)' }}>
                        <td colSpan={2} className="sticky left-0 z-10 px-4 py-2 text-xs italic" style={{ color: 'var(--dms-amber-text)', backgroundColor: 'var(--dms-amber-tint)', paddingLeft: '2rem' }}>
                          ★ {order.customerName}
                          {order.notes && <span className="ml-2 text-xs">({order.notes})</span>}
                        </td>
                        <td colSpan={outlets.length} className="px-3 py-2 text-center text-xs font-medium" style={{ color: 'var(--dms-amber-text)' }}>
                          Full: {order.qtyFull} • Mini: {order.qtyMini}
                        </td>
                        <td className="px-4 py-2 text-center text-sm font-semibold" style={{ color: 'var(--dms-amber-text)', backgroundColor: 'var(--dms-amber)' }}>
                          +{order.qtyFull + order.qtyMini}
                        </td>
                        {useFreezerStock && <td colSpan={2}></td>}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                
                <tr style={{ backgroundColor: 'var(--muted)' }}>
                  <td colSpan={2} className="sticky left-0 z-10 px-4 py-4 text-sm font-bold" style={{ color: 'var(--foreground)', backgroundColor: 'var(--muted)' }}>GRAND TOTAL</td>
                  {outlets.map(outlet => {
                    const outletTotal = products.filter(p => productData[p.id]?.includeProd).reduce((sum, p) => sum + (productData[p.id]?.[outlet.id] || 0), 0);
                    return <td key={outlet.id} className="px-3 py-4 text-center text-sm font-bold" style={{ color: 'var(--foreground)' }}>{outletTotal}</td>;
                  })}
                  <td className="px-4 py-4 text-center text-xl font-bold" style={{ color: 'var(--dms-amber-fg)', backgroundColor: 'var(--dms-amber)' }}>
                    {products.filter(p => productData[p.id]?.includeProd).reduce((sum, p) => sum + calculateGrandTotal(p.id), 0)}
                  </td>
                  {useFreezerStock && <td colSpan={2}></td>}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Total Products</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--foreground)' }}>{products.filter(p => productData[p.id]?.includeProd).length}</p>
              </div>
              <Calculator className="w-10 h-10" style={{ color: '#C8102E' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Total Outlets</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--foreground)' }}>{outlets.length}</p>
              </div>
              <Calculator className="w-10 h-10" style={{ color: '#10B981' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Overall Total</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--foreground)' }}>
                  {products.filter(p => productData[p.id]?.includeProd).reduce((sum, p) => sum + calculateGrandTotal(p.id), 0)}
                </p>
              </div>
              <Calculator className="w-10 h-10" style={{ color: '#F59E0B' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--dms-notes)', border: '1px solid var(--dms-notes-border)' }}>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--dms-notes-title)' }}>Notes:</p>
        <ul className="text-sm space-y-1" style={{ color: 'var(--dms-notes-fg)' }}>
          <li>• <strong>Y/N</strong> toggle to include/exclude products from production (click to change)</li>
          <li>• <strong>Customized orders</strong> appear as sub-rows below the product (★ yellow background)</li>
          <li>• <strong>Use Freezer Stock</strong> toggle shows available balance after deducting freezer stock</li>
          <li>• Available Balance = Grand Total - Freezer Stock</li>
          <li>• Grand Total includes outlet quantities + customized order quantities</li>
          <li>• This view mirrors the Excel Delivery Summary sheet</li>
        </ul>
      </div>
    </div>
  );
}
