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
import { disposalsApi, type Disposal } from '@/lib/api/disposals';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { productsApi, type Product } from '@/lib/api/products';
import ItemManagementTable, { type ItemManagementItem } from '@/components/operation/ItemManagementTable';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, isAdminUser, todayISO } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function DisposalPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const dateBounds = getDateBounds('today-only', user as any);
  const pageTheme = useThemeStore((s) => s.getPageTheme('disposal'));

  const [disposals, setDisposals] = useState<Disposal[]>([]);
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
  const [selectedDisposal, setSelectedDisposal] = useState<Disposal | null>(null);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  
  const [formData, setFormData] = useState({
    disposalDate: todayISO(),
    deliveredDate: '',
    showroomId: '',
    notes: '',
    status: 'Draft' as Disposal['status'],
  });

  const [disposalItems, setDisposalItems] = useState<ItemManagementItem[]>([]);

  const isFormValid = () => {
    return formData.disposalDate && formData.deliveredDate && formData.showroomId && disposalItems.length > 0;
  };

  useEffect(() => {
    fetchOutlets();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchDisposals();
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

  const fetchDisposals = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      
      const response = await disposalsApi.getAll(currentPage, pageSize, filters);
      setDisposals(response.disposals || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load disposals');
      setDisposals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDisposals = useMemo(() => {
    const today = todayISO();
    return disposals.filter(d => {
      const matchesSearch = 
        d.disposalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.outlet?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        isAdmin ||
        (d.createdById === user?.id && (showPreviousRecords || d.disposalDate === today));
      return matchesSearch && matchesRole;
    });
  }, [disposals, searchTerm, isAdmin, user, showPreviousRecords]);

  const paginatedDisposals = filteredDisposals;

  const handleAddDisposal = async () => {
    if (!formData.showroomId) {
      toast.error('Please select a showroom');
      return;
    }

    if (!formData.deliveredDate) {
      toast.error('Please enter delivered date');
      return;
    }

    if (disposalItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      setIsSubmitting(true);
      await disposalsApi.create({
        disposalDate: formData.disposalDate,
        deliveredDate: formData.deliveredDate,
        outletId: formData.showroomId,
        notes: formData.notes,
        items: disposalItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          reason: item.reason || '',
        })),
      });
      toast.success('Disposal created successfully');
      setShowAddModal(false);
      resetForm();
      fetchDisposals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create disposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDisposal = async () => {
    if (!selectedDisposal) return;
    
    try {
      setIsSubmitting(true);
      await disposalsApi.update(selectedDisposal.id, {
        disposalDate: formData.disposalDate,
        deliveredDate: formData.deliveredDate,
        outletId: formData.showroomId,
        notes: formData.notes,
        items: selectedDisposal.items?.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          reason: item.reason,
        })) || [],
      });
      toast.success('Disposal updated successfully');
      setShowEditModal(false);
      setSelectedDisposal(null);
      resetForm();
      fetchDisposals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update disposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await disposalsApi.submit(id);
      toast.success('Disposal submitted for approval');
      fetchDisposals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit disposal');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await disposalsApi.approve(id);
      toast.success('Disposal approved successfully');
      fetchDisposals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve disposal');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await disposalsApi.reject(id);
      toast.success('Disposal rejected');
      fetchDisposals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject disposal');
    }
  };

  const resetForm = () => {
    setFormData({
      disposalDate: todayISO(),
      deliveredDate: '',
      showroomId: '',
      notes: '',
      status: 'Draft',
    });
    setDisposalItems([]);
  };

  const openEditModal = (disposal: Disposal) => {
    setSelectedDisposal(disposal);
    setFormData({
      disposalDate: disposal.disposalDate,
      deliveredDate: disposal.deliveredDate || '',
      showroomId: disposal.outletId,
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
        <span className="font-mono font-semibold" style={{ color: pageTheme?.secondaryColor || '#C8102E' }}>
          {item.disposalNo}
        </span>
      ),
    },
    {
      key: 'showroom',
      label: 'Showroom',
      render: (item: Disposal) => (
        <span className="font-medium">{item.outletName || item.outlet?.name || '-'}</span>
      ),
    },
    {
      key: 'deliveredDate',
      label: 'Delivered Date',
      render: (item: Disposal) => (
        <span>{item.deliveredDate ? new Date(item.deliveredDate).toLocaleDateString() : '-'}</span>
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
      key: 'createdBy',
      label: 'Created By',
      render: (item: Disposal) => (
        <span className="text-sm">{item.createdByName || '-'}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: Disposal) => (
        <span className="text-sm">{item.approvedByName || item.approvedBy?.fullName || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Disposal) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              try {
                const fullDisposal = await disposalsApi.getById(item.id);
                setSelectedDisposal(fullDisposal);
                setShowViewModal(true);
              } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to load disposal details');
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
        </div>
      ),
    },
  ];

  const renderDisposalForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={<span>Disposal Date <span className="text-red-500">*</span></span>}
          type="date"
          value={formData.disposalDate}
          onChange={(e) => setFormData({ ...formData, disposalDate: e.target.value })}
          min={dateBounds.min}
          max={dateBounds.max}
          helperText={dateBounds.helperText}
          fullWidth
          required
        />
        <Input
          label={<span>Delivered Date <span className="text-red-500">*</span></span>}
          type="date"
          value={formData.deliveredDate}
          onChange={(e) => setFormData({ ...formData, deliveredDate: e.target.value })}
          fullWidth
          required
        />
      </div>
      <Select
        label={<span>Showroom <span className="text-red-500">*</span></span>}
        value={formData.showroomId}
        onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })}
        options={outlets.map(o => ({ value: o.id, label: `${o.code} - ${o.name}` }))}
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
      
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Disposal Items <span className="text-red-500">*</span>
        </h3>
        <ItemManagementTable
          products={products}
          items={disposalItems}
          onItemsChange={setDisposalItems}
          showReason={true}
          reasonLabel="Reason *"
          reasonPlaceholder="Reason for disposal (required)"
          showUnitPrice={false}
          showTotal={false}
          primaryColor={pageTheme?.secondaryColor || '#C8102E'}
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Disposal Management</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Track and manage product disposals ({filteredDisposals.length} records)
          </p>
          <div className="mt-2">
            <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
              <Info className="w-3 h-3 mr-1" />
              {isAdmin
                ? 'Admin: All records visible. Any date allowed.'
                : 'You see your own records for today only.'}
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  placeholder="Search disposals..."
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
          )}
        </CardContent>
      </Card>

      {/* Add Disposal Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Disposal"
        size="2xl"
      >
        {renderDisposalForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddDisposal} disabled={isSubmitting || !isFormValid()}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Disposal'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Disposal Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDisposal(null);
          resetForm();
        }}
        title="Edit Disposal"
        size="2xl"
      >
        {renderDisposalForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedDisposal(null);
            resetForm();
          }}>Cancel</Button>
          <Button variant="primary" onClick={handleEditDisposal} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* View Disposal Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedDisposal(null);
        }}
        title="Disposal Details"
        size="2xl"
      >
        {selectedDisposal && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Disposal No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedDisposal.disposalNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedDisposal.status)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Disposal Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {new Date(selectedDisposal.disposalDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivered Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {selectedDisposal.deliveredDate ? new Date(selectedDisposal.deliveredDate).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Showroom</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedDisposal.outletName || selectedDisposal.outlet?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Items</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedDisposal.totalItems || 0}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created / Updated</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedDisposal.createdAt).toLocaleDateString()} • {new Date(selectedDisposal.updatedAt).toLocaleDateString()}
              </p>
            </div>
            {selectedDisposal.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedDisposal.notes}</p>
              </div>
            )}
            
            {/* Disposal Items Table */}
            <div className="border-t pt-4">
              <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Disposal Items</h3>
              {selectedDisposal.items && selectedDisposal.items.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead style={{ backgroundColor: 'var(--muted)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Quantity</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDisposal.items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-3 text-sm">
                            {item.productCode || item.product?.code} - {item.productName || item.product?.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">{item.quantity.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm">{item.reason || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t" style={{ backgroundColor: 'var(--muted)' }}>
                      <tr>
                        <td className="px-4 py-3 text-sm font-bold">Total</td>
                        <td className="px-4 py-3 text-sm text-right font-bold">
                          {selectedDisposal.items.reduce((sum, item) => sum + item.quantity, 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                          {selectedDisposal.items.length} items
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-center py-4" style={{ color: 'var(--muted-foreground)' }}>
                  No items found
                </p>
              )}
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
