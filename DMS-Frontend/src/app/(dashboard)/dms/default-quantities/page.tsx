'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react';
import { mockOutlets, mockOrderProducts } from '@/lib/mock-data/dms-orders';

type DayType = 'Weekday' | 'Saturday' | 'Sunday' | 'Holiday';

export default function DefaultQuantitiesPage() {
  const [selectedDayType, setSelectedDayType] = useState<DayType>('Weekday');
  const [products] = useState(mockOrderProducts.slice(0, 8)); // Show subset for demo
  const [outlets] = useState(mockOutlets.slice(0, 6)); // Show subset for demo
  const [quantities, setQuantities] = useState<{ [productId: number]: { [outletId: number]: { full: number; mini: number } } }>({});

  // Initialize with mock defaults
  useState(() => {
    const initialQtys: { [productId: number]: { [outletId: number]: { full: number; mini: number } } } = {};
    products.forEach(product => {
      initialQtys[product.id] = {};
      outlets.forEach(outlet => {
        initialQtys[product.id][outlet.id] = { full: 30 + outlet.id * 2, mini: 20 + outlet.id * 2 };
      });
    });
    setQuantities(initialQtys);
  });

  const handleQuantityChange = (productId: number, outletId: number, type: 'full' | 'mini', value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    setQuantities(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [outletId]: {
          ...prev[productId]?.[outletId] || { full: 0, mini: 0 },
          [type]: numValue,
        },
      },
    }));
  };

  const handleSave = () => {
    console.log('Saving default quantities:', { dayType: selectedDayType, quantities });
    alert(`Default quantities for ${selectedDayType} saved successfully!`);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all quantities to zero?')) {
      const resetQtys: { [productId: number]: { [outletId: number]: { full: number; mini: number } } } = {};
      products.forEach(product => {
        resetQtys[product.id] = {};
        outlets.forEach(outlet => {
          resetQtys[product.id][outlet.id] = { full: 0, mini: 0 };
        });
      });
      setQuantities(resetQtys);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Default Quantities Management</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Configure default outlet quantities per day type</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="md" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
          <Button variant="primary" size="md" onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save Defaults</Button>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {(['Weekday', 'Saturday', 'Sunday', 'Holiday'] as DayType[]).map((dayType) => (
          <button
            key={dayType}
            onClick={() => setSelectedDayType(dayType)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: selectedDayType === dayType ? '#C8102E' : 'white',
              color: selectedDayType === dayType ? 'white' : '#111827',
              border: `2px solid ${selectedDayType === dayType ? '#C8102E' : '#E5E7EB'}`,
            }}
          >
            {dayType}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedDayType} Default Quantities - {products.length} Products × {outlets.length} Outlets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: '#E5E7EB' }}>
              <thead style={{ backgroundColor: '#F9FAFB' }}>
                <tr>
                  <th className="sticky left-0 z-10 px-4 py-3 text-left text-xs font-medium" style={{ backgroundColor: '#F9FAFB', color: '#6B7280', minWidth: '200px' }}>Product</th>
                  <th className="px-3 py-3 text-left text-xs font-medium" style={{ color: '#6B7280', minWidth: '80px' }}>Code</th>
                  
                  {outlets.map(outlet => (
                    <th key={outlet.id} colSpan={2} className="px-3 py-3 text-center text-xs font-medium border-l" style={{ color: '#6B7280', borderColor: '#D1D5DB', minWidth: '120px' }}>
                      {outlet.name}
                    </th>
                  ))}
                </tr>
                <tr style={{ backgroundColor: '#F9FAFB' }}>
                  <th colSpan={2}></th>
                  {outlets.map(outlet => (
                    <>
                      <th key={`${outlet.id}-f`} className="px-2 py-2 text-center text-xs" style={{ color: '#6B7280' }}>Full</th>
                      <th key={`${outlet.id}-m`} className="px-2 py-2 text-center text-xs border-r" style={{ color: '#6B7280', borderColor: '#D1D5DB' }}>Mini</th>
                    </>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: 'white', borderColor: '#E5E7EB' }}>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="sticky left-0 z-10 px-4 py-2 text-sm font-medium" style={{ color: '#111827', backgroundColor: 'white' }}>{product.name}</td>
                    <td className="px-3 py-2 text-sm font-mono" style={{ color: '#6B7280' }}>{product.code}</td>
                    
                    {outlets.map(outlet => (
                      <>
                        <td key={`${product.id}-${outlet.id}-f`} className="px-1 py-1">
                          <input
                            type="number"
                            min="0"
                            value={quantities[product.id]?.[outlet.id]?.full || 0}
                            onChange={(e) => handleQuantityChange(product.id, outlet.id, 'full', e.target.value)}
                            className="w-full px-2 py-1 text-sm text-center rounded"
                            style={{ border: '1px solid #D1D5DB' }}
                          />
                        </td>
                        <td key={`${product.id}-${outlet.id}-m`} className="px-1 py-1 border-r" style={{ borderColor: '#D1D5DB' }}>
                          <input
                            type="number"
                            min="0"
                            value={quantities[product.id]?.[outlet.id]?.mini || 0}
                            onChange={(e) => handleQuantityChange(product.id, outlet.id, 'mini', e.target.value)}
                            className="w-full px-2 py-1 text-sm text-center rounded"
                            style={{ border: '1px solid #D1D5DB' }}
                          />
                        </td>
                      </>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC' }}>
        <p className="text-sm font-medium mb-2" style={{ color: '#166534' }}>How it works:</p>
        <ul className="text-sm space-y-1" style={{ color: '#166534' }}>
          <li>• Configure default quantities for each day type (Weekday, Saturday, Sunday, Holiday)</li>
          <li>• When creating a delivery plan, quantities will auto-load based on the selected day type</li>
          <li>• You can still modify quantities after auto-loading in the Order Entry Grid</li>
          <li>• Click <strong>Save Defaults</strong> to save your changes for the selected day type</li>
        </ul>
      </div>
    </div>
  );
}
