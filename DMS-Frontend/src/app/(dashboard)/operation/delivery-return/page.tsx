'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Plus, Search, Edit, Eye, CheckCircle, XCircle, Clock, Info, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { deliveryReturnsApi, type DeliveryReturn } from '@/lib/api/delivery-returns';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, isAdminUser, todayISO } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function DeliveryReturnPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('delivery-return'));
  const dateBounds = getDateBounds('today-only', user as any, {
    allowBackDatePermission: 'operation.delivery-return.allow-back-future',
    allowFutureDatePermission: 'operation.delivery-return.allow-back-future',
  });

  const [returns, setReturns] = useState<DeliveryReturn[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<DeliveryReturn | null>(null);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  
  const [formData, setFormData] = useState({
    returnDate: todayISO(),
    deliveryNo: '',
    deliveredDate: '',
    showroomId: '',
    reason: '',
  });

  const isFormValid = () => {
    return formData.returnDate && formData.deliveryNo && formData.deliveredDate && 
           formData.showroomId && formData.reason.trim();
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [currentPage, pageSize, statusFilter]);

  const fetchOutlets = async () => {
    try {
      const response = await outletsApi.getAll();
      setOutlets(response.outlets.filter(o => o.isActive));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load outlets');
    }
  };

  const fetchReturns = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      
      const response = await deliveryReturnsApi.getAll(currentPage, pageSize, filters);
      setReturns(response.deliveryReturns || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load delivery returns');
      setReturns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReturns = useMemo(() => {
    const today = todayISO();
    return returns.filter(r => {
      const matchesSearch = 
        r.returnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.deliveryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.outlet?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        isAdmin ||
        (r.createdById === user?.id && (showPreviousRecords || r.returnDate === today));
      return matchesSearch && matchesRole;
    });
  }, [returns, searchTerm, isAdmin, user, showPreviousRecords]);

  const paginatedReturns = filteredReturns;

  const handleAdd = async () => {
    try {
      setIsSubmitting(true);
      await deliveryReturnsApi.create({
        returnDate: formData.returnDate,
        deliveryNo: formData.deliveryNo,
        deliveredDate: formData.deliveredDate,
        outletId: formData.showroomId,
        reason: formData.reason,
        items: [],
      });
      toast.success('Delivery return created successfully');
      setShowAddModal(false);
      resetForm();
      fetchReturns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create delivery return');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedReturn) return;
    
    try {
      setIsSubmitting(true);
      await deliveryReturnsApi.update(selectedReturn.id, {
        returnDate: formData.returnDate,
        deliveryNo: formData.deliveryNo,
        deliveredDate: formData.deliveredDate,
        outletId: formData.showroomId,
        reason: formData.reason,
        items: selectedReturn.items?.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
        })) || [],
      });
      toast.success('Delivery return updated successfully');
      setShowEditModal(false);
      setSelectedReturn(null);
      resetForm();
      fetchReturns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update delivery return');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await deliveryReturnsApi.submit(id);
      toast.success('Delivery return submitted for approval');
      fetchReturns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit delivery return');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await deliveryReturnsApi.approve(id);
      toast.success('Delivery return approved successfully');
      fetchReturns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve delivery return');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await deliveryReturnsApi.reject(id);
      toast.success('Delivery return rejected');
      fetchReturns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject delivery return');
    }
  };

  const resetForm = () => {
    setFormData({
      returnDate: todayISO(),
      deliveryNo: '',
      deliveredDate: '',
      showroomId: '',
      reason: '',
    });
  };

  const openEditModal = (item: DeliveryReturn) => {
    setSelectedReturn(item);
    setFormData({
      returnDate: item.returnDate,
      deliveryNo: item.deliveryNo,
      deliveredDate: item.deliveredDate || '',
      showroomId: item.outletId,
      reason: item.reason,
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Processed':
        return <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      case 'Pending':
        return <Badge variant="warning" size="sm"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  const columns = [
    {
      key: 'returnDate',
      label: 'Return Date',
      render: (item: DeliveryReturn) => (
        <span className="font-medium">{new Date(item.returnDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'returnNo',
      label: 'Return No',
      render: (item: DeliveryReturn) => (
        <span className="font-mono font-semibold" style={{ color: pageTheme?.secondaryColor || '#C8102E' }}>
          {item.returnNo}
        </span>
      ),
    },
    {
      key: 'deliveryNo',
      label: 'Delivery No',
      render: (item: DeliveryReturn) => (
        <span className="font-medium">{item.deliveryNo}</span>
      ),
    },
    {
      key: 'showroom',
      label: 'Showroom',
      render: (item: DeliveryReturn) => (
        <span className="font-medium">{item.outlet?.name || '-'}</span>
      ),
    },
    {
      key: 'totalItems',
      label: 'Items',
      render: (item: DeliveryReturn) => (
        <span className="font-semibold">{item.totalItems}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: DeliveryReturn) => getStatusBadge(item.status),
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (item: DeliveryReturn) => (
        <span className="text-sm">{item.createdById || '-'}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved By',
      render: (item: DeliveryReturn) => (
        <span className="text-sm">{item.approvedBy?.fullName || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: DeliveryReturn) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedReturn(item);
              setShowViewModal(true);
            }}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.status === 'Draft' && (
            <>
              <button
                onClick={() => openEditModal(item)}
                className="p-1.5 rounded transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSubmit(item.id)}
                className="p-1.5 rounded transition-colors"
                style={{ color: '#3B82F6' }}
                title="Submit"
              >
                <Clock className="w-4 h-4" />
              </button>
            </>
          )}
          {item.status === 'Pending' && (
            <>
              <button
                onClick={() => handleApprove(item.id)}
                className="p-1.5 rounded transition-colors"
                style={{ color: '#10B981' }}
                title="Approve"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReject(item.id)}
                className="p-1.5 rounded transition-colors"
                style={{ color: '#DC2626' }}
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Delivery Returns</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage product returns from deliveries ({filteredReturns.length} returns)
          </p>
          <div className="mt-2">
            <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
              <Info className="w-3 h-3 mr-1" />
              {isAdmin
                ? 'Admin: All records visible. Any date allowed.'
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
          <Button variant="primary" size="md" onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Delivery Return List</CardTitle>
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
                  { value: 'Processed', label: 'Processed' },
                ]}
              />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  placeholder="Search returns..."
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
            </div>
          ) : (
            <DataTable
              data={paginatedReturns}
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
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Delivery Return"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Input
              label="Delivered Date"
              type="date"
              value={formData.deliveredDate}
              onChange={(e) => setFormData({ ...formData, deliveredDate: e.target.value })}
              fullWidth
            />
          </div>
          <Input
            label="Delivery No"
            value={formData.deliveryNo}
            onChange={(e) => setFormData({ ...formData, deliveryNo: e.target.value })}
            placeholder="DN-2026-XXXXXX"
            fullWidth
            required
          />
          <Select
            label="Showroom"
            value={formData.showroomId}
            onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })}
            options={outlets.map(o => ({ value: o.id, label: `${o.code} - ${o.name}` }))}
            placeholder="Select showroom"
            fullWidth
            required
          />
          <Input
            label="Reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Reason for return..."
            fullWidth
            required
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd} disabled={isSubmitting || !isFormValid()}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Return'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedReturn(null);
          resetForm();
        }}
        title="Edit Delivery Return"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Return Date"
              type="date"
              value={formData.returnDate}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              min={dateBounds.min}
              max={dateBounds.max}
              fullWidth
              required
            />
            <Input
              label="Delivered Date"
              type="date"
              value={formData.deliveredDate}
              onChange={(e) => setFormData({ ...formData, deliveredDate: e.target.value })}
              fullWidth
            />
          </div>
          <Input
            label="Delivery No"
            value={formData.deliveryNo}
            onChange={(e) => setFormData({ ...formData, deliveryNo: e.target.value })}
            fullWidth
            required
          />
          <Select
            label="Showroom"
            value={formData.showroomId}
            onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })}
            options={outlets.map(o => ({ value: o.id, label: `${o.code} - ${o.name}` }))}
            fullWidth
            required
          />
          <Input
            label="Reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            fullWidth
            required
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedReturn(null);
            resetForm();
          }}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedReturn(null);
        }}
        title="Delivery Return Details"
        size="md"
      >
        {selectedReturn && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Return No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedReturn.returnNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedReturn.status)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Return Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {new Date(selectedReturn.returnDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivered Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {selectedReturn.deliveredDate ? new Date(selectedReturn.deliveredDate).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivery No</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedReturn.deliveryNo}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Showroom</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedReturn.outlet?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Items</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedReturn.totalItems}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Reason</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedReturn.reason}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created / Updated</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedReturn.createdAt).toLocaleString()} • {new Date(selectedReturn.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowViewModal(false);
            setSelectedReturn(null);
          }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
