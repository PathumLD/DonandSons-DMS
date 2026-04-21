'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Trash2, Plus, Search, Edit, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockDisposals, type Disposal } from '@/lib/mock-data/operations';
import { mockShowrooms } from '@/lib/mock-data/showrooms';

export default function DisposalPage() {
  const [disposals, setDisposals] = useState<Disposal[]>(mockDisposals);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDisposal, setSelectedDisposal] = useState<Disposal | null>(null);
  
  const [formData, setFormData] = useState({
    disposalDate: new Date().toISOString().split('T')[0],
    deliveredDate: '',
    showroomId: '',
    notes: '',
    status: 'Draft' as const,
  });

  const filteredDisposals = useMemo(() => {
    return disposals.filter(d => {
      const matchesSearch = 
        d.disposalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.showroom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [disposals, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredDisposals.length / pageSize);
  const paginatedDisposals = filteredDisposals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddDisposal = () => {
    const newDisposal: Disposal = {
      id: Math.max(...disposals.map(d => d.id)) + 1,
      disposalNo: `DS-2026-${String(disposals.length + 1).padStart(3, '0')}`,
      disposalDate: formData.disposalDate,
      deliveredDate: formData.deliveredDate,
      showroomId: Number(formData.showroomId),
      showroom: mockShowrooms.find(s => s.id === Number(formData.showroomId))?.name || '',
      status: formData.status,
      totalItems: 0,
      editUser: 'cashier1',
      editDate: new Date().toLocaleString(),
      notes: formData.notes,
    };
    setDisposals([newDisposal, ...disposals]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditDisposal = () => {
    if (selectedDisposal) {
      setDisposals(disposals.map(d =>
        d.id === selectedDisposal.id
          ? {
              ...d,
              disposalDate: formData.disposalDate,
              deliveredDate: formData.deliveredDate,
              showroomId: Number(formData.showroomId),
              showroom: mockShowrooms.find(s => s.id === Number(formData.showroomId))?.name || '',
              notes: formData.notes,
              editDate: new Date().toLocaleString(),
            }
          : d
      ));
      setShowEditModal(false);
      setSelectedDisposal(null);
      resetForm();
    }
  };

  const handleApprove = (id: number) => {
    setDisposals(disposals.map(d =>
      d.id === id ? { ...d, status: 'Approved', approvedBy: 'Manager' } : d
    ));
  };

  const handleReject = (id: number) => {
    setDisposals(disposals.map(d =>
      d.id === id ? { ...d, status: 'Rejected', approvedBy: 'Manager' } : d
    ));
  };

  const resetForm = () => {
    setFormData({
      disposalDate: new Date().toISOString().split('T')[0],
      deliveredDate: '',
      showroomId: '',
      notes: '',
      status: 'Draft',
    });
  };

  const openEditModal = (disposal: Disposal) => {
    setSelectedDisposal(disposal);
    setFormData({
      disposalDate: disposal.disposalDate,
      deliveredDate: disposal.deliveredDate,
      showroomId: String(disposal.showroomId),
      notes: disposal.notes || '',
      status: disposal.status,
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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
      key: 'disposalDate',
      label: 'Disposal Date',
      render: (item: Disposal) => (
        <span className="font-medium">{new Date(item.disposalDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'disposalNo',
      label: 'Disposal No',
      render: (item: Disposal) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.disposalNo}
        </span>
      ),
    },
    {
      key: 'showroom',
      label: 'Showroom',
      render: (item: Disposal) => (
        <span className="font-medium">{item.showroom}</span>
      ),
    },
    {
      key: 'deliveredDate',
      label: 'Delivered Date',
      render: (item: Disposal) => (
        <span>{new Date(item.deliveredDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'totalItems',
      label: 'Items',
      render: (item: Disposal) => (
        <span className="font-semibold">{item.totalItems}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Disposal) => getStatusBadge(item.status),
    },
    {
      key: 'editUser',
      label: 'Edit User',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Disposal) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedDisposal(item);
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
            <>
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
              <button
                onClick={() => handleReject(item.id)}
                className="p-1.5 rounded transition-colors"
                style={{ color: '#DC2626' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const renderDisposalForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Disposal Date"
          type="date"
          value={formData.disposalDate}
          onChange={(e) => setFormData({ ...formData, disposalDate: e.target.value })}
          fullWidth
          required
        />
        <Input
          label="Delivered Date"
          type="date"
          value={formData.deliveredDate}
          onChange={(e) => setFormData({ ...formData, deliveredDate: e.target.value })}
          fullWidth
          required
        />
      </div>
      <Select
        label="Showroom"
        value={formData.showroomId}
        onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })}
        options={mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
        placeholder="Select showroom"
        fullWidth
        required
      />
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
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Disposal Management</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            Track and manage product disposals ({filteredDisposals.length} records)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Disposal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Disposal List</CardTitle>
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
                  { value: 'Rejected', label: 'Rejected' },
                ]}
              />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="Search disposals..."
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
            data={paginatedDisposals}
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

      {/* Add/Edit/View Modals */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Disposal"
        size="lg"
      >
        {renderDisposalForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddDisposal}>
            <Plus className="w-4 h-4 mr-2" />Create Disposal
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDisposal(null);
          resetForm();
        }}
        title="Edit Disposal"
        size="lg"
      >
        {renderDisposalForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedDisposal(null);
            resetForm();
          }}>Cancel</Button>
          <Button variant="primary" onClick={handleEditDisposal}>Save Changes</Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedDisposal(null);
        }}
        title="Disposal Details"
        size="md"
      >
        {selectedDisposal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Disposal No</p>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedDisposal.disposalNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Status</p>
                {getStatusBadge(selectedDisposal.status)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Disposal Date</p>
                <p className="text-sm" style={{ color: '#111827' }}>
                  {new Date(selectedDisposal.disposalDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Delivered Date</p>
                <p className="text-sm" style={{ color: '#111827' }}>
                  {new Date(selectedDisposal.deliveredDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Showroom</p>
              <p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedDisposal.showroom}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Total Items</p>
              <p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedDisposal.totalItems}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Edit User / Date</p>
              <p className="text-sm" style={{ color: '#111827' }}>
                {selectedDisposal.editUser} • {selectedDisposal.editDate}
              </p>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowViewModal(false);
            setSelectedDisposal(null);
          }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
