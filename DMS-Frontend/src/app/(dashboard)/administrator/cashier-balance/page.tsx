'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Save } from 'lucide-react';
import { mockShowrooms } from '@/lib/mock-data/showrooms';

export default function CashierBalancePage() {
  const [formData, setFormData] = useState({
    balanceDate: new Date().toISOString().split('T')[0],
    showroomId: '',
    cashier: '',
    openingCash: '',
    salesCash: '',
    salesCard: '',
    expenses: '',
    closingCash: '',
  });

  const calculateBalance = () => {
    const opening = Number(formData.openingCash) || 0;
    const sales = Number(formData.salesCash) || 0;
    const expenses = Number(formData.expenses) || 0;
    return opening + sales - expenses;
  };

  const handleSave = () => {
    console.log('Saving cashier balance:', formData);
    alert('Cashier balance saved successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Cashier Balance</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>Record and reconcile daily cashier transactions</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Balance Entry</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Balance Date" type="date" value={formData.balanceDate} onChange={(e) => setFormData({ ...formData, balanceDate: e.target.value })} fullWidth required />
              <Select label="Showroom" value={formData.showroomId} onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })} options={mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))} placeholder="Select showroom" fullWidth required />
              <Input label="Cashier Name" value={formData.cashier} onChange={(e) => setFormData({ ...formData, cashier: e.target.value })} placeholder="Cashier name" fullWidth required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Opening Cash (Rs.)" type="number" step="0.01" value={formData.openingCash} onChange={(e) => setFormData({ ...formData, openingCash: e.target.value })} placeholder="0.00" fullWidth required />
              <Input label="Sales - Cash (Rs.)" type="number" step="0.01" value={formData.salesCash} onChange={(e) => setFormData({ ...formData, salesCash: e.target.value })} placeholder="0.00" fullWidth required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Sales - Card (Rs.)" type="number" step="0.01" value={formData.salesCard} onChange={(e) => setFormData({ ...formData, salesCard: e.target.value })} placeholder="0.00" fullWidth required />
              <Input label="Expenses (Rs.)" type="number" step="0.01" value={formData.expenses} onChange={(e) => setFormData({ ...formData, expenses: e.target.value })} placeholder="0.00" fullWidth />
            </div>

            <div className="p-6 rounded-lg" style={{ backgroundColor: '#FEF3C4', border: '2px solid #FFD100' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#78350F' }}>Expected Closing Balance</p>
                  <p className="text-3xl font-bold" style={{ color: '#111827' }}>Rs. {calculateBalance().toLocaleString()}</p>
                </div>
                <DollarSign className="w-12 h-12" style={{ color: '#C8102E' }} />
              </div>
            </div>

            <Input label="Actual Closing Cash (Rs.)" type="number" step="0.01" value={formData.closingCash} onChange={(e) => setFormData({ ...formData, closingCash: e.target.value })} placeholder="0.00" fullWidth required />

            {formData.closingCash && (
              <div className={`p-4 rounded-lg ${Number(formData.closingCash) === calculateBalance() ? 'bg-green-50' : 'bg-red-50'}`} style={{ border: `1px solid ${Number(formData.closingCash) === calculateBalance() ? '#86EFAC' : '#FCA5A5'}` }}>
                <p className="text-sm font-medium" style={{ color: Number(formData.closingCash) === calculateBalance() ? '#166534' : '#991B1B' }}>
                  {Number(formData.closingCash) === calculateBalance() 
                    ? '✓ Balance matches! No discrepancy.' 
                    : `⚠ Discrepancy: Rs. ${Math.abs(Number(formData.closingCash) - calculateBalance()).toFixed(2)}`
                  }
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button variant="primary" size="md" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />Save Balance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Balances</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '2026-04-20', showroom: 'Dalmeny', cashier: 'Mary Fernando', opening: 50000, closing: 48500, status: 'Balanced' },
              { date: '2026-04-20', showroom: 'Ragama', cashier: 'John Silva', opening: 45000, closing: 47200, status: 'Balanced' },
              { date: '2026-04-19', showroom: 'Dalmeny', cashier: 'Mary Fernando', opening: 52000, closing: 50000, status: 'Balanced' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg" style={{ border: '1px solid #E5E7EB' }}>
                <div>
                  <p className="font-medium" style={{ color: '#111827' }}>{item.showroom} - {item.cashier}</p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    {new Date(item.date).toLocaleDateString()} • Opening: Rs. {item.opening.toLocaleString()} • Closing: Rs. {item.closing.toLocaleString()}
                  </p>
                </div>
                <Badge variant="success" size="sm">{item.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
