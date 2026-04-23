'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { CheckSquare, AlertTriangle, CheckCircle, Search, Filter, Download, RefreshCw, Eye, ArrowUpDown } from 'lucide-react';
import { mockOutletsFull } from '@/lib/mock-data/outlets-with-variants';
import { allProducts } from '@/lib/mock-data/products-full';

type DiffStatus = 'matched' | 'short' | 'over' | 'missing-pos' | 'missing-dms';

interface ReconRow {
  id: number;
  outletCode: string;
  outletName: string;
  productCode: string;
  productName: string;
  dmsQty: number;
  posQty: number;
  diff: number;
  status: DiffStatus;
}

const statusMeta: Record<DiffStatus, { label: string; variant: 'success' | 'danger' | 'warning' | 'neutral' | 'info' }> = {
  matched: { label: 'Matched', variant: 'success' },
  short: { label: 'Short Delivered', variant: 'danger' },
  over: { label: 'Over Delivered', variant: 'warning' },
  'missing-pos': { label: 'Not in POS', variant: 'info' },
  'missing-dms': { label: 'Not in DMS', variant: 'neutral' },
};

const generateRows = (date: string): ReconRow[] => {
  const rows: ReconRow[] = [];
  let id = 1;
  mockOutletsFull.filter(o => o.active).slice(0, 8).forEach(outlet => {
    allProducts.slice(0, 6).forEach((product, idx) => {
      const seed = (outlet.id * 7 + product.id * 3 + new Date(date).getDate()) % 100;
      const dmsQty = 20 + (seed % 50);
      let posQty = dmsQty;
      let status: DiffStatus = 'matched';
      if (seed < 8) {
        posQty = dmsQty - (1 + (seed % 5));
        status = 'short';
      } else if (seed > 90) {
        posQty = dmsQty + (1 + (seed % 4));
        status = 'over';
      } else if (seed >= 75 && seed < 78 && idx % 2 === 0) {
        posQty = 0;
        status = 'missing-pos';
      } else if (seed >= 78 && seed < 81 && idx % 3 === 0) {
        posQty = dmsQty;
        status = 'missing-dms';
      }
      rows.push({
        id: id++,
        outletCode: outlet.code,
        outletName: outlet.name,
        productCode: product.code,
        productName: product.name,
        dmsQty: status === 'missing-dms' ? 0 : dmsQty,
        posQty,
        diff: posQty - (status === 'missing-dms' ? 0 : dmsQty),
        status,
      });
    });
  });
  return rows;
};

export default function ReconciliationPage() {
  const [reconDate, setReconDate] = useState(new Date().toISOString().split('T')[0]);
  const [outletFilter, setOutletFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [rows, setRows] = useState<ReconRow[]>(generateRows(new Date().toISOString().split('T')[0]));
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setRows(generateRows(reconDate));
      setCurrentPage(1);
      setIsRunning(false);
    }, 700);
  };

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (outletFilter && r.outletCode !== outletFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (searchTerm) {
        const t = searchTerm.toLowerCase();
        if (!r.productCode.toLowerCase().includes(t) && !r.productName.toLowerCase().includes(t) && !r.outletCode.toLowerCase().includes(t)) {
          return false;
        }
      }
      return true;
    });
  }, [rows, outletFilter, statusFilter, searchTerm]);

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        if (r.status !== 'matched') acc.exceptions++;
        return acc;
      },
      { matched: 0, short: 0, over: 0, 'missing-pos': 0, 'missing-dms': 0, exceptions: 0 } as Record<DiffStatus | 'exceptions', number>
    );
  }, [rows]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    { key: 'outletCode', label: 'Outlet', render: (r: ReconRow) => (
      <div>
        <Badge variant="primary" size="sm">{r.outletCode}</Badge>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{r.outletName}</p>
      </div>
    ) },
    { key: 'productCode', label: 'Product', render: (r: ReconRow) => (
      <div>
        <span className="font-mono text-xs">{r.productCode}</span>
        <p className="text-sm" style={{ color: 'var(--foreground)' }}>{r.productName}</p>
      </div>
    ) },
    { key: 'dmsQty', label: 'DMS Qty', render: (r: ReconRow) => <span className="font-medium">{r.dmsQty}</span> },
    { key: 'posQty', label: 'POS Qty', render: (r: ReconRow) => <span className="font-medium">{r.posQty}</span> },
    { key: 'diff', label: 'Difference', render: (r: ReconRow) => (
      <span className="font-bold" style={{
        color: r.diff === 0 ? '#10B981' : r.diff < 0 ? '#DC2626' : '#F59E0B',
      }}>
        {r.diff > 0 ? `+${r.diff}` : r.diff}
      </span>
    ) },
    { key: 'status', label: 'Status', render: (r: ReconRow) => (
      <Badge variant={statusMeta[r.status].variant} size="sm">{statusMeta[r.status].label}</Badge>
    ) },
    { key: 'actions', label: 'Actions', render: (r: ReconRow) => (
      <div className="flex items-center gap-1">
        <button
          className="p-1.5 rounded transition-colors"
          style={{ color: 'var(--muted-foreground)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Investigate"
        >
          <Eye className="w-4 h-4" />
        </button>
        {r.status !== 'matched' && (
          <button
            className="p-1.5 rounded transition-colors"
            style={{ color: '#10B981' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dms-success-callout)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Mark Reconciled"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
        )}
      </div>
    ) },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>DMS ↔ POS Reconciliation</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Match DMS delivery quantities against POS receipts and flag exceptions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="md">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" size="md" onClick={handleRun} disabled={isRunning}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running…' : 'Run Reconciliation'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Total Lines</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--foreground)' }}>{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-wider" style={{ color: '#10B981' }}>Matched</p>
            <p className="text-2xl font-bold mt-1" style={{ color: '#10B981' }}>{summary.matched}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-wider" style={{ color: '#DC2626' }}>Short</p>
            <p className="text-2xl font-bold mt-1" style={{ color: '#DC2626' }}>{summary.short}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-wider" style={{ color: '#F59E0B' }}>Over</p>
            <p className="text-2xl font-bold mt-1" style={{ color: '#F59E0B' }}>{summary.over}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-wider" style={{ color: '#0EA5E9' }}>Missing POS</p>
            <p className="text-2xl font-bold mt-1" style={{ color: '#0EA5E9' }}>{summary['missing-pos']}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Missing DMS</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--muted-foreground)' }}>{summary['missing-dms']}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Date"
              type="date"
              value={reconDate}
              onChange={(e) => setReconDate(e.target.value)}
              fullWidth
            />
            <Select
              label="Outlet"
              value={outletFilter}
              onChange={(e) => { setOutletFilter(e.target.value); setCurrentPage(1); }}
              options={[
                { value: '', label: 'All Outlets' },
                ...mockOutletsFull.filter(o => o.active).map(o => ({ value: o.code, label: `${o.code} — ${o.name}` })),
              ]}
              fullWidth
            />
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'matched', label: 'Matched only' },
                { value: 'short', label: 'Short Delivered' },
                { value: 'over', label: 'Over Delivered' },
                { value: 'missing-pos', label: 'Not in POS' },
                { value: 'missing-dms', label: 'Not in DMS' },
              ]}
              fullWidth
            />
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  placeholder="Outlet, product…"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
                  style={{ border: '1px solid var(--input)' }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {summary.exceptions > 0 && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--dms-error-callout)', border: '1px solid var(--dms-error-border)' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: 'var(--dms-error-text)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--dms-error-text)' }}>
                {summary.exceptions} exception{summary.exceptions !== 1 ? 's' : ''} need attention
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--dms-error-text)' }}>
                Review and resolve before approving Day-End for {new Date(reconDate).toLocaleDateString()}.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5" />
              Reconciliation Detail
              <span className="text-sm font-normal" style={{ color: 'var(--muted-foreground)' }}>
                ({filtered.length} rows)
              </span>
            </CardTitle>
            {summary.matched === rows.length && rows.length > 0 && (
              <Badge variant="success" size="md">
                <CheckCircle className="w-3 h-3 mr-1" />
                All Matched
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={paginated}
            columns={columns}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
