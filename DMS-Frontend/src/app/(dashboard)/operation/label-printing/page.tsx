'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Printer, Download, Sun, Plus, Search } from 'lucide-react';
import { mockProducts } from '@/lib/mock-data/products';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { addDaysISO, getDateBounds, todayISO, isAdminUser } from '@/lib/date-restrictions';

interface LabelPrintRequest {
  id: number;
  displayNo: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  productCode: string;
  productName: string;
  labelCount: number;
  editUser: string;
  editDate: string;
  approvedBy?: string;
}

const mockLabelPrintRequests: LabelPrintRequest[] = [
  { id: 1, displayNo: 'LBL00135772', date: '2026-01-10', status: 'Approved', productCode: 'PS1', productName: 'Cake Outs', labelCount: 5, editUser: 'Kavindra Danan', editDate: '1/10/2026 4:10:30 PM', approvedBy: '-' },
  { id: 2, displayNo: 'LBL00135771', date: '2026-01-10', status: 'Approved', productCode: 'BR9', productName: 'Dinner Rolls', labelCount: 5, editUser: 'Kavindra Danan', editDate: '1/10/2026 4:09:12 PM', approvedBy: '-' },
  { id: 3, displayNo: 'LBL00135770', date: '2026-01-10', status: 'Approved', productCode: 'BC16', productName: 'Special Cake', labelCount: 5, editUser: 'Kavindra Danan', editDate: '1/10/2026 4:08:40 PM', approvedBy: '-' },
  { id: 4, displayNo: 'LBL00135769', date: '2026-01-10', status: 'Approved', productCode: 'P2', productName: 'Ribbon Cake Piece', labelCount: 6, editUser: 'Kavindra Danan', editDate: '1/10/2026 4:08:11 PM', approvedBy: '-' },
  { id: 5, displayNo: 'LBL00135768', date: '2026-01-10', status: 'Approved', productCode: 'IC7', productName: 'Chocolate Special', labelCount: 11, editUser: 'Kavindra Danan', editDate: '1/10/2026 4:07:42 PM', approvedBy: '-' },
  { id: 6, displayNo: 'LBL00135767', date: '2026-01-10', status: 'Approved', productCode: 'RO4', productName: 'Chicken Rotty', labelCount: 6, editUser: 'Kavindra Danan', editDate: '1/10/2026 12:43:59 PM', approvedBy: '-' },
  { id: 7, displayNo: 'LBL00135766', date: '2026-01-10', status: 'Approved', productCode: 'RO3', productName: 'Fish Rotty', labelCount: 6, editUser: 'Kavindra Danan', editDate: '1/10/2026 12:43:38 PM', approvedBy: '-' },
  { id: 8, displayNo: 'LBL00135765', date: '2026-01-10', status: 'Approved', productCode: 'BS0', productName: 'Coconut Cookie', labelCount: 34, editUser: 'Kavindra Danan', editDate: '1/10/2026 12:42:37 PM', approvedBy: '-' },
  { id: 9, displayNo: 'LBL00135764', date: '2026-01-11', status: 'Approved', productCode: 'BR5', productName: 'Sandwich Bread Large', labelCount: 56, editUser: 'Kavindra Danan', editDate: '1/10/2026 12:42:20 PM', approvedBy: '-' },
  { id: 10, displayNo: 'LBL00135763', date: '2026-01-11', status: 'Approved', productCode: 'BR5', productName: 'Kurakkan Stick Pack', labelCount: 29, editUser: 'Kavindra Danan', editDate: '1/10/2026 12:41:29 PM', approvedBy: '-' },
];

/**
 * 4.vii Label Printing
 *
 * Per spec:
 *  - Only products with enableLabelPrint = TRUE may be printed.
 *  - Admin sees all label-print records; other users see only their records.
 *  - Date textbox is normally restricted to Today (no back/future) for normal
 *    users.
 *  - When the SELECTED ITEM has been admin-flagged with allowFutureLabelPrint
 *    (Today+), the Date textbox MUST appear with a yellow background.
 *  - Back/Future date is only available to Admin or to a user with the
 *    `operation.label-printing.allow-back-future` permission.
 */

export default function LabelPrintingPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('label-printing'));

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '1',
    startDate: todayISO(),
    expiryDays: '7',
    priceOverride: '',
  });

  const [labelRequests] = useState<LabelPrintRequest[]>(mockLabelPrintRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);

  const labelPrintProducts = useMemo(
    () => mockProducts.filter((p) => p.active && p.enableLabelPrint),
    []
  );

  const filteredRequests = useMemo(() => {
    const today = todayISO();
    return labelRequests.filter(req => {
      const matchesSearch =
        req.displayNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        isAdmin ||
        (req.editUser === user?.email && (showPreviousRecords || req.date >= today));
      return matchesSearch && matchesRole;
    });
  }, [labelRequests, searchTerm, isAdmin, user, showPreviousRecords]);

  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge variant="success" size="sm">Approved</Badge>;
      case 'Rejected': return <Badge variant="danger" size="sm">Rejected</Badge>;
      default: return <Badge variant="warning" size="sm">Pending</Badge>;
    }
  };

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (item: LabelPrintRequest) => <span className="font-medium">{new Date(item.date).toLocaleDateString()}</span>,
    },
    {
      key: 'displayNo',
      label: 'DisplayNo',
      render: (item: LabelPrintRequest) => <span className="font-mono font-semibold" style={{ color: pageTheme?.secondaryColor || '#059669' }}>{item.displayNo}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: LabelPrintRequest) => getStatusBadge(item.status),
    },
    {
      key: 'product',
      label: 'Product',
      render: (item: LabelPrintRequest) => (
        <div>
          <div className="font-medium">{item.productName}</div>
          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.productCode}</div>
        </div>
      ),
    },
    {
      key: 'labelCount',
      label: 'Label Count',
      render: (item: LabelPrintRequest) => <span className="font-semibold">{item.labelCount}</span>,
    },
    {
      key: 'editUser',
      label: 'Edit User',
      render: (item: LabelPrintRequest) => <span className="text-sm">{item.editUser}</span>,
    },
    {
      key: 'editDate',
      label: 'Edit Date',
      render: (item: LabelPrintRequest) => (
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.editDate}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: LabelPrintRequest) => (
        <span className="text-sm">{item.approvedBy || '-'}</span>
      ),
    },
  ];

  const selectedProduct = useMemo(
    () => labelPrintProducts.find((p) => p.id === Number(formData.productId)),
    [formData.productId, labelPrintProducts]
  );

  // The product allows Today+ printing - either admin-set on the product, or
  // because the user is admin / has the bypass permission.
  const itemAllowsFuture = selectedProduct?.allowFutureLabelPrint ?? false;
  const dateBounds = getDateBounds('label-print', user as any, {
    allowBackDatePermission: 'operation.label-printing.allow-back-future',
    allowFutureDatePermission: 'operation.label-printing.allow-back-future',
  });

  // If the selected item allows Today+ AND the user is admin OR has the
  // permission, expand the date range to include the future.
  const effectiveMin = isAdmin
    ? undefined
    : itemAllowsFuture
      ? todayISO()
      : dateBounds.min;
  const effectiveMax = isAdmin
    ? undefined
    : itemAllowsFuture
      ? addDaysISO(30)
      : dateBounds.max;

  // Spec: when the selected item allows Today+, the Date textbox must be Yellow.
  const dateVariant: 'default' | 'yellow' = itemAllowsFuture ? 'yellow' : 'default';

  const handlePrint = () => {
    if (!formData.productId) return;
    if (effectiveMin && formData.startDate < effectiveMin) {
      alert(`Date must be on or after ${effectiveMin}`);
      return;
    }
    if (effectiveMax && formData.startDate > effectiveMax) {
      alert(`Date must be on or before ${effectiveMax}`);
      return;
    }
    alert(`Printing ${formData.quantity} label(s) for ${selectedProduct?.code}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Label Printing Request</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            List of label printing requests ({filteredRequests.length} requests)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {!isAdmin && (
            <Button
              variant={showPreviousRecords ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setShowPreviousRecords(!showPreviousRecords)}
            >
              {showPreviousRecords ? 'Hide Previous Records' : 'Show Previous Records'}
            </Button>
          )}
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-2" />Add New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Label Configuration</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select
                label="Product (Label-Enabled Only)"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                options={labelPrintProducts.map((p) => ({ value: p.id, label: `${p.code} - ${p.description}${p.allowFutureLabelPrint ? ' [Today+]' : ''}` }))}
                placeholder="Select product"
                helperText={`${labelPrintProducts.length} label-enabled products available`}
                fullWidth
                required
              />

              <Input
                label="Quantity (Number of Labels)"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="1"
                fullWidth
                required
              />

              <div>
                <Input
                  label="Production / Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={effectiveMin}
                  max={effectiveMax}
                  variant={dateVariant}
                  helperText={
                    itemAllowsFuture
                      ? 'Highlighted in yellow: this item is approved for Today+ label printing.'
                      : dateBounds.helperText
                  }
                  fullWidth
                  required
                />
                {itemAllowsFuture && (
                  <div className="mt-2 inline-flex items-center gap-1.5">
                    <Badge variant="warning" size="sm">
                      <Sun className="w-3 h-3 mr-1" /> Today+ enabled by Admin
                    </Badge>
                  </div>
                )}
              </div>

              <Input
                label="Expiry Days (from start date)"
                type="number"
                min="1"
                value={formData.expiryDays}
                onChange={(e) => setFormData({ ...formData, expiryDays: e.target.value })}
                placeholder="7"
                helperText="Number of days until product expires"
                fullWidth
                required
              />

              <Input
                label="Price Override (Optional)"
                type="number"
                step="0.01"
                value={formData.priceOverride}
                onChange={(e) => setFormData({ ...formData, priceOverride: e.target.value })}
                placeholder="Leave empty to use default price"
                helperText="Override the default product price"
                fullWidth
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Label Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8" style={{ borderColor: 'var(--input)' }}>
              <div className="text-center space-y-4">
                {selectedProduct ? (
                  <>
                    <div className="p-6 bg-white rounded-lg shadow-md" style={{ border: '2px solid #C8102E' }}>
                      <div className="text-center space-y-2">
                        <div className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>DON & SONS</div>
                        <div className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                          {selectedProduct.description}
                        </div>
                        <div className="text-sm font-mono" style={{ color: 'var(--muted-foreground)' }}>
                          {selectedProduct.code}
                        </div>
                        <div className="text-2xl font-bold" style={{ color: '#C8102E' }}>
                          Rs. {Number(formData.priceOverride || selectedProduct.unitPrice).toFixed(2)}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          Mfg: {new Date(formData.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          Exp: {new Date(new Date(formData.startDate).getTime() + Number(formData.expiryDays) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>This is a preview of how the label will appear</p>
                  </>
                ) : (
                  <div className="py-12">
                    <Printer className="w-16 h-16 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Select a product to preview the label</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button variant="primary" size="md" onClick={handlePrint} disabled={!formData.productId} fullWidth>
                <Printer className="w-4 h-4 mr-2" />Print Labels
              </Button>
              <Button variant="secondary" size="md" disabled={!formData.productId} fullWidth>
                <Download className="w-4 h-4 mr-2" />Download as PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Label Printing Request List</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                style={{ border: '1px solid var(--input)' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={paginatedRequests}
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
