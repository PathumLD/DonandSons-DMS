'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { CheckCircle, XCircle, Search, Eye } from 'lucide-react';
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
        a.editUser.toLowerCase().includes(searchTerm.toLowerCase());
      return a.status === 'Pending' && matchesSearch;
    });
  }, [adjustments, searchTerm]);

  const totalPages = Math.ceil(pendingAdjustments.length / pageSize);
  const paginatedAdjustments = pendingAdjustments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleApprove = (id: number) => {
    const approvedByText = `Vins - ${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}`;
    setAdjustments(adjustments.map(a =>
      a.id === id ? { ...a, status: 'Approved', approvedBy: approvedByText } : a
    ));
  };

  const handleReject = (id: number) => {
    const rejectedByText = `Vins - ${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}`;
    setAdjustments(adjustments.map(a =>
      a.id === id ? { ...a, status: 'Rejected', approvedBy: rejectedByText } : a
    ));
  };

  const columns = [
    {
      key: 'adjustmentDate',
      label: 'Date',
      render: (item: StockAdjustment) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.adjustmentDate.split('-').reverse().join('/')}</span>
      ),
    },
    {
      key: 'adjustmentNo',
      label: 'Display No',
      render: (item: StockAdjustment) => (
        <span className="font-semibold" style={{ color: '#C8102E' }}>
          {item.adjustmentNo}
        </span>
      ),
    },
    {
      key: 'editUser',
      label: 'Edit User',
      render: (item: StockAdjustment) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.editUser}</span>
      ),
    },
    {
      key: 'editDate',
      label: 'Edit Date',
      render: (item: StockAdjustment) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.editDate}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (item: StockAdjustment) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => { setSelectedAdjustment(item); setShowViewModal(true); }}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Production Stock BF Approval</h1>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Review and approve pending stock adjustments
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input 
                type="text" 
                placeholder="Search:" 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" 
                style={{ border: '1px solid var(--input)' }} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={paginatedAdjustments} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
        </CardContent>
      </Card>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedAdjustment(null); }} title="Stock Adjustment Details" size="md">
        {selectedAdjustment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Display No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedAdjustment.adjustmentNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                <Badge variant="warning" size="sm">Pending</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedAdjustment.adjustmentDate.split('-').reverse().join('/')}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Type</p>
                <Badge variant={selectedAdjustment.adjustmentType === 'Increase' ? 'success' : 'danger'} size="sm">
                  {selectedAdjustment.adjustmentType}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Product</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedAdjustment.productCode} - {selectedAdjustment.productName}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Quantity</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedAdjustment.quantity}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Reason</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedAdjustment.reason}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit User</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedAdjustment.editUser}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedAdjustment.editDate}</p>
              </div>
            </div>
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
