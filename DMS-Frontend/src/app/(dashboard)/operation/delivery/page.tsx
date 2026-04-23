'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Plus, Search, Edit, Eye, Printer, CheckCircle, XCircle, Clock, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockDeliveries, type Delivery } from '@/lib/mock-data/operations';
import { mockShowrooms } from '@/lib/mock-data/showrooms';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, isAdminUser, todayISO } from '@/lib/date-restrictions';

export default function DeliveryPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('delivery'));
  const dateBounds = getDateBounds('delivery', user as any, {
    allowBackDatePermission: 'operation.delivery.allow-back-future',
    allowFutureDatePermission: 'operation.delivery.allow-back-future',
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  
  const [formData, setFormData] = useState({
    deliveryNo: '',
    deliveryDate: todayISO(),
    showroomId: '',
    notes: '',
    status: 'Draft' as Delivery['status'],
  });

  const filteredDeliveries = useMemo(() => {
    const today = todayISO();
    return deliveries.filter(d => {
      const matchesSearch = 
        d.deliveryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.showroom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || d.status === statusFilter;
      // Admin / Super Admin sees all records. Other users only see records they
      // entered for today or future (4.i Delivery), unless "Show Previous Records" is enabled.
      const matchesRole =
        isAdmin ||
        (d.editUser === user?.email && (showPreviousRecords || (d.deliveryDate ?? '') >= today));
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [deliveries, searchTerm, statusFilter, isAdmin, user, showPreviousRecords]);

  const totalPages = Math.ceil(filteredDeliveries.length / pageSize);
  const paginatedDeliveries = filteredDeliveries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddDelivery = () => {
    const newDelivery: Delivery = {
      id: Math.max(...deliveries.map(d => d.id)) + 1,
      deliveryNo: `DN-2026-${String(deliveries.length + 1).padStart(3, '0')}`,
      deliveryDate: formData.deliveryDate,
      showroomId: Number(formData.showroomId),
      showroom: mockShowrooms.find(s => s.id === Number(formData.showroomId))?.name || '',
      status: formData.status,
      totalItems: 0,
      totalValue: 0,
      editUser: 'admin',
      editDate: new Date().toLocaleString(),
      notes: formData.notes,
    };
    setDeliveries([newDelivery, ...deliveries]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditDelivery = () => {
    if (selectedDelivery) {
      setDeliveries(deliveries.map(d =>
        d.id === selectedDelivery.id
          ? {
              ...d,
              deliveryDate: formData.deliveryDate,
              showroomId: Number(formData.showroomId),
              showroom: mockShowrooms.find(s => s.id === Number(formData.showroomId))?.name || '',
              notes: formData.notes,
              editDate: new Date().toLocaleString(),
            }
          : d
      ));
      setShowEditModal(false);
      setSelectedDelivery(null);
      resetForm();
    }
  };

  const handleApprove = (id: number) => {
    setDeliveries(deliveries.map(d =>
      d.id === id
        ? { ...d, status: 'Approved', approvedBy: 'Manager', approvedDate: new Date().toLocaleString() }
        : d
    ));
  };

  const handleReject = (id: number) => {
    setDeliveries(deliveries.map(d =>
      d.id === id ? { ...d, status: 'Rejected', approvedBy: 'Manager' } : d
    ));
  };

  const resetForm = () => {
    setFormData({
      deliveryNo: '',
      deliveryDate: todayISO(),
      showroomId: '',
      notes: '',
      status: 'Draft',
    });
  };

  const openEditModal = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setFormData({
      deliveryNo: delivery.deliveryNo,
      deliveryDate: delivery.deliveryDate,
      showroomId: String(delivery.showroomId),
      notes: delivery.notes || '',
      status: delivery.status,
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
      key: 'deliveryDate',
      label: 'Delivery Date',
      render: (item: Delivery) => (
        <span className="font-medium">{new Date(item.deliveryDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'deliveryNo',
      label: 'Delivery No',
      render: (item: Delivery) => (
        <span className="font-mono font-semibold" style={{ color: pageTheme?.secondaryColor || '#C8102E' }}>
          {item.deliveryNo}
        </span>
      ),
    },
    {
      key: 'showroom',
      label: 'Showroom',
      render: (item: Delivery) => (
        <span className="font-medium">{item.showroom}</span>
      ),
    },
    {
      key: 'totalItems',
      label: 'Items',
      render: (item: Delivery) => (
        <span className="font-semibold">{item.totalItems}</span>
      ),
    },
    {
      key: 'totalValue',
      label: 'Total Value',
      render: (item: Delivery) => (
        <span className="font-semibold">Rs. {item.totalValue.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Delivery) => getStatusBadge(item.status),
    },
    {
      key: 'editUser',
      label: 'Edit User',
    },
    {
      key: 'editDate',
      label: 'Edit Date',
      render: (item: Delivery) => (
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.editDate}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: Delivery) => (
        <span className="text-sm">{item.approvedBy || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Delivery) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedDelivery(item);
              setShowViewModal(true);
            }}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
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
              style={{ color: 'var(--muted-foreground)' }}
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
          <button
            onClick={() => console.log('Print DN:', item.deliveryNo)}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Print DN"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const renderDeliveryForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Delivery Date"
          type="date"
          value={formData.deliveryDate}
          onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
          min={dateBounds.min}
          max={dateBounds.max}
          helperText={dateBounds.helperText}
          fullWidth
          required
        />
        <Select
          label="Showroom"
          value={formData.showroomId}
          onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })}
          options={mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
          placeholder="Select showroom"
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Delivery Management</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage product deliveries to showrooms ({filteredDeliveries.length} deliveries)
          </p>
          <div className="mt-2">
            <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
              <Info className="w-3 h-3 mr-1" />
              {isAdmin
                ? 'Admin: All records visible. Any date allowed.'
                : 'You see your own records for today/future only.'}
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
          <Button variant="primary" size="md" onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
          <Button variant="ghost" size="md" onClick={() => console.log('Print CH')}>
            <Printer className="w-4 h-4 mr-2" />
            Print CH
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Delivery List</CardTitle>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  placeholder="Search deliveries..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid var(--input)' }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={paginatedDeliveries}
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

      {/* Add Delivery Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Delivery"
        size="lg"
      >
        {renderDeliveryForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddDelivery}>
            <Plus className="w-4 h-4 mr-2" />
            Create Delivery
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Delivery Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDelivery(null);
          resetForm();
        }}
        title="Edit Delivery"
        size="lg"
      >
        {renderDeliveryForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedDelivery(null);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditDelivery}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>

      {/* View Delivery Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedDelivery(null);
        }}
        title="Delivery Details"
        size="lg"
      >
        {selectedDelivery && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivery No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedDelivery.deliveryNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivery Date</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  {new Date(selectedDelivery.deliveryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Showroom</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedDelivery.showroom}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedDelivery.status)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Items</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedDelivery.totalItems}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Value</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  Rs. {selectedDelivery.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit User / Date</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {selectedDelivery.editUser} • {selectedDelivery.editDate}
              </p>
            </div>
            {selectedDelivery.approvedBy && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved By / Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {selectedDelivery.approvedBy} • {selectedDelivery.approvedDate}
                </p>
              </div>
            )}
            {selectedDelivery.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedDelivery.notes}</p>
              </div>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowViewModal(false);
            setSelectedDelivery(null);
          }}>
            Close
          </Button>
          <Button variant="secondary" onClick={() => console.log('Print:', selectedDelivery)}>
            <Printer className="w-4 h-4 mr-2" />
            Print DN
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
