'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { CheckCircle, Lock, DollarSign, Package, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DayEndProcessPage() {
  const [processDate, setProcessDate] = useState(new Date().toISOString().split('T')[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleDayEnd = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsProcessing(false);
    setIsCompleted(true);
  };

  const dayEndSummary = {
    totalSales: 1250000,
    totalDeliveries: 45,
    totalDisposals: 28,
    cashInHand: 85000,
    cardPayments: 965000,
    creditSales: 200000,
    openingStock: 5000,
    closingStock: 4200,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Day-End Process</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>Complete daily closing operations and generate reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#6B7280' }}>Total Sales</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>Rs. {dayEndSummary.totalSales.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF3C4' }}>
                <DollarSign className="w-6 h-6" style={{ color: '#C8102E' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#6B7280' }}>Total Deliveries</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>{dayEndSummary.totalDeliveries}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F0FDF4' }}>
                <Package className="w-6 h-6" style={{ color: '#10B981' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#6B7280' }}>Total Disposals</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>{dayEndSummary.totalDisposals}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                <TrendingUp className="w-6 h-6" style={{ color: '#DC2626' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Day-End Checklist</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { task: 'All deliveries completed and recorded', status: 'completed' },
              { task: 'All disposals entered and approved', status: 'completed' },
              { task: 'Cash register balanced', status: 'completed' },
              { task: 'Stock counts verified', status: 'pending' },
              { task: 'Reports generated', status: 'pending' },
              { task: 'Backup completed', status: 'pending' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg" style={{ border: '1px solid #E5E7EB' }}>
                <span className="text-sm font-medium" style={{ color: '#111827' }}>{item.task}</span>
                {item.status === 'completed' ? (
                  <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3 mr-1" />Done</Badge>
                ) : (
                  <Badge variant="neutral" size="sm">Pending</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payment Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
              <p className="text-sm mb-1" style={{ color: '#6B7280' }}>Cash</p>
              <p className="text-xl font-bold" style={{ color: '#111827' }}>Rs. {dayEndSummary.cashInHand.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
              <p className="text-sm mb-1" style={{ color: '#6B7280' }}>Card Payments</p>
              <p className="text-xl font-bold" style={{ color: '#111827' }}>Rs. {dayEndSummary.cardPayments.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
              <p className="text-sm mb-1" style={{ color: '#6B7280' }}>Credit Sales</p>
              <p className="text-xl font-bold" style={{ color: '#111827' }}>Rs. {dayEndSummary.creditSales.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleDayEnd}
          isLoading={isProcessing}
          disabled={isCompleted}
        >
          {isCompleted ? (
            <><CheckCircle className="w-5 h-5 mr-2" />Day-End Completed</>
          ) : (
            <><Lock className="w-5 h-5 mr-2" />Complete Day-End Process</>
          )}
        </Button>
      </div>

      {isCompleted && (
        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC' }}>
          <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#10B981' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#166534' }}>Day-End Process Completed!</h3>
          <p className="text-sm" style={{ color: '#166534' }}>All transactions have been locked and reports have been generated.</p>
        </div>
      )}
    </div>
  );
}
