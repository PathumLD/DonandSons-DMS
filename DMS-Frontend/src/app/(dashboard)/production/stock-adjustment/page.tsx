'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Plus, Search, Edit, Eye, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockStockAdjustments, type StockAdjustment } from '@/lib/mock-data/production';
import { mockProducts } from '@/lib/mock-data/products';
import { useAuthStore } from '@/lib/stores/auth-store';
import { isAdminUser, addDaysISO } from '@/lib/date-restrictions';

export default function StockAdjustmentPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(mockStockAdjustments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<StockAdjustment | null>(null);
  
  const [formData, setFormData] = useState({
    adjustmentDate: new Date().toISOString().split('T')[0],
    productId: '',
    adjustmentType: 'Increase' as StockAdjustment['adjustmentType'],
    quantity: '',
    reason: '',
  });

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(a => {
      const matchesSearch = 
        a.adjustmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.editUser.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || a.status === statusFilter;
      
      // Admin sees all. Non-admin users see their own records.
      if (isAdmin) {
        return matchesSearch && matchesStatus;
      }
      
      // For non-admin users, filter by date range (3 days back if not showing previous records)
      const matchesUser = a.editUser === user?.username || a.editUser === user?.email;
      if (!matchesUser) return false;
      
      if (!showPreviousRecords) {
        // Show only records from the last 3 days
        const threeDaysAgo = addDaysISO(-3);
        const matchesDate = a.adjustmentDate >= threeDaysAgo;
        return matchesSearch && matchesStatus && matchesDate;
      }
      
      return matchesSearch && matchesStatus;
    });
  }, [adjustments, searchTerm, statusFilter, isAdmin, user, showPreviousRecords]);

  const totalPages = Math.ceil(filteredAdjustments.length / pageSize);
  const paginatedAdjustments = filteredAdjustments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAdd = () => {
    const product = mockProducts.find(p => p.id === Number(formData.productId));
    const maxId = Math.max(...adjustments.map(a => a.id), 0);
    const newAdjustment: StockAdjustment = {
      id: maxId + 1,
      adjustmentNo: `PSA${String(1875 + maxId).padStart(7, '0')}`,
      adjustmentDate: formData.adjustmentDate,
      productId: Number(formData.productId),
      productCode: product?.code || '',
      productName: product?.description || '',
      adjustmentType: formData.adjustmentType,
      quantity: Number(formData.quantity),
      reason: formData.reason,
      status: 'Pending',
      editUser: user?.username || 'Unknown',
      editDate: new Date().toLocaleString('en-US', { 
        month: '1-digit', 
        day: '1-digit', 
        year: 'numeric', 
        hour: '1-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      }),
      approvedBy: undefined,
    };
    setAdjustments([newAdjustment, ...adjustments]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedAdjustment) {
      setAdjustments(adjustments.map(a =>
        a.id === selectedAdjustment.id
          ? { ...a, quantity: Number(formData.quantity), reason: formData.reason }
          : a
      ));
      setShowEditModal(false);
      setSelectedAdjustment(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      adjustmentDate: new Date().toISOString().split('T')[0],
      productId: '',
      adjustmentType: 'Increase',
      quantity: '',
      reason: '',
    });
  };

  const openEditModal = (adjustment: StockAdjustment) => {
    setSelectedAdjustment(adjustment);
    setFormData({
      adjustmentDate: adjustment.adjustmentDate,
      productId: String(adjustment.productId),
      adjustmentType: adjustment.adjustmentType,
      quantity: String(adjustment.quantity),
      reason: adjustment.reason,
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge variant="success" size="sm">Approved</Badge>;
      case 'Rejected': return <Badge variant="danger" size="sm">Rejected</Badge>;
      case 'Pending': return <Badge variant="warning" size="sm">Pending</Badge>;
      default: return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
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
      key: 'status',
      label: 'Status',
      render: (item: StockAdjustment) => getStatusBadge(item.status),
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
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: StockAdjustment) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.approvedBy || '-'}</span>
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
          {item.status === 'Pending' && (
            <button
              onClick={() => openEditModal(item)}
              className="p-1.5 rounded-full transition-colors"
              style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Production Stock BF</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            History Production Stock
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isAdmin && (
            <Button 
              variant="ghost" 
              size="md" 
              onClick={() => setShowPreviousRecords(!showPreviousRecords)}
            >
              <History className="w-4 h-4 mr-2" />
              Show Previous Records
            </Button>
          )}
          <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAdjustments.length)} of {filteredAdjustments.length} entries
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
                options={[
                  { value: '', label: 'All Status' }, 
                  { value: 'Draft', label: 'Draft' }, 
                  { value: 'Pending', label: 'Pending' }, 
                  { value: 'Approved', label: 'Approved' }, 
                  { value: 'Rejected', label: 'Rejected' }
                ]} 
              />
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={paginatedAdjustments} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Stock Adjustment" size="lg">
        <div className="space-y-4">
          <Input label="Adjustment Date" type="date" value={formData.adjustmentDate} onChange={(e) => setFormData({ ...formData, adjustmentDate: e.target.value })} fullWidth required />
          <Select label="Product" value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} options={mockProducts.filter(p => p.active).map(p => ({ value: p.id, label: `${p.code} - ${p.description}` }))} placeholder="Select product" fullWidth required />
          <Select label="Adjustment Type" value={formData.adjustmentType} onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value as any })} options={[{ value: 'Increase', label: 'Increase Stock' }, { value: 'Decrease', label: 'Decrease Stock' }]} fullWidth required />
          <Input label="Quantity" type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="0" fullWidth required />
          <Input label="Reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Reason for adjustment..." fullWidth required />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Add Adjustment</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedAdjustment(null); resetForm(); }} title="Edit Stock Adjustment" size="lg">
        <div className="space-y-4">
          <Input label="Quantity" type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} fullWidth />
          <Input label="Reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} fullWidth />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditModal(false); setSelectedAdjustment(null); resetForm(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit}>Save Changes</Button>
        </ModalFooter>
      </Modal>

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
                {getStatusBadge(selectedAdjustment.status)}
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
            {selectedAdjustment.approvedBy && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved/Rejected By</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedAdjustment.approvedBy}</p>
              </div>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedAdjustment(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
