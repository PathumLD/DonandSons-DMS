'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Plus, Search, Edit, Eye, CheckCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockShowrooms } from '@/lib/mock-data/showrooms';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, isAdminUser, todayISO } from '@/lib/date-restrictions';

interface DeliveryReturn {
  id: number;
  returnNo: string;
  returnDate: string;
  deliveryNo: string;
  deliveredDate: string;
  showroomId: number;
  showroom: string;
  reason: string;
  totalItems: number;
  status: 'Draft' | 'Pending' | 'Approved' | 'Processed';
  editUser: string;
  editDate: string;
  approvedBy?: string;
}

const mockDeliveryReturns: DeliveryReturn[] = [
  { id: 1, returnNo: 'RET00019374', returnDate: '2026-01-10', deliveryNo: 'DN-2026-005', deliveredDate: '2026-01-09', showroomId: 1, showroom: 'DAL', reason: 'Quality issues - stale products', totalItems: 8, status: 'Approved', editUser: 'Vinj', editDate: '1/10/2026', approvedBy: 'Hilary - 1/10/2026' },
  { id: 2, returnNo: 'RET00019373', returnDate: '2026-01-10', deliveryNo: 'DN-2026-007', deliveredDate: '2026-01-09', showroomId: 2, showroom: 'DAL', reason: 'Excess stock returned', totalItems: 5, status: 'Approved', editUser: 'Vinj', editDate: '1/10/2026', approvedBy: 'Hilary - 1/10/2026' },
  { id: 3, returnNo: 'RET00019372', returnDate: '2026-01-09', deliveryNo: 'DN-2026-003', deliveredDate: '2026-01-08', showroomId: 3, showroom: 'YRK', reason: 'Damaged during transportation', totalItems: 12, status: 'Approved', editUser: 'Buddhini', editDate: '1/9/2026', approvedBy: 'Dulan - 1/10/2026' },
  { id: 4, returnNo: 'RET00019371', returnDate: '2026-01-09', deliveryNo: 'DN-2026-010', deliveredDate: '2026-01-08', showroomId: 4, showroom: 'WED', reason: 'Wrong product delivered', totalItems: 3, status: 'Approved', editUser: 'Buddhini', editDate: '1/9/2026', approvedBy: 'Hilary - 1/9/2026' },
  { id: 5, returnNo: 'RET00019370', returnDate: '2026-01-09', deliveryNo: 'DN-2026-012', deliveredDate: '2026-01-08', showroomId: 5, showroom: 'DAL', reason: 'Expired products', totalItems: 6, status: 'Approved', editUser: 'Buddhini', editDate: '1/9/2026', approvedBy: 'Hilary - 1/9/2026' },
  { id: 6, returnNo: 'RET00019369', returnDate: '2026-01-08', deliveryNo: 'DN-2026-015', deliveredDate: '2026-01-07', showroomId: 6, showroom: 'DBG', reason: 'Quality check failed', totalItems: 4, status: 'Approved', editUser: 'Vinj', editDate: '1/8/2026', approvedBy: 'Dulan - 1/8/2026' },
  { id: 7, returnNo: 'RET00019368', returnDate: '2026-01-08', deliveryNo: 'DN-2026-018', deliveredDate: '2026-01-07', showroomId: 7, showroom: 'DAL', reason: 'Packaging damaged', totalItems: 2, status: 'Approved', editUser: 'Vinj', editDate: '1/8/2026', approvedBy: 'Dulan - 1/8/2026' },
  { id: 8, returnNo: 'RET00019367', returnDate: '2026-01-08', deliveryNo: 'DN-2026-020', deliveredDate: '2026-01-07', showroomId: 8, showroom: 'BW', reason: 'Customer complaint', totalItems: 5, status: 'Approved', editUser: 'Vinj', editDate: '1/8/2026', approvedBy: 'Dulan - 1/8/2026' },
  { id: 9, returnNo: 'RET00019366', returnDate: '2026-01-08', deliveryNo: 'DN-2026-022', deliveredDate: '2026-01-07', showroomId: 9, showroom: 'BW', reason: 'Incorrect quantity', totalItems: 3, status: 'Approved', editUser: 'Vinj', editDate: '1/8/2026', approvedBy: 'Dulan - 1/8/2026' },
  { id: 10, returnNo: 'RET00019365', returnDate: '2026-01-08', deliveryNo: 'DN-2026-025', deliveredDate: '2026-01-07', showroomId: 10, showroom: 'RAG', reason: 'Late delivery', totalItems: 7, status: 'Approved', editUser: 'Vinj', editDate: '1/8/2026', approvedBy: 'Dulan - 1/8/2026' },
];

export default function DeliveryReturnPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('delivery-return'));
  const dateBounds = getDateBounds('today-only', user as any, {
    allowBackDatePermission: 'operation.delivery-return.allow-back-future',
    allowFutureDatePermission: 'operation.delivery-return.allow-back-future',
  });

  const [returns, setReturns] = useState<DeliveryReturn[]>(mockDeliveryReturns);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<DeliveryReturn | null>(null);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  
  const [formData, setFormData] = useState({
    returnDate: todayISO(),
    deliveryNo: '',
    showroomId: '',
    reason: '',
    totalItems: '',
  });

  const filteredReturns = useMemo(() => {
    const today = todayISO();
    return returns.filter(r => {
      const matchesSearch = 
        r.returnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.deliveryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.showroom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || r.status === statusFilter;
      const matchesRole =
        isAdmin ||
        (r.editUser === user?.email && (showPreviousRecords || r.returnDate === today));
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [returns, searchTerm, statusFilter, isAdmin, user, showPreviousRecords]);

  const totalPages = Math.ceil(filteredReturns.length / pageSize);
  const paginatedReturns = filteredReturns.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAdd = () => {
    const showroom = mockShowrooms.find(s => s.id === Number(formData.showroomId));
    const newReturn: DeliveryReturn = {
      id: Math.max(...returns.map(r => r.id)) + 1,
      returnNo: `RET${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      returnDate: formData.returnDate,
      deliveryNo: formData.deliveryNo,
      deliveredDate: formData.returnDate, // Assume same date or adjust as needed
      showroomId: Number(formData.showroomId),
      showroom: showroom?.code || '',
      reason: formData.reason,
      totalItems: Number(formData.totalItems),
      status: 'Draft',
      editUser: user?.email || 'cashier1',
      editDate: new Date().toLocaleDateString(),
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
    const approver = user?.email || 'Manager';
    const approvalDate = new Date().toLocaleDateString();
    setReturns(returns.map(r =>
      r.id === id ? { ...r, status: 'Approved', approvedBy: `${approver} - ${approvalDate}` } : r
    ));
  };

  const resetForm = () => {
    setFormData({
      returnDate: todayISO(),
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
      render: (item: DeliveryReturn) => <span className="font-mono font-semibold" style={{ color: pageTheme?.secondaryColor || '#EA580C' }}>{item.returnNo}</span>,
    },
    {
      key: 'showroom',
      label: 'Showroom',
      render: (item: DeliveryReturn) => <span className="font-medium">{item.showroom}</span>,
    },
    {
      key: 'deliveredDate',
      label: 'Delivered Date',
      render: (item: DeliveryReturn) => <span className="text-sm">{new Date(item.deliveredDate).toLocaleDateString()}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: DeliveryReturn) => getStatusBadge(item.status),
    },
    {
      key: 'editUser',
      label: 'Edit User',
      render: (item: DeliveryReturn) => <span className="text-sm">{item.editUser}</span>,
    },
    {
      key: 'editDate',
      label: 'Edit Date',
      render: (item: DeliveryReturn) => (
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.editDate}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: DeliveryReturn) => (
        <span className="text-sm">{item.approvedBy || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: DeliveryReturn) => (
        <div className="flex items-center space-x-2">
          <button onClick={() => { setSelectedReturn(item); setShowViewModal(true); }} className="p-1.5 rounded transition-colors" style={{ color: 'var(--muted-foreground)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="View">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Delivery Return</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Manage product returns from showrooms ({filteredReturns.length} returns)</p>
          <div className="mt-2">
            <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
              <Info className="w-3 h-3 mr-1" />
              {isAdmin
                ? 'Admin: All returns visible. Any date allowed.'
                : 'You see your own returns for today only.'}
            </Badge>
          </div>
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
          <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />Add New
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Return List</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} options={[{ value: '', label: 'All Status' }, { value: 'Draft', label: 'Draft' }, { value: 'Pending', label: 'Pending' }, { value: 'Approved', label: 'Approved' }, { value: 'Processed', label: 'Processed' }]} />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input type="text" placeholder="Search returns..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--input)' }} />
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
          <Input
            label="Return Date"
            type="date"
            value={formData.returnDate}
            onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
            min={dateBounds.min}
            max={dateBounds.max}
            helperText={dateBounds.helperText}
            fullWidth
            required
          />
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
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Return No</p><p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedReturn.returnNo}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>{getStatusBadge(selectedReturn.status)}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Return Date</p><p className="text-sm" style={{ color: 'var(--foreground)' }}>{new Date(selectedReturn.returnDate).toLocaleDateString()}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivered Date</p><p className="text-sm" style={{ color: 'var(--foreground)' }}>{new Date(selectedReturn.deliveredDate).toLocaleDateString()}</p></div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivery No</p><p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedReturn.deliveryNo}</p></div>
            <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Showroom</p><p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedReturn.showroom}</p></div>
            <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Items</p><p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedReturn.totalItems}</p></div>
            <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Reason</p><p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedReturn.reason}</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit User</p><p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedReturn.editUser}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit Date</p><p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedReturn.editDate}</p></div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved/Rejected By</p><p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedReturn.approvedBy || '-'}</p></div>
          </div>
        )}
        <ModalFooter>
          {selectedReturn?.status === 'Pending' && isAdmin && (
            <Button variant="primary" onClick={() => { handleApprove(selectedReturn.id); setShowViewModal(false); setSelectedReturn(null); }}>Approve</Button>
          )}
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedReturn(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
