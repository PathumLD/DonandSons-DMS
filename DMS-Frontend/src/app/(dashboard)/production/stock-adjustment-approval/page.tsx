'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { CheckCircle, XCircle, Search, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockStockAdjustments, type StockAdjustment } from '@/lib/mock-data/production';

export default function StockAdjustmentApprovalPage() {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(mockStockAdjustments);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<StockAdjustment | null>(null);

  const pendingAdjustments = useMemo(() => {
    return adjustments.filter(a => {
      const matchesSearch = 
        a.adjustmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.productCode.toLowerCase().includes(searchTerm.toLowerCase());
      return a.status === 'Pending' && matchesSearch;
    });
  }, [adjustments, searchTerm]);

  const totalPages = Math.ceil(pendingAdjustments.length / pageSize);
  const paginatedAdjustments = pendingAdjustments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleApprove = (id: number) => {
    setAdjustments(adjustments.map(a =>
      a.id === id ? { ...a, status: 'Approved', approvedBy: 'Manager' } : a
    ));
  };

  const handleReject = (id: number) => {
    setAdjustments(adjustments.map(a =>
      a.id === id ? { ...a, status: 'Rejected', approvedBy: 'Manager' } : a
    ));
  };

  const columns = [
    {
      key: 'adjustmentDate',
      label: 'Date',
      render: (item: StockAdjustment) => <span className="font-medium">{new Date(item.adjustmentDate).toLocaleDateString()}</span>,
    },
    {
      key: 'adjustmentNo',
      label: 'Adjustment No',
      render: (item: StockAdjustment) => <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>{item.adjustmentNo}</span>,
    },
    {
      key: 'productCode',
      label: 'Product',
      render: (item: StockAdjustment) => <span>{item.productCode} - {item.productName}</span>,
    },
    {
      key: 'adjustmentType',
      label: 'Type',
      render: (item: StockAdjustment) => (
        <Badge variant={item.adjustmentType === 'Increase' ? 'success' : 'danger'} size="sm">
          {item.adjustmentType === 'Increase' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {item.adjustmentType}
        </Badge>
      ),
    },
    {
      key: 'quantity',
      label: 'Qty',
      render: (item: StockAdjustment) => <span className="font-semibold">{item.quantity}</span>,
    },
    {
      key: 'editUser',
      label: 'Requested By',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: StockAdjustment) => (
        <div className="flex items-center space-x-2">
          <button onClick={() => { setSelectedAdjustment(item); setShowViewModal(true); }} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="View"><Eye className="w-4 h-4" /></button>
          <button onClick={() => handleApprove(item.id)} className="p-1.5 rounded transition-colors" style={{ color: '#10B981' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FDF4'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Approve"><CheckCircle className="w-4 h-4" /></button>
          <button onClick={() => handleReject(item.id)} className="p-1.5 rounded transition-colors" style={{ color: '#DC2626' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Reject"><XCircle className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Stock Adjustment Approval</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>Review and approve stock adjustment requests ({pendingAdjustments.length} pending)</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Pending Approvals</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
              <input type="text" placeholder="Search adjustments..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid #D1D5DB' }} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={paginatedAdjustments} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
        </CardContent>
      </Card>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedAdjustment(null); }} title="Adjustment Details" size="md">
        {selectedAdjustment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Adjustment No</p><p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedAdjustment.adjustmentNo}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Date</p><p className="text-sm" style={{ color: '#111827' }}>{new Date(selectedAdjustment.adjustmentDate).toLocaleDateString()}</p></div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Product</p><p className="text-sm" style={{ color: '#111827' }}>{selectedAdjustment.productCode} - {selectedAdjustment.productName}</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Type</p><Badge variant={selectedAdjustment.adjustmentType === 'Increase' ? 'success' : 'danger'} size="sm">{selectedAdjustment.adjustmentType}</Badge></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Quantity</p><p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedAdjustment.quantity}</p></div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Reason</p><p className="text-sm" style={{ color: '#111827' }}>{selectedAdjustment.reason}</p></div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Requested By</p><p className="text-sm" style={{ color: '#111827' }}>{selectedAdjustment.editUser}</p></div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedAdjustment(null); }}>Close</Button>
          {selectedAdjustment && (
            <>
              <Button variant="danger" onClick={() => { handleReject(selectedAdjustment.id); setShowViewModal(false); setSelectedAdjustment(null); }}>
                <XCircle className="w-4 h-4 mr-2" />Reject
              </Button>
              <Button variant="primary" onClick={() => { handleApprove(selectedAdjustment.id); setShowViewModal(false); setSelectedAdjustment(null); }}>
                <CheckCircle className="w-4 h-4 mr-2" />Approve
              </Button>
            </>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}
