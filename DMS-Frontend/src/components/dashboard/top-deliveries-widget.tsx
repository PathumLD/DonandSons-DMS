'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { brandColors } from '@/lib/theme/colors';

const mockData = [
  { showroom: 'DAL', count: 15 },
  { showroom: 'RAG', count: 7 },
  { showroom: 'RAN', count: 5 },
  { showroom: 'DBQ', count: 5 },
  { showroom: 'KAD', count: 5 },
  { showroom: 'KEL', count: 4 },
  { showroom: 'KML', count: 4 },
  { showroom: 'SGK', count: 4 },
  { showroom: 'WED', count: 4 },
].sort((a, b) => b.count - a.count);

export function TopDeliveriesWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today Top Deliveries</CardTitle>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          Showrooms ranked by delivery count
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Table */}
          <div>
            <div className="overflow-hidden rounded-lg" style={{ border: '1px solid #E5E7EB' }}>
              <table className="min-w-full divide-y" style={{ borderColor: '#E5E7EB' }}>
                <thead style={{ backgroundColor: '#F9FAFB' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                      Showroom
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                      Deliveries
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y" style={{ borderColor: '#E5E7EB' }}>
                  {mockData.map((item, index) => (
                    <tr key={item.showroom} className={index % 2 === 0 ? '' : ''} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#F9FAFB' }}>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: '#111827' }}>
                        {item.showroom}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold" style={{ color: '#C8102E' }}>
                        {item.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bar Chart */}
          <div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mockData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  type="number"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="showroom"
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
                  formatter={(value: any) => [`${value} deliveries`, 'Count']}
                />
                <Bar 
                  dataKey="count" 
                  fill={brandColors.primary.DEFAULT}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
