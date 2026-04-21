'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { XCircle, Plus, Search, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockShowrooms } from '@/lib/mock-data/showrooms';

interface Cancellation {
  id: number;
  cancellationNo: string;
  cancellationDate: string;
  deliveryNo: string;
  showroomId: number;
  showroom: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  editUser: string;
  approvedBy?: string;
}

const mockCancellations: Cancellation[] = [
  { id: 1, cancellationNo: 'CAN-2026-001', cancellationDate: '2026-04-21', deliveryNo: 'DN-2026-008', showroomId: 3, showroom: 'Ranala', reason: 'Incorrect delivery address', status: 'Approved', editUser: 'operator1', approvedBy: 'Manager' },
  { id: 2, cancellationNo: 'CAN-2026-002', cancellationDate: '2026-04-21', deliveryNo: 'DN-2026-012', showroomId: 5, showroom: 'Kaduwela', reason: 'Showroom closed unexpectedly', status: 'Pending', editUser: 'operator1' },
];

export default function CancellationPage() {
  const [cancellations, setCancellations] = useState<Cancellation[]>(mockCancellations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCancellation, setSelectedCancellation] = useState<Cancellation | null>(null);
  
  const [formData, setFormData] = useState({
    cancellationDate: new Date().toISOString().split('T')[0],
    deliveryNo: '',
    showroomId: '',
    reason: '',
  });

  const filteredCancellations = useMemo(() => {
    return cancellations.filter(c => {
      const matchesSearch = 
        c.cancellationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.deliveryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.showroom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cancellations, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredCancellations.length / pageSize);
  const paginatedCancellations = filteredCancellations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAdd = () => {
    const showroom = mockShowrooms.find(s => s.id === Number(formData.showroomId));
    const newCancellation: Cancellation = {
      id: Math.max(...cancellations.map(c => c.id)) + 1,
      cancellationNo: `CAN-2026-${String(cancellations.length + 1).padStart(3, '0')}`,
      cancellationDate: formData.cancellationDate,
      deliveryNo: formData.deliveryNo,
      showroomId: Number(formData.showroomId),
      showroom: showroom?.name || '',
      reason: formData.reason,
      status: 'Pending',
      editUser: 'operator1',
    };
    setCancellations([newCancellation, ...cancellations]);
    setShowAddModal(false);
    resetForm();
  };

  const handleApprove = (id: number) => {
    setCancellations(cancellations.map(c =>
      c.id === id ? { ...c, status: 'Approved', approvedBy: 'Manager' } : c
    ));
  };

  const handleReject = (id: number) => {
    setCancellations(cancellations.map(c =>
      c.id === id ? { ...c, status: 'Rejected', approvedBy: 'Manager' } : c
    ));
  };

  const resetForm = () => {
    setFormData({
      cancellationDate: new Date().toISOString().split('T')[0],
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
      render: (item: Cancellation) => <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>{item.cancellationNo}</span>,
    },
    {
      key: 'deliveryNo',
      label: 'Delivery No',
      render: (item: Cancellation) => <span className="font-mono">{item.deliveryNo}</span>,
    },
    {
      key: 'showroom',
      label: 'Showroom',
    },
    {
      key: 'reason',
      label: 'Reason',
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Cancellation) => getStatusBadge(item.status),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Cancellation) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setSelectedCancellation(item); setShowViewModal(true); }}
            className="p-1.5 rounded transition-colors"
            style={{ color: '#6B7280' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.status === 'Pending' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => handleApprove(item.id)}>Approve</Button>
              <Button variant="ghost" size="sm" onClick={() => handleReject(item.id)}>Reject</Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Delivery Cancellation</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            Manage delivery cancellation requests ({filteredCancellations.length} records)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />Request Cancellation
        </Button>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="Search cancellations..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #D1D5DB' }}
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
          <Input label="Cancellation Date" type="date" value={formData.cancellationDate} onChange={(e) => setFormData({ ...formData, cancellationDate: e.target.value })} fullWidth required />
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
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Cancellation No</p>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedCancellation.cancellationNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Status</p>
                {getStatusBadge(selectedCancellation.status)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Delivery No</p>
              <p className="text-sm" style={{ color: '#111827' }}>{selectedCancellation.deliveryNo}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Showroom</p>
              <p className="text-sm" style={{ color: '#111827' }}>{selectedCancellation.showroom}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Reason</p>
              <p className="text-sm" style={{ color: '#111827' }}>{selectedCancellation.reason}</p>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedCancellation(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
