'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { TrendingUp, TrendingDown, Plus, Search, Edit, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockStockAdjustments, type StockAdjustment } from '@/lib/mock-data/production';
import { mockProducts } from '@/lib/mock-data/products';

export default function StockAdjustmentPage() {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(mockStockAdjustments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<StockAdjustment | null>(null);
  
  const [formData, setFormData] = useState({
    adjustmentDate: new Date().toISOString().split('T')[0],
    productId: '',
    adjustmentType: 'Increase' as const,
    quantity: '',
    reason: '',
  });

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(a => {
      const matchesSearch = 
        a.adjustmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.productCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [adjustments, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredAdjustments.length / pageSize);
  const paginatedAdjustments = filteredAdjustments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAdd = () => {
    const product = mockProducts.find(p => p.id === Number(formData.productId));
    const newAdjustment: StockAdjustment = {
      id: Math.max(...adjustments.map(a => a.id)) + 1,
      adjustmentNo: `ADJ-2026-${String(adjustments.length + 1).padStart(3, '0')}`,
      adjustmentDate: formData.adjustmentDate,
      productId: Number(formData.productId),
      productCode: product?.code || '',
      productName: product?.description || '',
      adjustmentType: formData.adjustmentType,
      quantity: Number(formData.quantity),
      reason: formData.reason,
      status: 'Draft',
      editUser: 'inventory_clerk',
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
      label: 'Adjustment Date',
      render: (item: StockAdjustment) => <span className="font-medium">{new Date(item.adjustmentDate).toLocaleDateString()}</span>,
    },
    {
      key: 'adjustmentNo',
      label: 'Adjustment No',
      render: (item: StockAdjustment) => <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>{item.adjustmentNo}</span>,
    },
    {
      key: 'productCode',
      label: 'Product Code',
    },
    {
      key: 'productName',
      label: 'Product Name',
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
      label: 'Quantity',
      render: (item: StockAdjustment) => <span className="font-semibold">{item.quantity}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: StockAdjustment) => getStatusBadge(item.status),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: StockAdjustment) => (
        <div className="flex items-center space-x-2">
          <button onClick={() => { setSelectedAdjustment(item); setShowViewModal(true); }} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="View"><Eye className="w-4 h-4" /></button>
          {item.status === 'Draft' && (
            <button onClick={() => openEditModal(item)} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Edit"><Edit className="w-4 h-4" /></button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Stock Adjustment</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Adjust inventory stock levels ({filteredAdjustments.length} adjustments)</p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Adjustment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Adjustment List</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} options={[{ value: '', label: 'All Status' }, { value: 'Draft', label: 'Draft' }, { value: 'Pending', label: 'Pending' }, { value: 'Approved', label: 'Approved' }, { value: 'Rejected', label: 'Rejected' }]} />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input type="text" placeholder="Search adjustments..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid #D1D5DB' }} />
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

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedAdjustment(null); }} title="Adjustment Details" size="md">
        {selectedAdjustment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Adjustment No</p><p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedAdjustment.adjustmentNo}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Status</p>{getStatusBadge(selectedAdjustment.status)}</div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Product</p><p className="text-sm" style={{ color: '#111827' }}>{selectedAdjustment.productCode} - {selectedAdjustment.productName}</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Type</p><Badge variant={selectedAdjustment.adjustmentType === 'Increase' ? 'success' : 'danger'} size="sm">{selectedAdjustment.adjustmentType}</Badge></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Quantity</p><p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedAdjustment.quantity}</p></div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Reason</p><p className="text-sm" style={{ color: '#111827' }}>{selectedAdjustment.reason}</p></div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedAdjustment(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
