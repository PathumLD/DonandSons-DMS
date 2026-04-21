'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { brandColors } from '@/lib/theme/colors';

const mockData = [
  { date: '15 Mon', value: 1450000 },
  { date: '16 Tue', value: 1520000 },
  { date: '17 Wed', value: 1680000 },
  { date: '18 Thu', value: 1550000 },
  { date: '19 Fri', value: 1780000 },
  { date: '20 Sat', value: 1650000 },
  { date: '21 Sun', value: 1420000 },
];

export function SalesTrendWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend for Last 7 Days</CardTitle>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          Total delivery sales value per day
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={brandColors.primary.DEFAULT} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={brandColors.primary.DEFAULT} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: any) => [`Rs. ${value.toLocaleString()}`, 'Sales']}
              labelStyle={{ color: '#111827', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={brandColors.primary.DEFAULT}
              strokeWidth={2}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
