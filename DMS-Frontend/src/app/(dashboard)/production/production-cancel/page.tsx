'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { XCircle, Plus, Search, Eye, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductionCancel {
  id: number;
  cancelNo: string;
  cancelDate: string;
  productionNo: string;
  productCode: string;
  productName: string;
  plannedQty: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  editUser: string;
  approvedBy?: string;
}

const mockProductionCancels: ProductionCancel[] = [
  { id: 1, cancelNo: 'PCN-2026-001', cancelDate: '2026-04-21', productionNo: 'PRD-2026-015', productCode: 'BU15', productName: 'Chicken Bun', plannedQty: 200, reason: 'Ingredient shortage', status: 'Approved', editUser: 'prod_supervisor', approvedBy: 'Manager' },
  { id: 2, cancelNo: 'PCN-2026-002', cancelDate: '2026-04-21', productionNo: 'PRD-2026-018', productCode: 'PZ8', productName: 'Chicken Pizza Large', plannedQty: 30, reason: 'Equipment malfunction', status: 'Pending', editUser: 'prod_supervisor' },
];

export default function ProductionCancelPage() {
  const [cancels, setCancels] = useState<ProductionCancel[]>(mockProductionCancels);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCancel, setSelectedCancel] = useState<ProductionCancel | null>(null);
  
  const [formData, setFormData] = useState({
    cancelDate: new Date().toISOString().split('T')[0],
    productionNo: '',
    reason: '',
  });

  const filteredCancels = useMemo(() => {
    return cancels.filter(c => {
      const matchesSearch = 
        c.cancelNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.productionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.productCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cancels, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredCancels.length / pageSize);
  const paginatedCancels = filteredCancels.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAdd = () => {
    const newCancel: ProductionCancel = {
      id: Math.max(...cancels.map(c => c.id)) + 1,
      cancelNo: `PCN-2026-${String(cancels.length + 1).padStart(3, '0')}`,
      cancelDate: formData.cancelDate,
      productionNo: formData.productionNo,
      productCode: 'BR2',
      productName: 'Sandwich Bread Large',
      plannedQty: 500,
      reason: formData.reason,
      status: 'Pending',
      editUser: 'prod_supervisor',
    };
    setCancels([newCancel, ...cancels]);
    setShowAddModal(false);
    resetForm();
  };

  const handleApprove = (id: number) => {
    setCancels(cancels.map(c =>
      c.id === id ? { ...c, status: 'Approved', approvedBy: 'Manager' } : c
    ));
  };

  const resetForm = () => {
    setFormData({
      cancelDate: new Date().toISOString().split('T')[0],
      productionNo: '',
      reason: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge variant="success" size="sm">Approved</Badge>;
      case 'Rejected': return <Badge variant="danger" size="sm">Rejected</Badge>;
      default: return <Badge variant="warning" size="sm">Pending</Badge>;
    }
  };

  const columns = [
    {
      key: 'cancelDate',
      label: 'Cancel Date',
      render: (item: ProductionCancel) => <span className="font-medium">{new Date(item.cancelDate).toLocaleDateString()}</span>,
    },
    {
      key: 'cancelNo',
      label: 'Cancel No',
      render: (item: ProductionCancel) => <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>{item.cancelNo}</span>,
    },
    {
      key: 'productionNo',
      label: 'Production No',
      render: (item: ProductionCancel) => <span className="font-mono">{item.productionNo}</span>,
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
      key: 'plannedQty',
      label: 'Planned Qty',
      render: (item: ProductionCancel) => <span className="font-semibold">{item.plannedQty}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: ProductionCancel) => getStatusBadge(item.status),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: ProductionCancel) => (
        <div className="flex items-center space-x-2">
          <button onClick={() => { setSelectedCancel(item); setShowViewModal(true); }} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="View">
            <Eye className="w-4 h-4" />
          </button>
          {item.status === 'Pending' && (
            <button onClick={() => handleApprove(item.id)} className="p-1.5 rounded transition-colors" style={{ color: '#10B981' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FDF4'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Approve">
              <CheckCircle className="w-4 h-4" />
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
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Production Cancel</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Manage production cancellation requests ({filteredCancels.length} records)</p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />Request Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Cancel List</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} options={[{ value: '', label: 'All Status' }, { value: 'Pending', label: 'Pending' }, { value: 'Approved', label: 'Approved' }, { value: 'Rejected', label: 'Rejected' }]} />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input type="text" placeholder="Search cancellations..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid #D1D5DB' }} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={paginatedCancels} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Request Production Cancel" size="lg">
        <div className="space-y-4">
          <Input label="Cancel Date" type="date" value={formData.cancelDate} onChange={(e) => setFormData({ ...formData, cancelDate: e.target.value })} fullWidth required />
          <Input label="Production No" value={formData.productionNo} onChange={(e) => setFormData({ ...formData, productionNo: e.target.value })} placeholder="PRD-2026-XXX" fullWidth required />
          <Input label="Cancellation Reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Reason for cancellation..." fullWidth required />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Submit Request</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedCancel(null); }} title="Cancel Details" size="md">
        {selectedCancel && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Cancel No</p><p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedCancel.cancelNo}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Status</p>{getStatusBadge(selectedCancel.status)}</div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Production No</p><p className="text-sm" style={{ color: '#111827' }}>{selectedCancel.productionNo}</p></div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Product</p><p className="text-sm" style={{ color: '#111827' }}>{selectedCancel.productCode} - {selectedCancel.productName}</p></div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Planned Quantity</p><p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedCancel.plannedQty}</p></div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Reason</p><p className="text-sm" style={{ color: '#111827' }}>{selectedCancel.reason}</p></div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedCancel(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
