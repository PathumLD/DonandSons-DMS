'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { brandColors } from '@/lib/theme/colors';

const mockData = [
  { category: 'Bread', delivery: 450, disposal: 45 },
  { category: 'Bun', delivery: 380, disposal: 32 },
  { category: 'Cake', delivery: 220, disposal: 28 },
  { category: 'Pastry', delivery: 290, disposal: 25 },
  { category: 'Pizza', delivery: 180, disposal: 18 },
  { category: 'Sandwich', delivery: 240, disposal: 22 },
  { category: 'Rotty', delivery: 160, disposal: 15 },
  { category: 'Biscuit', delivery: 150, disposal: 12 },
];

export function DeliveryVsDisposalWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery vs Disposal Trend - 7 Days</CardTitle>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          Comparison by product category
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="category" 
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={{ stroke: '#E5E7EB' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: any) => [`${value} items`, '']}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="rect"
              formatter={(value) => (
                <span style={{ color: '#374151', fontSize: '13px' }}>
                  {value === 'delivery' ? 'Delivery Quantity' : 'Disposal Quantity'}
                </span>
              )}
            />
            <Bar 
              dataKey="delivery" 
              fill={brandColors.primary.DEFAULT}
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="disposal" 
              fill={brandColors.accent.DEFAULT}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
