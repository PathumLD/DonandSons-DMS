'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Lock,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { addDaysISO } from '@/lib/date-restrictions';
import { useDayEndStore } from '@/lib/stores/day-end-store';

/**
 * 6.i Day-End Process
 *
 * Per spec:
 *  - Page loads with the previous day pre-selected.
 *  - If Cashier Balance is NOT approved for the selected date, every Day-End
 *    Process control is disabled.
 *  - If the selected date is Day-Locked, Day-End Process cannot be run for it.
 */

interface ShowroomDayEnd {
  showroomId: number;
  showroomName: string;
  selected: boolean;
  cashierId: string;
  cashierBalance: string;
  systemBalance: string;
  status: 'Pending' | 'Completed' | 'Error';
}

// Mock cashiers
const mockCashiers = [
  { id: 'cashier1', name: 'John Doe' },
  { id: 'cashier2', name: 'Jane Smith' },
  { id: 'cashier3', name: 'Mike Johnson' },
  { id: 'cashier4', name: 'Sarah Williams' },
];

// Mock state. In a real app these would come from the backend / store.
const APPROVED_CASHIER_BALANCE_DATES = new Set<string>([addDaysISO(-1)]);
const DAY_LOCKED_DATES = new Set<string>([addDaysISO(-2)]);

export default function DayEndProcessPage() {
  const setLastDayEndProcessDate = useDayEndStore((s) => s.setLastDayEndProcessDate);
  
  // Page loads with previous day selected (6.i).
  const [processDate, setProcessDate] = useState<string>(addDaysISO(-1));
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Initialize showroom data from mock
  const [showrooms, setShowrooms] = useState<ShowroomDayEnd[]>([
    { showroomId: 1, showroomName: 'Walasmulla', selected: false, cashierId: '', cashierBalance: '', systemBalance: '125000.00', status: 'Pending' },
    { showroomId: 2, showroomName: 'Dedigama', selected: false, cashierId: '', cashierBalance: '', systemBalance: '98500.50', status: 'Pending' },
    { showroomId: 3, showroomName: 'Balana Corner', selected: false, cashierId: '', cashierBalance: '', systemBalance: '156700.00', status: 'Pending' },
    { showroomId: 4, showroomName: 'Kaduriya', selected: false, cashierId: '', cashierBalance: '', systemBalance: '87300.25', status: 'Pending' },
    { showroomId: 5, showroomName: 'Singapakanda', selected: false, cashierId: '', cashierBalance: '', systemBalance: '112450.75', status: 'Pending' },
    { showroomId: 6, showroomName: 'Kadawatha', selected: false, cashierId: '', cashierBalance: '', systemBalance: '134800.00', status: 'Pending' },
    { showroomId: 7, showroomName: 'Ragama', selected: false, cashierId: '', cashierBalance: '', systemBalance: '145600.50', status: 'Pending' },
    { showroomId: 8, showroomName: 'Bandarawatta', selected: false, cashierId: '', cashierBalance: '', systemBalance: '92100.00', status: 'Pending' },
    { showroomId: 9, showroomName: 'Ranmuthugala', selected: false, cashierId: '', cashierBalance: '', systemBalance: '78950.25', status: 'Pending' },
    { showroomId: 10, showroomName: 'SRP', selected: false, cashierId: '', cashierBalance: '', systemBalance: '167300.00', status: 'Pending' },
    { showroomId: 11, showroomName: 'Older', selected: false, cashierId: '', cashierBalance: '', systemBalance: '103200.75', status: 'Pending' },
    { showroomId: 12, showroomName: 'Dalgama BRQ', selected: false, cashierId: '', cashierBalance: '', systemBalance: '89400.50', status: 'Pending' },
    { showroomId: 13, showroomName: 'York', selected: false, cashierId: '', cashierBalance: '', systemBalance: '121500.00', status: 'Pending' },
    { showroomId: 14, showroomName: 'Kalagirimulla', selected: false, cashierId: '', cashierBalance: '', systemBalance: '95750.25', status: 'Pending' },
  ]);

  const cashierApproved = APPROVED_CASHIER_BALANCE_DATES.has(processDate);
  const dayLocked = DAY_LOCKED_DATES.has(processDate);

  // Per spec: if cashier balance not approved -> all day-end controls disabled.
  // Per spec: if day already locked -> cannot day-end process.
  const blocked = !cashierApproved || dayLocked;

  const blockReason = useMemo(() => {
    if (dayLocked) return 'Selected date is Day-Locked. Day-End Process cannot be performed.';
    if (!cashierApproved) return 'Cashier Balance for this date is not approved. All Day-End Process actions are disabled.';
    return null;
  }, [dayLocked, cashierApproved]);

  const toggleShowroom = (id: number) => {
    if (blocked) return;
    setShowrooms(prev => prev.map(s => 
      s.showroomId === id ? { ...s, selected: !s.selected } : s
    ));
  };

  const updateCashier = (id: number, cashierId: string) => {
    if (blocked) return;
    setShowrooms(prev => prev.map(s => 
      s.showroomId === id ? { ...s, cashierId } : s
    ));
  };

  const updateCashierBalance = (id: number, balance: string) => {
    if (blocked) return;
    setShowrooms(prev => prev.map(s => 
      s.showroomId === id ? { ...s, cashierBalance: balance } : s
    ));
  };

  const handleSubmit = async () => {
    if (blocked) return;
    
    const selectedShowrooms = showrooms.filter(s => s.selected);
    if (selectedShowrooms.length === 0) {
      alert('Please select at least one showroom');
      return;
    }

    // Validate all selected showrooms have cashier and balance
    for (const showroom of selectedShowrooms) {
      if (!showroom.cashierId) {
        alert(`Please select cashier for ${showroom.showroomName}`);
        return;
      }
      if (!showroom.cashierBalance) {
        alert(`Please enter cashier balance for ${showroom.showroomName}`);
        return;
      }
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    
    // Update the global Day-End Process date
    setLastDayEndProcessDate(processDate);
    
    // Mark selected showrooms as completed
    setShowrooms(prev => prev.map(s => 
      s.selected ? { ...s, status: 'Completed' as const } : s
    ));
    
    alert('Day-End Process completed successfully!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return <Badge variant="success" size="sm">Completed</Badge>;
      case 'Error': return <Badge variant="danger" size="sm">Error</Badge>;
      default: return <Badge variant="neutral" size="sm">-</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Day-End Process
        </h1>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Complete daily closing operations for selected showrooms. Page defaults to the previous day.
        </p>
      </div>

      {blockReason && (
        <div
          className="p-4 rounded-lg flex items-start gap-3"
          style={{
            backgroundColor: dayLocked ? '#FEF2F2' : '#FFFBEB',
            border: `1px solid ${dayLocked ? '#FCA5A5' : '#FFD100'}`,
          }}
        >
          <ShieldAlert
            className="w-5 h-5 mt-0.5"
            style={{ color: dayLocked ? '#DC2626' : '#92400E' }}
          />
          <p
            className="text-sm font-medium"
            style={{ color: dayLocked ? '#991B1B' : '#92400E' }}
          >
            {blockReason}
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Day-End Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Process Date */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)', minWidth: '100px' }}>
                Process Date:
              </label>
              <Input
                type="date"
                value={processDate}
                onChange={(e) => {
                  setProcessDate(e.target.value);
                }}
                max={addDaysISO(-1)}
                disabled={blocked}
                style={{ maxWidth: '200px' }}
              />
              {cashierApproved ? (
                <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3 mr-1" />Cashier Balance Approved</Badge>
              ) : (
                <Badge variant="danger" size="sm"><AlertTriangle className="w-3 h-3 mr-1" />Cashier Balance Not Approved</Badge>
              )}
              {dayLocked && (
                <Badge variant="danger" size="sm"><Lock className="w-3 h-3 mr-1" />Day Locked</Badge>
              )}
            </div>

            {/* Showroom Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                    <th className="text-left py-3 px-4" style={{ color: 'var(--muted-foreground)', fontWeight: 600, fontSize: '0.875rem', width: '50px' }}></th>
                    <th className="text-left py-3 px-4" style={{ color: 'var(--muted-foreground)', fontWeight: 600, fontSize: '0.875rem' }}>ShowRoom</th>
                    <th className="text-left py-3 px-4" style={{ color: 'var(--muted-foreground)', fontWeight: 600, fontSize: '0.875rem' }}>Cashier Name</th>
                    <th className="text-left py-3 px-4" style={{ color: 'var(--muted-foreground)', fontWeight: 600, fontSize: '0.875rem' }}>Cashier's Balance</th>
                    <th className="text-left py-3 px-4" style={{ color: 'var(--muted-foreground)', fontWeight: 600, fontSize: '0.875rem' }}>System Balance</th>
                    <th className="text-left py-3 px-4" style={{ color: 'var(--muted-foreground)', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {showrooms.map((showroom, index) => (
                    <tr 
                      key={showroom.showroomId}
                      style={{ 
                        borderBottom: index < showrooms.length - 1 ? '1px solid var(--border)' : 'none',
                        backgroundColor: showroom.selected && !blocked ? '#F0FDF4' : 'white',
                        opacity: blocked ? 0.6 : 1,
                      }}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={showroom.selected}
                          onChange={() => toggleShowroom(showroom.showroomId)}
                          disabled={blocked}
                          className="rounded w-4 h-4"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{showroom.showroomName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={showroom.cashierId}
                          onChange={(e) => updateCashier(showroom.showroomId, e.target.value)}
                          disabled={blocked}
                          className="w-full px-3 py-2 rounded-lg text-sm"
                          style={{ border: '1px solid var(--input)' }}
                        >
                          <option value="">-- Select Cashier --</option>
                          {mockCashiers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={showroom.cashierBalance}
                          onChange={(e) => updateCashierBalance(showroom.showroomId, e.target.value)}
                          disabled={blocked}
                          placeholder="0.00"
                          className="w-full px-3 py-2 rounded-lg text-sm"
                          style={{ border: '1px solid var(--input)' }}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{showroom.systemBalance}</span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(showroom.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                isLoading={isProcessing}
                disabled={blocked || isProcessing}
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <><CheckCircle className="w-4 h-4 mr-2" />Submit Day-End Process</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
