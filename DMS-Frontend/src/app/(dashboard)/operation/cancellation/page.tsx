'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Plus, Search, Eye, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockShowrooms } from '@/lib/mock-data/showrooms';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, isAdminUser, todayISO, addDaysISO } from '@/lib/date-restrictions';

interface Cancellation {
  id: number;
  cancellationNo: string;
  cancellationDate: string;
  deliveryNo: string;
  deliveredDate: string;
  showroomId: number;
  showroom: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  editUser: string;
  editDate: string;
  approvedBy?: string;
}

const mockCancellations: Cancellation[] = [
  { id: 1, cancellationNo: 'DCN00033672', cancellationDate: '2026-01-10', deliveryNo: 'DN-2026-008', deliveredDate: '2026-01-09', showroomId: 1, showroom: 'SLE', reason: 'Incorrect delivery address', status: 'Approved', editUser: 'Vinj', editDate: '1/10/2026', approvedBy: 'Hilary - 1/10/2026' },
  { id: 2, cancellationNo: 'DCN00033671', cancellationDate: '2026-01-10', deliveryNo: 'DN-2026-012', deliveredDate: '2026-01-09', showroomId: 2, showroom: 'KML', reason: 'Showroom closed unexpectedly', status: 'Approved', editUser: 'Vinj', editDate: '1/10/2026', approvedBy: 'Hilary - 1/10/2026' },
  { id: 3, cancellationNo: 'DCN00033670', cancellationDate: '2026-01-10', deliveryNo: 'DN-2026-015', deliveredDate: '2026-01-09', showroomId: 3, showroom: 'RAN', reason: 'Customer request', status: 'Approved', editUser: 'Vinj', editDate: '1/10/2026', approvedBy: 'Hilary - 1/10/2026' },
  { id: 4, cancellationNo: 'DCN00033669', cancellationDate: '2026-01-10', deliveryNo: 'DN-2026-018', deliveredDate: '2026-01-09', showroomId: 4, showroom: 'RAG', reason: 'Quality issue', status: 'Approved', editUser: 'Vinj', editDate: '1/10/2026', approvedBy: 'Hilary - 1/10/2026' },
  { id: 5, cancellationNo: 'DCN00033668', cancellationDate: '2026-01-10', deliveryNo: 'DN-2026-020', deliveredDate: '2026-01-09', showroomId: 5, showroom: 'KAD', reason: 'Wrong product', status: 'Approved', editUser: 'Vinj', editDate: '1/10/2026', approvedBy: 'Hilary - 1/10/2026' },
  { id: 6, cancellationNo: 'DCN00033667', cancellationDate: '2026-01-10', deliveryNo: 'DN-2026-022', deliveredDate: '2026-01-09', showroomId: 6, showroom: 'KEL', reason: 'Late delivery', status: 'Approved', editUser: 'Vinj', editDate: '1/10/2026', approvedBy: 'Hilary - 1/10/2026' },
  { id: 7, cancellationNo: 'DCN00033666', cancellationDate: '2026-01-10', deliveryNo: 'DN-2026-025', deliveredDate: '2026-01-09', showroomId: 7, showroom: 'BC', reason: 'Duplicate order', status: 'Approved', editUser: 'Vinj', editDate: '1/10/2026', approvedBy: 'Hilary - 1/10/2026' },
  { id: 8, cancellationNo: 'DCN00033665', cancellationDate: '2026-01-10', deliveryNo: 'DN-2026-028', deliveredDate: '2026-01-09', showroomId: 8, showroom: 'DAL', reason: 'Inventory adjustment', status: 'Approved', editUser: 'Vinj', editDate: '1/10/2026', approvedBy: 'Hilary - 1/10/2026' },
  { id: 9, cancellationNo: 'DCN00033664', cancellationDate: '2026-01-10', deliveryNo: 'DN-2026-030', deliveredDate: '2026-01-09', showroomId: 9, showroom: 'WED', reason: 'System error', status: 'Approved', editUser: 'Vinj', editDate: '1/10/2026', approvedBy: 'Hilary - 1/10/2026' },
  { id: 10, cancellationNo: 'DCN00033663', cancellationDate: '2026-01-08', deliveryNo: 'DN-2026-032', deliveredDate: '2026-01-08', showroomId: 10, showroom: 'DAL', reason: 'Address correction', status: 'Approved', editUser: 'Buddhini', editDate: '1/9/2026', approvedBy: 'Hilary - 1/9/2026' },
];

export default function CancellationPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('cancellation'));
  const dateBounds = getDateBounds('back-3-no-future', user as any, {
    allowBackDatePermission: 'operation.cancellation.allow-back-future',
    allowFutureDatePermission: 'operation.cancellation.allow-back-future',
  });

  const [cancellations, setCancellations] = useState<Cancellation[]>(mockCancellations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCancellation, setSelectedCancellation] = useState<Cancellation | null>(null);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  
  const [formData, setFormData] = useState({
    cancellationDate: todayISO(),
    deliveryNo: '',
    showroomId: '',
    reason: '',
  });

  const filteredCancellations = useMemo(() => {
    const minDate = dateBounds.min || addDaysISO(-3);
    return cancellations.filter(c => {
      const matchesSearch =
        c.cancellationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.deliveryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.showroom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || c.status === statusFilter;
      const matchesRole =
        isAdmin ||
        (c.editUser === user?.email && (showPreviousRecords || c.cancellationDate >= minDate));
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [cancellations, searchTerm, statusFilter, isAdmin, user, showPreviousRecords, dateBounds]);

  const totalPages = Math.ceil(filteredCancellations.length / pageSize);
  const paginatedCancellations = filteredCancellations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAdd = () => {
    const showroom = mockShowrooms.find(s => s.id === Number(formData.showroomId));
    const newCancellation: Cancellation = {
      id: Math.max(...cancellations.map(c => c.id)) + 1,
      cancellationNo: `DCN${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      cancellationDate: formData.cancellationDate,
      deliveryNo: formData.deliveryNo,
      deliveredDate: formData.cancellationDate, // Assume same date or adjust as needed
      showroomId: Number(formData.showroomId),
      showroom: showroom?.code || '',
      reason: formData.reason,
      status: 'Pending',
      editUser: user?.email || 'operator1',
      editDate: new Date().toLocaleDateString(),
    };
    setCancellations([newCancellation, ...cancellations]);
    setShowAddModal(false);
    resetForm();
  };

  const handleApprove = (id: number) => {
    const approver = user?.email || 'Manager';
    const approvalDate = new Date().toLocaleDateString();
    setCancellations(cancellations.map(c =>
      c.id === id ? { ...c, status: 'Approved', approvedBy: `${approver} - ${approvalDate}` } : c
    ));
  };

  const handleReject = (id: number) => {
    const approver = user?.email || 'Manager';
    const approvalDate = new Date().toLocaleDateString();
    setCancellations(cancellations.map(c =>
      c.id === id ? { ...c, status: 'Rejected', approvedBy: `${approver} - ${approvalDate}` } : c
    ));
  };

  const resetForm = () => {
    setFormData({
      cancellationDate: todayISO(),
      deliveryNo: '',
      showroomId: '',
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
      key: 'cancellationDate',
      label: 'Cancellation Date',
      render: (item: Cancellation) => <span className="font-medium">{new Date(item.cancellationDate).toLocaleDateString()}</span>,
    },
    {
      key: 'cancellationNo',
      label: 'Cancellation No',
      render: (item: Cancellation) => <span className="font-mono font-semibold" style={{ color: pageTheme?.secondaryColor || '#DC2626' }}>{item.cancellationNo}</span>,
    },
    {
      key: 'showroom',
      label: 'Showroom',
      render: (item: Cancellation) => <span className="font-medium">{item.showroom}</span>,
    },
    {
      key: 'deliveredDate',
      label: 'Delivered Date',
      render: (item: Cancellation) => <span className="text-sm">{new Date(item.deliveredDate).toLocaleDateString()}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Cancellation) => getStatusBadge(item.status),
    },
    {
      key: 'editUser',
      label: 'Edit User',
      render: (item: Cancellation) => <span className="text-sm">{item.editUser}</span>,
    },
    {
      key: 'editDate',
      label: 'Edit Date',
      render: (item: Cancellation) => (
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.editDate}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: Cancellation) => (
        <span className="text-sm">{item.approvedBy || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Cancellation) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setSelectedCancellation(item); setShowViewModal(true); }}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Delivery Cancellation</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage delivery cancellation requests ({filteredCancellations.length} records)
          </p>
          <div className="mt-2">
            <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
              <Info className="w-3 h-3 mr-1" />
              {isAdmin
                ? 'Admin: All cancellations visible. Any date allowed.'
                : 'You see your own cancellations. Back date up to 3 days, no future date.'}
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
            <CardTitle>Cancellation List</CardTitle>
            <div className="flex items-center space-x-3">
              <Select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Rejected', label: 'Rejected' },
                ]}
              />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  placeholder="Search cancellations..."
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
          <DataTable
            data={paginatedCancellations}
            columns={columns}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Request Cancellation" size="lg">
        <div className="space-y-4">
          <Input
            label="Cancellation Date"
            type="date"
            value={formData.cancellationDate}
            onChange={(e) => setFormData({ ...formData, cancellationDate: e.target.value })}
            min={dateBounds.min}
            max={dateBounds.max}
            helperText={dateBounds.helperText}
            fullWidth
            required
          />
          <Input label="Delivery No" value={formData.deliveryNo} onChange={(e) => setFormData({ ...formData, deliveryNo: e.target.value })} placeholder="DN-2026-XXX" fullWidth required />
          <Select label="Showroom" value={formData.showroomId} onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })} options={mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))} placeholder="Select showroom" fullWidth required />
          <Input label="Cancellation Reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Reason for cancellation..." fullWidth required />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Submit Request</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedCancellation(null); }} title="Cancellation Details" size="md">
        {selectedCancellation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Cancellation No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedCancellation.cancellationNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedCancellation.status)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Cancellation Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{new Date(selectedCancellation.cancellationDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivered Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{new Date(selectedCancellation.deliveredDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivery No</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedCancellation.deliveryNo}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Showroom</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedCancellation.showroom}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Reason</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedCancellation.reason}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit User</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedCancellation.editUser}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedCancellation.editDate}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved/Rejected By</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedCancellation.approvedBy || '-'}</p>
            </div>
          </div>
        )}
        <ModalFooter>
          {selectedCancellation?.status === 'Pending' && isAdmin && (
            <>
              <Button variant="success" onClick={() => { handleApprove(selectedCancellation.id); setShowViewModal(false); setSelectedCancellation(null); }}>Approve</Button>
              <Button variant="danger" onClick={() => { handleReject(selectedCancellation.id); setShowViewModal(false); setSelectedCancellation(null); }}>Reject</Button>
            </>
          )}
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedCancellation(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
