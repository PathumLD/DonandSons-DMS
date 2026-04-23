'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Printer, AlertTriangle, Lock } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useDayEndStore } from '@/lib/stores/day-end-store';
import { addDaysISO, isAdminUser } from '@/lib/date-restrictions';

/**
 * 5. Reports
 *
 * Per spec:
 *  - Admin sees all reports.
 *  - Non-admins only see reports that admin has explicitly granted permissions
 *    to (filter by `reports.<key>.view` permissions).
 *  - For ANY user: only generate reports for dates >= the date AFTER the last
 *    submitted Day-End Process. No reports may be generated for dates on or
 *    before the last Day-End Process date.
 */

const ALL_REPORTS = [
  { value: 'sales',     label: 'Sales Report',           permission: 'reports.sales.view' },
  { value: 'delivery',  label: 'Delivery Report',        permission: 'reports.delivery.view' },
  { value: 'disposal',  label: 'Disposal Report',        permission: 'reports.disposal.view' },
  { value: 'inventory', label: 'Inventory Report',       permission: 'reports.inventory.view' },
  { value: 'product',   label: 'Product Wise Report',    permission: 'reports.product.view' },
  { value: 'showroom',  label: 'Showroom Wise Report',   permission: 'reports.showroom.view' },
  { value: 'category',  label: 'Category Wise Report',   permission: 'reports.category.view' },
  { value: 'daily',     label: 'Daily Summary Report',   permission: 'reports.daily.view' },
  { value: 'monthly',   label: 'Monthly Summary Report', permission: 'reports.monthly.view' },
  { value: 'profit',    label: 'Profit & Loss Report',   permission: 'reports.profit.view' },
];

export default function ReportsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const lastDayEndProcessDate = useDayEndStore((s) => s.lastDayEndProcessDate);
  const getMinReportDate = useDayEndStore((s) => s.getMinReportDate);

  const allowedReports = useMemo(() => {
    if (isAdmin) return ALL_REPORTS;
    return ALL_REPORTS.filter((r) => user?.permissions?.includes(r.permission));
  }, [user, isAdmin]);

  // Earliest date allowed = day AFTER last Day-End Process.
  const minDate = useMemo(() => {
    return getMinReportDate();
  }, [getMinReportDate]);

  const [reportType, setReportType] = useState('');
  const [fromDate, setFromDate] = useState(minDate);
  const [toDate, setToDate] = useState(addDaysISO(0));
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = () => {
    setError(null);
    if (!reportType) {
      setError('Please select a report type.');
      return;
    }
    if (fromDate < minDate || toDate < minDate) {
      setError(
        `Reports cannot be generated for dates on or before the last Day-End Process (${lastDayEndProcessDate || 'N/A'}).`
      );
      return;
    }
    if (fromDate > toDate) {
      setError('From Date must be before To Date.');
      return;
    }
    alert(`Generating ${reportType} report from ${fromDate} to ${toDate}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Reports</h1>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Generate and download business reports.
        </p>
      </div>

      <div
        className="p-4 rounded-lg flex items-start gap-3"
        style={{ backgroundColor: '#FFFBEB', border: '1px solid #FFD100' }}
      >
        <Lock className="w-5 h-5" style={{ color: '#92400E' }} />
        <div>
          <p className="text-sm font-medium" style={{ color: '#92400E' }}>
            Reports Date Restriction
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#92400E' }}>
            The most recent Day-End Process was submitted on <strong>{lastDayEndProcessDate || 'N/A'}</strong>.
            Reports can only be generated for dates from <strong>{minDate}</strong> onwards (after the last Day-End Process).
          </p>
        </div>
      </div>

      {!isAdmin && allowedReports.length === 0 && (
        <div className="p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
          <AlertTriangle className="w-5 h-5" style={{ color: '#DC2626' }} />
          <div className="text-sm" style={{ color: '#991B1B' }}>
            You do not have access to any reports. Please contact your administrator.
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Generate Report</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={allowedReports.map((r) => ({ value: r.value, label: r.label }))}
              placeholder="Select report type"
              fullWidth
              disabled={allowedReports.length === 0}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="From Date"
                type="date"
                value={fromDate}
                min={minDate}
                onChange={(e) => setFromDate(e.target.value)}
                helperText={`Earliest allowed: ${minDate}`}
                fullWidth
              />
              <Input
                label="To Date"
                type="date"
                value={toDate}
                min={minDate}
                onChange={(e) => setToDate(e.target.value)}
                fullWidth
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                <p className="text-sm" style={{ color: '#991B1B' }}>{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={handleGenerateReport}
                disabled={allowedReports.length === 0}
              >
                <FileText className="w-4 h-4 mr-2" />Generate Report
              </Button>
              <Button variant="secondary" size="md">
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
              <Button variant="secondary" size="md">
                <Printer className="w-4 h-4 mr-2" />Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Available Reports</CardTitle>
            <Badge variant="primary" size="sm">
              {allowedReports.length} of {ALL_REPORTS.length} accessible
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allowedReports.map((r) => (
              <div
                key={r.value}
                className="p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-50"
                style={{ border: '1px solid var(--border)' }}
                onClick={() => setReportType(r.value)}
              >
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>{r.label}</h4>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{r.permission}</p>
                </div>
                <FileText className="w-5 h-5" style={{ color: '#C8102E' }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Reports</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Sales Report - April 2026', date: '2026-04-21', size: '2.5 MB' },
              { name: 'Delivery Report - Week 16', date: '2026-04-20', size: '1.8 MB' },
              { name: 'Monthly Summary - March 2026', date: '2026-04-01', size: '3.2 MB' },
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg" style={{ border: '1px solid var(--border)' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF3C4' }}>
                    <FileText className="w-5 h-5" style={{ color: '#C8102E' }} />
                  </div>
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>{report.name}</h4>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{report.date} • {report.size}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm"><Printer className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
