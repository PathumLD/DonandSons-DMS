'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { ArrowRightLeft, Plus, Search, Edit, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockTransfers, type Transfer } from '@/lib/mock-data/operations';
import { mockShowrooms } from '@/lib/mock-data/showrooms';

export default function TransferPage() {
  const [transfers, setTransfers] = useState<Transfer[]>(mockTransfers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  
  const [formData, setFormData] = useState({
    transferDate: new Date().toISOString().split('T')[0],
    fromShowroomId: '',
    toShowroomId: '',
    notes: '',
    status: 'Draft' as const,
  });

  const filteredTransfers = useMemo(() => {
    return transfers.filter(t => {
      const matchesSearch = 
        t.transferNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.fromShowroom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.toShowroom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transfers, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredTransfers.length / pageSize);
  const paginatedTransfers = filteredTransfers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddTransfer = () => {
    const newTransfer: Transfer = {
      id: Math.max(...transfers.map(t => t.id)) + 1,
      transferNo: `TR-2026-${String(transfers.length + 1).padStart(3, '0')}`,
      transferDate: formData.transferDate,
      fromShowroomId: Number(formData.fromShowroomId),
      fromShowroom: mockShowrooms.find(s => s.id === Number(formData.fromShowroomId))?.name || '',
      toShowroomId: Number(formData.toShowroomId),
      toShowroom: mockShowrooms.find(s => s.id === Number(formData.toShowroomId))?.name || '',
      status: formData.status,
      totalItems: 0,
      editUser: 'operator1',
      editDate: new Date().toLocaleString(),
      notes: formData.notes,
    };
    setTransfers([newTransfer, ...transfers]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditTransfer = () => {
    if (selectedTransfer) {
      setTransfers(transfers.map(t =>
        t.id === selectedTransfer.id
          ? {
              ...t,
              transferDate: formData.transferDate,
              fromShowroomId: Number(formData.fromShowroomId),
              fromShowroom: mockShowrooms.find(s => s.id === Number(formData.fromShowroomId))?.name || '',
              toShowroomId: Number(formData.toShowroomId),
              toShowroom: mockShowrooms.find(s => s.id === Number(formData.toShowroomId))?.name || '',
              notes: formData.notes,
              editDate: new Date().toLocaleString(),
            }
          : t
      ));
      setShowEditModal(false);
      setSelectedTransfer(null);
      resetForm();
    }
  };

  const handleApprove = (id: number) => {
    setTransfers(transfers.map(t =>
      t.id === id ? { ...t, status: 'Approved', approvedBy: 'Manager' } : t
    ));
  };

  const handleComplete = (id: number) => {
    setTransfers(transfers.map(t =>
      t.id === id ? { ...t, status: 'Completed' } : t
    ));
  };

  const resetForm = () => {
    setFormData({
      transferDate: new Date().toISOString().split('T')[0],
      fromShowroomId: '',
      toShowroomId: '',
      notes: '',
      status: 'Draft',
    });
  };

  const openEditModal = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setFormData({
      transferDate: transfer.transferDate,
      fromShowroomId: String(transfer.fromShowroomId),
      toShowroomId: String(transfer.toShowroomId),
      notes: transfer.notes || '',
      status: transfer.status,
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'Approved':
        return <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'Rejected':
        return <Badge variant="danger" size="sm"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'Pending':
        return <Badge variant="warning" size="sm"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  const columns = [
    {
      key: 'transferDate',
      label: 'Transfer Date',
      render: (item: Transfer) => (
        <span className="font-medium">{new Date(item.transferDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'transferNo',
      label: 'Transfer No',
      render: (item: Transfer) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.transferNo}
        </span>
      ),
    },
    {
      key: 'fromShowroom',
      label: 'From Showroom',
      render: (item: Transfer) => (
        <span className="font-medium">{item.fromShowroom}</span>
      ),
    },
    {
      key: 'toShowroom',
      label: 'To Showroom',
      render: (item: Transfer) => (
        <span className="font-medium">{item.toShowroom}</span>
      ),
    },
    {
      key: 'totalItems',
      label: 'Items',
      render: (item: Transfer) => (
        <span className="font-semibold">{item.totalItems}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Transfer) => getStatusBadge(item.status),
    },
    {
      key: 'editUser',
      label: 'Edit User',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Transfer) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedTransfer(item);
              setShowViewModal(true);
            }}
            className="p-1.5 rounded transition-colors"
            style={{ color: '#6B7280' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.status === 'Draft' && (
            <button
              onClick={() => openEditModal(item)}
              className="p-1.5 rounded transition-colors"
              style={{ color: '#6B7280' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {item.status === 'Pending' && (
            <button
              onClick={() => handleApprove(item.id)}
              className="p-1.5 rounded transition-colors"
              style={{ color: '#10B981' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FDF4'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {item.status === 'Approved' && (
            <button
              onClick={() => handleComplete(item.id)}
              className="p-1.5 rounded transition-colors"
              style={{ color: '#8B5CF6' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F3FF'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Mark as Completed"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const renderTransferForm = () => (
    <div className="space-y-4">
      <Input
        label="Transfer Date"
        type="date"
        value={formData.transferDate}
        onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
        fullWidth
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="From Showroom"
          value={formData.fromShowroomId}
          onChange={(e) => setFormData({ ...formData, fromShowroomId: e.target.value })}
          options={mockShowrooms.filter(s => s.active && s.id !== Number(formData.toShowroomId)).map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
          placeholder="Select source showroom"
          fullWidth
          required
        />
        <Select
          label="To Showroom"
          value={formData.toShowroomId}
          onChange={(e) => setFormData({ ...formData, toShowroomId: e.target.value })}
          options={mockShowrooms.filter(s => s.active && s.id !== Number(formData.fromShowroomId)).map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
          placeholder="Select destination showroom"
          fullWidth
          required
        />
      </div>
      <Input
        label="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        placeholder="Additional notes..."
        fullWidth
      />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Stock Transfer</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            Transfer products between showrooms ({filteredTransfers.length} transfers)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transfer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Transfer List</CardTitle>
            <div className="flex items-center space-x-3">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Completed', label: 'Completed' },
                ]}
              />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="Search transfers..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #D1D5DB' }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={paginatedTransfers}
            columns={columns}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Transfer"
        size="lg"
      >
        {renderTransferForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddTransfer}>
            <Plus className="w-4 h-4 mr-2" />Create Transfer
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTransfer(null);
          resetForm();
        }}
        title="Edit Transfer"
        size="lg"
      >
        {renderTransferForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedTransfer(null);
            resetForm();
          }}>Cancel</Button>
          <Button variant="primary" onClick={handleEditTransfer}>Save Changes</Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedTransfer(null);
        }}
        title="Transfer Details"
        size="md"
      >
        {selectedTransfer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Transfer No</p>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedTransfer.transferNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Status</p>
                {getStatusBadge(selectedTransfer.status)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Transfer Date</p>
              <p className="text-sm" style={{ color: '#111827' }}>
                {new Date(selectedTransfer.transferDate).toLocaleDateString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>From Showroom</p>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedTransfer.fromShowroom}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>To Showroom</p>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedTransfer.toShowroom}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Total Items</p>
              <p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedTransfer.totalItems}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Edit User / Date</p>
              <p className="text-sm" style={{ color: '#111827' }}>
                {selectedTransfer.editUser} • {selectedTransfer.editDate}
              </p>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowViewModal(false);
            setSelectedTransfer(null);
          }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
