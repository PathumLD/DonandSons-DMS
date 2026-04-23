'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Save, AlertTriangle, Lock, CheckCircle } from 'lucide-react';
import { mockShowrooms } from '@/lib/mock-data/showrooms';
import { useAuthStore } from '@/lib/stores/auth-store';
import { addDaysISO, todayISO } from '@/lib/date-restrictions';

/**
 * 6.ii Cashier Balance
 *
 * Per spec:
 *  - Page loads with previous day auto-selected (date field).
 *  - If a Cashier Balance for selected date is already submitted, ALL fields are
 *    totally disabled.
 *  - Showroom checkboxes start unchecked. User can SELECT showrooms but
 *    CANNOT UNSELECT them once selected.
 *  - "Showroom Is Closed" checkbox is available for each selected showroom.
 *  - When "Showroom Is Closed" is checked: Cashier Name combo and Cashier
 *    Balance text box are cleared and disabled, AND a "Showroom Closed" approval entry is
 *    created.
 *  - When Cashier Balance text box is blank (null): Cashier Name combo box is
 *    disabled.
 */

interface ShowroomRow {
  showroomId: number;
  showroomCode: string;
  showroomName: string;
  selected: boolean; // always true per spec; locked
  isClosed: boolean;
  cashierName: string;
  cashierBalance: string;
}

interface SubmittedBalance {
  date: string;
  rows: ShowroomRow[];
  submittedAt: string;
  submittedBy: string;
}

export default function CashierBalancePage() {
  const user = useAuthStore((s) => s.user);

  // Page loads with previous day automatically selected (6.ii).
  const [balanceDate, setBalanceDate] = useState<string>(addDaysISO(-1));

  const [submittedBalances, setSubmittedBalances] = useState<SubmittedBalance[]>([]);

  const buildRowsForDate = (): ShowroomRow[] =>
    mockShowrooms
      .filter((s) => s.active)
      .map((s) => ({
        showroomId: s.id,
        showroomCode: s.code,
        showroomName: s.name,
        selected: false, // User can select, but cannot unselect once selected
        isClosed: false,
        cashierName: '',
        cashierBalance: '',
      }));

  const [rows, setRows] = useState<ShowroomRow[]>(buildRowsForDate());

  // Submitted balance for the currently selected date (if any).
  const submittedForDate = useMemo(
    () => submittedBalances.find((b) => b.date === balanceDate),
    [submittedBalances, balanceDate]
  );

  const isLocked = Boolean(submittedForDate);

  // When the date changes, refresh the rows (load submitted snapshot if any).
  useEffect(() => {
    if (submittedForDate) {
      setRows(submittedForDate.rows);
    } else {
      setRows(buildRowsForDate());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balanceDate]);

  const cashierOptions = [
    { value: 'Mary Fernando', label: 'Mary Fernando' },
    { value: 'John Silva', label: 'John Silva' },
    { value: 'Anil Perera', label: 'Anil Perera' },
    { value: 'Sunethra Wickramasinghe', label: 'Sunethra Wickramasinghe' },
    { value: 'Kamal Senaratne', label: 'Kamal Senaratne' },
  ];

  const toggleShowroomSelection = (idx: number) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        // Can only CHECK (select), cannot UNCHECK (unselect)
        if (!r.selected) {
          return { ...r, selected: true };
        }
        return r;
      })
    );
  };

  const updateRow = (idx: number, patch: Partial<ShowroomRow>) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        const merged = { ...r, ...patch };
        // Spec: if "Showroom Is Closed" is checked, clear Cashier Name + Balance.
        if (patch.isClosed === true) {
          merged.cashierName = '';
          merged.cashierBalance = '';
        }
        // Spec: if Cashier Balance is blank (null), disable Cashier Name combo
        // and keep cashierName empty too (avoid stale state).
        if (patch.cashierBalance !== undefined && patch.cashierBalance.trim() === '') {
          merged.cashierName = '';
        }
        return merged;
      })
    );
  };

  const selectedRows = rows.filter(r => r.selected);
  
  const totalBalance = selectedRows.reduce(
    (sum, r) => sum + (Number(r.cashierBalance) || 0),
    0
  );

  const closedCount = selectedRows.filter((r) => r.isClosed).length;
  const openCount = selectedRows.length - closedCount;

  const handleSubmit = () => {
    // Validation: each selected, non-closed row must have cashier name & balance.
    const selectedRows = rows.filter(r => r.selected);
    
    if (selectedRows.length === 0) {
      alert('Please select at least one showroom to submit cashier balance.');
      return;
    }

    const invalid = selectedRows.find(
      (r) => !r.isClosed && (!r.cashierBalance.trim() || !r.cashierName.trim())
    );
    if (invalid) {
      alert(
        `Please complete cashier name and balance for ${invalid.showroomCode} - ${invalid.showroomName} (or mark as Showroom Is Closed).`
      );
      return;
    }

    const submission: SubmittedBalance = {
      date: balanceDate,
      rows,
      submittedAt: new Date().toLocaleString(),
      submittedBy: user?.email ?? 'admin',
    };

    setSubmittedBalances((prev) => [submission, ...prev]);

    const closedRows = selectedRows.filter((r) => r.isClosed);
    if (closedRows.length > 0) {
      alert(
        `Cashier balance submitted for ${balanceDate}.\n\n${closedRows.length} "Showroom Closed" entries have been sent to Approvals queue.`
      );
    } else {
      alert(`Cashier balance submitted for ${balanceDate}.`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Cashier Balance
        </h1>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Record daily cashier balances for showrooms. Select showrooms to enter balance data. Once selected, checkboxes cannot be unselected.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Selected Date</p>
            <p className="text-lg font-bold mt-1" style={{ color: 'var(--foreground)' }}>
              {new Date(balanceDate).toLocaleDateString()}
            </p>
            <p className="text-xs mt-1" style={{ color: isLocked ? '#DC2626' : '#10B981' }}>
              {isLocked ? 'Submitted (locked)' : 'Open for entry'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Open Showrooms</p>
            <p className="text-lg font-bold mt-1" style={{ color: '#10B981' }}>{openCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Closed Showrooms</p>
            <p className="text-lg font-bold mt-1" style={{ color: '#DC2626' }}>{closedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Total Balance (Rs.)</p>
            <p className="text-lg font-bold mt-1" style={{ color: '#C8102E' }}>
              {totalBalance.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Balance Entry</CardTitle>
            {isLocked && (
              <Badge variant="warning" size="sm">
                <Lock className="w-3 h-3 mr-1" /> Submitted - Read only
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Balance Date"
                type="date"
                value={balanceDate}
                onChange={(e) => setBalanceDate(e.target.value)}
                max={todayISO()}
                helperText="Defaults to previous day. Past or current dates only."
                fullWidth
                required
              />
            </div>

            {!isLocked && (
              <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: '#EFF6FF', border: '1px solid #3B82F6' }}>
                <div className="text-sm" style={{ color: '#1E40AF' }}>
                  <strong>Note:</strong> Select showrooms to enter cashier balance. Once selected, showrooms cannot be unselected.
                </div>
              </div>
            )}

            {/* Per-showroom rows */}
            <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: 'var(--muted)' }}>
                  <tr>
                    <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Showroom</th>
                    <th className="text-center p-3" style={{ color: 'var(--muted-foreground)' }}>Showroom Is Closed</th>
                    <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Cashier Name</th>
                    <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Cashier Balance (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const balanceBlank = !r.cashierBalance.trim();
                    const cashierNameDisabled = isLocked || r.isClosed || balanceBlank || !r.selected;
                    const balanceDisabled = isLocked || r.isClosed || !r.selected;
                    const checkboxDisabled = isLocked || (r.selected && !r.isClosed);
                    
                    return (
                      <tr 
                        key={r.showroomId} 
                        style={{ 
                          borderTop: '1px solid var(--border)',
                          backgroundColor: r.selected && !isLocked ? '#F0FDF4' : 'white'
                        }}
                      >
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={r.selected}
                              disabled={checkboxDisabled}
                              onChange={() => toggleShowroomSelection(idx)}
                              className="rounded w-4 h-4"
                              title={r.selected ? "Cannot unselect once selected" : "Select showroom"}
                            />
                            <div>
                              <div className="font-mono font-semibold" style={{ color: '#C8102E' }}>{r.showroomCode}</div>
                              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.showroomName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={r.isClosed}
                            disabled={isLocked || !r.selected}
                            onChange={(e) => updateRow(idx, { isClosed: e.target.checked })}
                            className="rounded w-5 h-5"
                            title="Mark showroom as closed for the day"
                          />
                          {r.isClosed && (
                            <div className="text-[11px] mt-1" style={{ color: '#92400E' }}>
                              Sent to approvals
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <Select
                            value={r.cashierName}
                            disabled={cashierNameDisabled}
                            onChange={(e) => updateRow(idx, { cashierName: e.target.value })}
                            options={cashierOptions}
                            placeholder={
                              !r.selected
                                ? 'Select showroom first'
                                : r.isClosed
                                  ? 'Closed'
                                  : balanceBlank
                                    ? 'Enter balance first'
                                    : 'Select cashier'
                            }
                            fullWidth
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            step="0.01"
                            value={r.cashierBalance}
                            disabled={balanceDisabled}
                            onChange={(e) => updateRow(idx, { cashierBalance: e.target.value })}
                            placeholder={!r.selected ? '' : r.isClosed ? 'Closed' : '0.00'}
                            fullWidth
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!isLocked && closedCount > 0 && (
              <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FFD100' }}>
                <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: '#92400E' }} />
                <div className="text-sm" style={{ color: '#92400E' }}>
                  {closedCount} showroom{closedCount > 1 ? 's are' : ' is'} marked as closed.
                  These entries will be added to the Approvals queue when you
                  submit.
                </div>
              </div>
            )}

            {!isLocked && (
              <div className="flex justify-end pt-2">
                <Button variant="primary" size="md" onClick={handleSubmit}>
                  <Save className="w-4 h-4 mr-2" /> Submit Cashier Balance
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Submissions</CardTitle></CardHeader>
        <CardContent>
          {submittedBalances.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No balances submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {submittedBalances.slice(0, 10).map((s, i) => {
                const total = s.rows.reduce(
                  (sum, r) => sum + (Number(r.cashierBalance) || 0),
                  0
                );
                const closed = s.rows.filter((r) => r.isClosed).length;
                return (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg" style={{ border: '1px solid var(--border)' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF3C4' }}>
                        <DollarSign className="w-5 h-5" style={{ color: '#C8102E' }} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                          {new Date(s.date).toLocaleDateString()} - Total Rs. {total.toLocaleString()}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {s.submittedBy} - {s.submittedAt} - {closed} closed
                        </p>
                      </div>
                    </div>
                    <Badge variant="success" size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" /> Submitted
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
