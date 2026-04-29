'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Plus, Search, Eye, Edit, Info, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cancellationsApi, type Cancellation } from '@/lib/api/cancellations';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { deliveriesApi, type Delivery } from '@/lib/api/deliveries';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, isAdminUser, todayISO, addDaysISO } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function CancellationPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('cancellation'));
  const dateBounds = getDateBounds('back-3-no-future', user as any, {
    allowBackDatePermission: 'operation.cancellation.allow-back-future',
    allowFutureDatePermission: 'operation.cancellation.allow-back-future',
  });

  const [cancellations, setCancellations] = useState<Cancellation[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);
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
  const [selectedCancellation, setSelectedCancellation] = useState<Cancellation | null>(null);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  
  const [formData, setFormData] = useState({
    cancellationDate: todayISO(),
    deliveryNo: '',
    deliveredDate: '',
    showroomId: '',
    reason: '',
  });

  const isFormValid = () => {
    return formData.cancellationDate && formData.deliveryNo && formData.deliveredDate &&
           formData.showroomId && formData.reason && formData.reason.trim();
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  useEffect(() => {
    fetchCancellations();
  }, [currentPage, pageSize, statusFilter]);

  const fetchOutlets = async () => {
    try {
      const response = await outletsApi.getAll();
      setOutlets(response.outlets.filter(o => o.isActive));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load outlets');
    }
  };

  const fetchDeliveriesByDate = async (date: string) => {
    if (!date) {
      setDeliveries([]);
      return;
    }

    try {
      setIsLoadingDeliveries(true);
      // Create start and end of day in UTC for the selected date
      const startOfDay = new Date(date + 'T00:00:00Z');
      const endOfDay = new Date(date + 'T23:59:59.999Z');
      
      console.log('Fetching deliveries for date:', { 
        date, 
        startOfDay: startOfDay.toISOString(), 
        endOfDay: endOfDay.toISOString() 
      });
      
      // First try approved deliveries
      let response = await deliveriesApi.getAll(1, 100, {
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
        status: 'Approved',
      });
      
      console.log('Approved deliveries response:', response);
      
      // If no approved deliveries, try all deliveries for this date
      if (!response.deliveries || response.deliveries.length === 0) {
        console.log('No approved deliveries, fetching all deliveries...');
        response = await deliveriesApi.getAll(1, 100, {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
        });
        console.log('All deliveries response:', response);
        
        if (response.deliveries && response.deliveries.length > 0) {
          toast.info(`Found ${response.deliveries.length} delivery(ies) (not all approved)`);
        }
      }
      
      setDeliveries(response.deliveries || []);
      
      // If there's only one delivery for this date, auto-select it
      if (response.deliveries?.length === 1) {
        setFormData(prev => ({
          ...prev,
          deliveryNo: response.deliveries[0].deliveryNo,
          showroomId: response.deliveries[0].outletId,
        }));
        toast.success('Delivery auto-selected');
      } else if (response.deliveries?.length > 1) {
        toast.success(`${response.deliveries.length} deliveries found`);
      } else {
        toast.info('No deliveries found for this date');
      }
    } catch (error: any) {
      console.error('Error fetching deliveries:', error);
      toast.error(error.response?.data?.message || 'Failed to load deliveries');
      setDeliveries([]);
    } finally {
      setIsLoadingDeliveries(false);
    }
  };

  const fetchCancellations = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      
      const response = await cancellationsApi.getAll(currentPage, pageSize, filters);
      setCancellations(response.cancellations || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load cancellations');
      setCancellations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCancellations = useMemo(() => {
    const minDate = dateBounds.min || addDaysISO(-3);
    return cancellations.filter(c => {
      const matchesSearch =
        c.cancellationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.deliveryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.outletName || c.outlet?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        isAdmin ||
        (c.createdById === user?.id && (showPreviousRecords || c.cancellationDate >= minDate));
      return matchesSearch && matchesRole;
    });
  }, [cancellations, searchTerm, isAdmin, user, showPreviousRecords, dateBounds]);

  const paginatedCancellations = filteredCancellations;

  const handleAdd = async () => {
    try {
      setIsSubmitting(true);
      await cancellationsApi.create({
        cancellationDate: formData.cancellationDate,
        deliveryNo: formData.deliveryNo,
        deliveredDate: formData.deliveredDate,
        outletId: formData.showroomId,
        reason: formData.reason,
      });
      toast.success('Cancellation request created successfully');
      setShowAddModal(false);
      resetForm();
      fetchCancellations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create cancellation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCancellation) return;
    
    try {
      setIsSubmitting(true);
      await cancellationsApi.update(selectedCancellation.id, {
        cancellationDate: formData.cancellationDate,
        deliveryNo: formData.deliveryNo,
        deliveredDate: formData.deliveredDate,
        outletId: formData.showroomId,
        reason: formData.reason,
      });
      toast.success('Cancellation updated successfully');
      setShowEditModal(false);
      setSelectedCancellation(null);
      resetForm();
      fetchCancellations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update cancellation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await cancellationsApi.approve(id);
      toast.success('Cancellation approved successfully');
      fetchCancellations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve cancellation');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await cancellationsApi.reject(id);
      toast.success('Cancellation rejected');
      fetchCancellations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject cancellation');
    }
  };

  const resetForm = () => {
    setFormData({
      cancellationDate: todayISO(),
      deliveryNo: '',
      deliveredDate: '',
      showroomId: '',
      reason: '',
    });
    setDeliveries([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'Rejected':
        return <Badge variant="danger" size="sm"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="warning" size="sm"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const formatApproverCell = (item: Cancellation) => {
    if (item.status === 'Approved' && item.approvedByName) {
      const date = item.approvedDate ? new Date(item.approvedDate).toLocaleDateString() : '';
      return (
        <span className="text-sm">
          {item.approvedByName} {date && `- ${date}`}
        </span>
      );
    }
    if (item.status === 'Rejected' && item.rejectedByName) {
      const date = item.rejectedDate ? new Date(item.rejectedDate).toLocaleDateString() : '';
      return (
        <span className="text-sm">
          {item.rejectedByName} {date && `- ${date}`}
        </span>
      );
    }
    return <span className="text-sm">-</span>;
  };

  const columns = [
    {
      key: 'cancellationDate',
      label: 'Cancellation Date',
      render: (item: Cancellation) => (
        <span className="font-medium">{new Date(item.cancellationDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'cancellationNo',
      label: 'Cancellation No',
      render: (item: Cancellation) => (
        <span className="font-mono font-semibold" style={{ color: pageTheme?.secondaryColor || '#C8102E' }}>
          {item.cancellationNo}
        </span>
      ),
    },
    {
      key: 'showroom',
      label: 'Showroom',
      render: (item: Cancellation) => (
        <span className="font-medium">{item.outletName || item.outlet?.name || '-'}</span>
      ),
    },
    {
      key: 'deliveredDate',
      label: 'Delivered Date',
      render: (item: Cancellation) => (
        <span className="text-sm">{item.deliveredDate ? new Date(item.deliveredDate).toLocaleDateString() : '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Cancellation) => getStatusBadge(item.status),
    },
    {
      key: 'editUser',
      label: 'Edit User',
      render: (item: Cancellation) => (
        <span className="text-sm">{item.updatedByName || '-'}</span>
      ),
    },
    {
      key: 'editDate',
      label: 'Edit Date',
      render: (item: Cancellation) => (
        <span className="text-sm">{new Date(item.updatedAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: Cancellation) => formatApproverCell(item),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Cancellation) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              try {
                const detail = await cancellationsApi.getById(item.id);
                setSelectedCancellation(detail.data || detail);
                setShowViewModal(true);
              } catch (error) {
                toast.error('Failed to load cancellation details');
              }
            }}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.status === 'Pending' && (
            <>
              <button
                onClick={() => {
                  setSelectedCancellation(item);
                  setFormData({
                    cancellationDate: item.cancellationDate,
                    deliveryNo: item.deliveryNo,
                    deliveredDate: item.deliveredDate || '',
                    showroomId: item.outletId,
                    reason: item.reason,
                  });
                  setShowEditModal(true);
                }}
                className="p-1.5 rounded transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Delivery Cancellation</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage delivery cancellation requests ({filteredCancellations.length} cancellations)
          </p>
          <div className="mt-2">
            <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
              <Info className="w-3 h-3 mr-1" />
              {isAdmin
                ? 'Admin: All records visible. Any date allowed.'
                : 'You see your own cancellations. Back date up to 3 days.'}
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
            <CardTitle>Cancellation List</CardTitle>
            <div className="flex items-center space-x-3">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
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
              data={paginatedCancellations}
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
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Cancellation"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Input
              label="Delivered Date"
              type="date"
              value={formData.deliveredDate}
              onChange={(e) => {
                const newDate = e.target.value;
                setFormData({ ...formData, deliveredDate: newDate, deliveryNo: '', showroomId: '' });
                fetchDeliveriesByDate(newDate);
              }}
              fullWidth
              required
            />
          </div>
          <div>
            <Select
              label="Delivery No"
              value={formData.deliveryNo}
              onChange={(e) => {
                const selectedDelivery = deliveries.find(d => d.deliveryNo === e.target.value);
                setFormData({ 
                  ...formData, 
                  deliveryNo: e.target.value,
                  showroomId: selectedDelivery?.outletId || formData.showroomId
                });
              }}
              options={deliveries.map(d => ({
                value: d.deliveryNo,
                label: `${d.deliveryNo} - ${d.outlet?.name || d.outletName || ''}`
              }))}
              placeholder={isLoadingDeliveries ? "Loading deliveries..." : formData.deliveredDate ? "Select delivery" : "Select delivered date first"}
              fullWidth
              required
              disabled={!formData.deliveredDate || isLoadingDeliveries}
            />
            {formData.deliveredDate && !isLoadingDeliveries && (
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {deliveries.length > 0 
                  ? `${deliveries.length} approved ${deliveries.length === 1 ? 'delivery' : 'deliveries'} found for this date`
                  : 'No approved deliveries found for this date'}
              </p>
            )}
          </div>
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
            placeholder="Reason for cancellation..."
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
            {isSubmitting ? 'Creating...' : 'Create Cancellation'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCancellation(null);
          resetForm();
        }}
        title="Edit Cancellation"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Input
              label="Delivered Date"
              type="date"
              value={formData.deliveredDate}
              onChange={(e) => {
                const newDate = e.target.value;
                setFormData({ ...formData, deliveredDate: newDate });
              }}
              fullWidth
              required
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
            placeholder="Reason for cancellation..."
            fullWidth
            required
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedCancellation(null);
            resetForm();
          }}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit} disabled={isSubmitting || !isFormValid()}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Edit className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Updating...' : 'Update Cancellation'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedCancellation(null);
        }}
        title="Cancellation Details"
        size="md"
      >
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
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {new Date(selectedCancellation.cancellationDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivered Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {selectedCancellation.deliveredDate ? new Date(selectedCancellation.deliveredDate).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivery No</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedCancellation.deliveryNo}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Showroom</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedCancellation.outletName || selectedCancellation.outlet?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Reason</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedCancellation.reason}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created / Updated</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedCancellation.createdAt).toLocaleDateString()} • {new Date(selectedCancellation.updatedAt).toLocaleDateString()}
              </p>
            </div>
            {(selectedCancellation.approvedByName || selectedCancellation.rejectedByName) && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved/Rejected By</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {selectedCancellation.status === 'Approved' && selectedCancellation.approvedByName && 
                    `${selectedCancellation.approvedByName} • ${selectedCancellation.approvedDate ? new Date(selectedCancellation.approvedDate).toLocaleDateString() : ''}`
                  }
                  {selectedCancellation.status === 'Rejected' && selectedCancellation.rejectedByName && 
                    `${selectedCancellation.rejectedByName} • ${selectedCancellation.rejectedDate ? new Date(selectedCancellation.rejectedDate).toLocaleDateString() : ''}`
                  }
                </p>
              </div>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowViewModal(false);
            setSelectedCancellation(null);
          }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
