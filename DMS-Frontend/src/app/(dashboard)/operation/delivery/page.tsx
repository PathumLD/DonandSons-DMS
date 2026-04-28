'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Plus, Search, Edit, Eye, Printer, CheckCircle, XCircle, Clock, Info, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { deliveriesApi, type Delivery, type CreateDeliveryItemDto } from '@/lib/api/deliveries';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { productsApi, type Product } from '@/lib/api/products';
import ItemManagementTable, { type ItemManagementItem } from '@/components/operation/ItemManagementTable';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, isAdminUser, todayISO } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function DeliveryPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('delivery'));
  const dateBounds = getDateBounds('delivery', user as any, {
    allowBackDatePermission: 'operation.delivery.allow-back-future',
    allowFutureDatePermission: 'operation.delivery.allow-back-future',
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  
  const [formData, setFormData] = useState({
    deliveryNo: '',
    deliveryDate: todayISO(),
    showroomId: '',
    notes: '',
    status: 'Draft' as Delivery['status'],
  });

  const [deliveryItems, setDeliveryItems] = useState<ItemManagementItem[]>([]);

  const isFormValid = () => {
    return formData.deliveryDate && formData.showroomId && deliveryItems.length > 0;
  };

  useEffect(() => {
    fetchOutlets();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [currentPage, pageSize, statusFilter]);

  const fetchOutlets = async () => {
    try {
      const response = await outletsApi.getAll();
      setOutlets(response.outlets.filter(o => o.isActive));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load outlets');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll(1, 1000);
      setProducts(response.products.filter(p => p.isActive));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load products');
    }
  };

  const fetchDeliveries = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      
      const response = await deliveriesApi.getAll(currentPage, pageSize, filters);
      setDeliveries(response.deliveries || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load deliveries');
      setDeliveries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDeliveries = useMemo(() => {
    const today = todayISO();
    return deliveries.filter(d => {
      const matchesSearch = 
        d.deliveryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.outlet?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        isAdmin ||
        (d.createdById === user?.id && (showPreviousRecords || (d.deliveryDate ?? '') >= today));
      return matchesSearch && matchesRole;
    });
  }, [deliveries, searchTerm, isAdmin, user, showPreviousRecords]);

  const paginatedDeliveries = filteredDeliveries;

  const handleAddDelivery = async () => {
    if (!formData.showroomId) {
      toast.error('Please select a showroom');
      return;
    }

    if (deliveryItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      setIsSubmitting(true);
      await deliveriesApi.create({
        deliveryDate: formData.deliveryDate,
        outletId: formData.showroomId,
        notes: formData.notes,
        items: deliveryItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice || 0,
        })),
      });
      toast.success('Delivery created successfully');
      setShowAddModal(false);
      resetForm();
      fetchDeliveries();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDelivery = async () => {
    if (!selectedDelivery) return;
    
    try {
      setIsSubmitting(true);
      await deliveriesApi.update(selectedDelivery.id, {
        deliveryDate: formData.deliveryDate,
        outletId: formData.showroomId,
        notes: formData.notes,
        items: selectedDelivery.items?.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })) || [],
      });
      toast.success('Delivery updated successfully');
      setShowEditModal(false);
      setSelectedDelivery(null);
      resetForm();
      fetchDeliveries();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await deliveriesApi.submit(id);
      toast.success('Delivery submitted for approval');
      fetchDeliveries();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit delivery');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await deliveriesApi.approve(id);
      toast.success('Delivery approved successfully');
      fetchDeliveries();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve delivery');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await deliveriesApi.reject(id);
      toast.success('Delivery rejected');
      fetchDeliveries();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject delivery');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery?')) return;
    
    try {
      await deliveriesApi.delete(id);
      toast.success('Delivery deleted successfully');
      fetchDeliveries();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete delivery');
    }
  };

  const resetForm = () => {
    setFormData({
      deliveryNo: '',
      deliveryDate: todayISO(),
      showroomId: '',
      notes: '',
      status: 'Draft',
    });
    setDeliveryItems([]);
  };

  const openEditModal = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setFormData({
      deliveryNo: delivery.deliveryNo,
      deliveryDate: delivery.deliveryDate,
      showroomId: delivery.outletId,
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
        <span className="font-medium">{item.outletName || item.outlet?.name || '-'}</span>
      ),
    },
    {
      key: 'totalItems',
      label: 'Items',
      render: (item: Delivery) => (
        <span className="font-semibold">{item.totalItems || 0}</span>
      ),
    },
    {
      key: 'totalValue',
      label: 'Total Value',
      render: (item: Delivery) => (
        <span className="font-semibold">Rs. {(item.totalValue || 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Delivery) => getStatusBadge(item.status),
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (item: Delivery) => (
        <span className="text-sm">{item.createdByName || '-'}</span>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Updated At',
      render: (item: Delivery) => (
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {new Date(item.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: Delivery) => (
        <span className="text-sm">{item.approvedByName || item.approvedBy?.fullName || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Delivery) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              try {
                const fullDelivery = await deliveriesApi.getById(item.id);
                console.log('Full delivery:', fullDelivery);
                setSelectedDelivery(fullDelivery);
                setShowViewModal(true);
              } catch (error: any) {
                console.error('Error loading delivery:', error);
                toast.error('Failed to load delivery details');
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
          {item.status === 'Draft' && (
            <>
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
              <button
                onClick={() => handleSubmit(item.id)}
                className="p-1.5 rounded transition-colors"
                style={{ color: '#3B82F6' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Submit for Approval"
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

  const renderDeliveryForm = () => {
    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Delivery Information</h3>
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
              options={outlets.map(o => ({ value: o.id, label: `${o.code} - ${o.name}` }))}
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

        {/* Items Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            Delivery Items <span className="text-red-500">*</span>
          </h3>
          <ItemManagementTable
            products={products}
            items={deliveryItems}
            onItemsChange={setDeliveryItems}
            showReason={false}
            showUnitPrice={true}
            showTotal={true}
            primaryColor={pageTheme?.secondaryColor || '#C8102E'}
          />
        </div>
      </div>
    );
  };

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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Add Delivery Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Delivery"
        size="full"
      >
        {renderDeliveryForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddDelivery} disabled={isSubmitting || !isFormValid()}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Delivery'}
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
          <Button variant="primary" onClick={handleEditDelivery} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
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
        size="full"
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
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedDelivery.outletName || selectedDelivery.outlet?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedDelivery.status)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Items</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedDelivery.totalItems || 0}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Value</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  Rs. {(selectedDelivery.totalValue || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created / Updated</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedDelivery.createdAt).toLocaleDateString()} - {new Date(selectedDelivery.updatedAt).toLocaleDateString()}
              </p>
            </div>
            {(selectedDelivery.approvedByName || selectedDelivery.approvedBy) && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved By / Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {selectedDelivery.approvedByName || selectedDelivery.approvedBy?.fullName} • {new Date(selectedDelivery.approvedDate!).toLocaleDateString()}
                </p>
              </div>
            )}
            {selectedDelivery.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedDelivery.notes}</p>
              </div>
            )}

            {/* Delivery Items */}
            {selectedDelivery.items && selectedDelivery.items.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Delivery Items</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead style={{ backgroundColor: 'var(--muted)' }}>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Product</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Quantity</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Unit Price</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDelivery.items.map((item: any, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-3 py-2 text-xs">
                            <div>
                              <p className="font-medium">{item.productName || item.product?.name || 'Unknown Product'}</p>
                              {item.product?.code && <p className="text-muted-foreground">{item.product.code}</p>}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-xs text-right">{Number(item.quantity).toLocaleString()}</td>
                          <td className="px-3 py-2 text-xs text-right">Rs. {Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2 text-xs text-right font-semibold">Rs. {Number(item.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t" style={{ backgroundColor: 'var(--muted)' }}>
                      <tr>
                        <td className="px-3 py-2 text-xs font-bold">Total</td>
                        <td className="px-3 py-2 text-xs text-right font-bold">{selectedDelivery.totalItems || 0} items</td>
                        <td className="px-3 py-2"></td>
                        <td className="px-3 py-2 text-xs text-right font-bold" style={{ color: pageTheme?.primaryColor || '#C8102E' }}>
                          Rs. {(selectedDelivery.totalValue || 0).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
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
