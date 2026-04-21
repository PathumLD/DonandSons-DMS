'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { RotateCcw, Plus, Search, Edit, Eye, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockShowrooms } from '@/lib/mock-data/showrooms';

interface DeliveryReturn {
  id: number;
  returnNo: string;
  returnDate: string;
  deliveryNo: string;
  showroomId: number;
  showroom: string;
  reason: string;
  totalItems: number;
  status: 'Draft' | 'Pending' | 'Approved' | 'Processed';
  editUser: string;
  approvedBy?: string;
}

const mockDeliveryReturns: DeliveryReturn[] = [
  { id: 1, returnNo: 'RTN-2026-001', returnDate: '2026-04-21', deliveryNo: 'DN-2026-005', showroomId: 2, showroom: 'Ragama', reason: 'Quality issues - stale products', totalItems: 8, status: 'Approved', editUser: 'cashier1', approvedBy: 'Manager' },
  { id: 2, returnNo: 'RTN-2026-002', returnDate: '2026-04-21', deliveryNo: 'DN-2026-007', showroomId: 4, showroom: 'Dehiwala', reason: 'Excess stock returned', totalItems: 5, status: 'Pending', editUser: 'cashier1' },
  { id: 3, returnNo: 'RTN-2026-003', returnDate: '2026-04-20', deliveryNo: 'DN-2026-003', showroomId: 1, showroom: 'Dalmeny', reason: 'Damaged during transportation', totalItems: 12, status: 'Processed', editUser: 'cashier1', approvedBy: 'Manager' },
];

export default function DeliveryReturnPage() {
  const [returns, setReturns] = useState<DeliveryReturn[]>(mockDeliveryReturns);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<DeliveryReturn | null>(null);
  
  const [formData, setFormData] = useState({
    returnDate: new Date().toISOString().split('T')[0],
    deliveryNo: '',
    showroomId: '',
    reason: '',
    totalItems: '',
  });

  const filteredReturns = useMemo(() => {
    return returns.filter(r => {
      const matchesSearch = 
        r.returnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.deliveryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.showroom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [returns, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredReturns.length / pageSize);
  const paginatedReturns = filteredReturns.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAdd = () => {
    const showroom = mockShowrooms.find(s => s.id === Number(formData.showroomId));
    const newReturn: DeliveryReturn = {
      id: Math.max(...returns.map(r => r.id)) + 1,
      returnNo: `RTN-2026-${String(returns.length + 1).padStart(3, '0')}`,
      returnDate: formData.returnDate,
      deliveryNo: formData.deliveryNo,
      showroomId: Number(formData.showroomId),
      showroom: showroom?.name || '',
      reason: formData.reason,
      totalItems: Number(formData.totalItems),
      status: 'Draft',
      editUser: 'cashier1',
    };
    setReturns([newReturn, ...returns]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedReturn) {
      setReturns(returns.map(r =>
        r.id === selectedReturn.id
          ? { ...r, reason: formData.reason, totalItems: Number(formData.totalItems) }
          : r
      ));
      setShowEditModal(false);
      setSelectedReturn(null);
      resetForm();
    }
  };

  const handleApprove = (id: number) => {
    setReturns(returns.map(r =>
      r.id === id ? { ...r, status: 'Approved', approvedBy: 'Manager' } : r
    ));
  };

  const resetForm = () => {
    setFormData({
      returnDate: new Date().toISOString().split('T')[0],
      deliveryNo: '',
      showroomId: '',
      reason: '',
      totalItems: '',
    });
  };

  const openEditModal = (ret: DeliveryReturn) => {
    setSelectedReturn(ret);
    setFormData({
      returnDate: ret.returnDate,
      deliveryNo: ret.deliveryNo,
      showroomId: String(ret.showroomId),
      reason: ret.reason,
      totalItems: String(ret.totalItems),
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Processed': return <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3 mr-1" />Processed</Badge>;
      case 'Approved': return <Badge variant="success" size="sm">Approved</Badge>;
      case 'Pending': return <Badge variant="warning" size="sm">Pending</Badge>;
      default: return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  const columns = [
    {
      key: 'returnDate',
      label: 'Return Date',
      render: (item: DeliveryReturn) => <span className="font-medium">{new Date(item.returnDate).toLocaleDateString()}</span>,
    },
    {
      key: 'returnNo',
      label: 'Return No',
      render: (item: DeliveryReturn) => <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>{item.returnNo}</span>,
    },
    {
      key: 'deliveryNo',
      label: 'Delivery No',
      render: (item: DeliveryReturn) => <span className="font-mono">{item.deliveryNo}</span>,
    },
    {
      key: 'showroom',
      label: 'Showroom',
    },
    {
      key: 'totalItems',
      label: 'Items',
      render: (item: DeliveryReturn) => <span className="font-semibold">{item.totalItems}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: DeliveryReturn) => getStatusBadge(item.status),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: DeliveryReturn) => (
        <div className="flex items-center space-x-2">
          <button onClick={() => { setSelectedReturn(item); setShowViewModal(true); }} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="View">
            <Eye className="w-4 h-4" />
          </button>
          {item.status === 'Draft' && (
            <button onClick={() => openEditModal(item)} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Edit">
              <Edit className="w-4 h-4" />
            </button>
          )}
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
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Delivery Return</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Manage product returns from showrooms ({filteredReturns.length} returns)</p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Return
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Return List</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} options={[{ value: '', label: 'All Status' }, { value: 'Draft', label: 'Draft' }, { value: 'Pending', label: 'Pending' }, { value: 'Approved', label: 'Approved' }, { value: 'Processed', label: 'Processed' }]} />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input type="text" placeholder="Search returns..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid #D1D5DB' }} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={paginatedReturns} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Delivery Return" size="lg">
        <div className="space-y-4">
          <Input label="Return Date" type="date" value={formData.returnDate} onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })} fullWidth required />
          <Input label="Delivery No" value={formData.deliveryNo} onChange={(e) => setFormData({ ...formData, deliveryNo: e.target.value })} placeholder="DN-2026-XXX" fullWidth required />
          <Select label="Showroom" value={formData.showroomId} onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })} options={mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))} placeholder="Select showroom" fullWidth required />
          <Input label="Total Items" type="number" value={formData.totalItems} onChange={(e) => setFormData({ ...formData, totalItems: e.target.value })} placeholder="0" fullWidth required />
          <Input label="Return Reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Reason for return..." fullWidth required />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Add Return</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedReturn(null); resetForm(); }} title="Edit Delivery Return" size="lg">
        <div className="space-y-4">
          <Input label="Return Reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} fullWidth />
          <Input label="Total Items" type="number" value={formData.totalItems} onChange={(e) => setFormData({ ...formData, totalItems: e.target.value })} fullWidth />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditModal(false); setSelectedReturn(null); resetForm(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit}>Save Changes</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedReturn(null); }} title="Return Details" size="md">
        {selectedReturn && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Return No</p><p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedReturn.returnNo}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Status</p>{getStatusBadge(selectedReturn.status)}</div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Delivery No</p><p className="text-sm" style={{ color: '#111827' }}>{selectedReturn.deliveryNo}</p></div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Showroom</p><p className="text-sm" style={{ color: '#111827' }}>{selectedReturn.showroom}</p></div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Total Items</p><p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedReturn.totalItems}</p></div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Reason</p><p className="text-sm" style={{ color: '#111827' }}>{selectedReturn.reason}</p></div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedReturn(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
