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
import { transfersApi, type Transfer } from '@/lib/api/transfers';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { productsApi, type Product } from '@/lib/api/products';
import ItemManagementTable, { type ItemManagementItem } from '@/components/operation/ItemManagementTable';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, isAdminUser, todayISO, addDaysISO } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function TransferPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('transfer'));
  const dateBounds = getDateBounds('back-3-no-future', user as any, {
    allowBackDatePermission: 'operation.transfer.allow-back-future',
    allowFutureDatePermission: 'operation.transfer.allow-back-future',
  });

  const [transfers, setTransfers] = useState<Transfer[]>([]);
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
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  
  const [formData, setFormData] = useState({
    transferDate: todayISO(),
    fromShowroomId: '',
    toShowroomId: '',
    notes: '',
    status: 'Draft' as Transfer['status'],
  });

  const [transferItems, setTransferItems] = useState<ItemManagementItem[]>([]);

  const isFormValid = () => {
    return formData.transferDate && formData.fromShowroomId && formData.toShowroomId && 
           formData.fromShowroomId !== formData.toShowroomId && transferItems.length > 0;
  };

  useEffect(() => {
    fetchOutlets();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchTransfers();
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

  const fetchTransfers = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      
      const response = await transfersApi.getAll(currentPage, pageSize, filters);
      setTransfers(response.transfers || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load transfers');
      setTransfers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransfers = useMemo(() => {
    const minDate = dateBounds.min || addDaysISO(-3);
    return transfers.filter(t => {
      const matchesSearch = 
        t.transferNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.fromOutlet?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.toOutlet?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        isAdmin ||
        (t.createdById === user?.id && (showPreviousRecords || t.transferDate >= minDate));
      return matchesSearch && matchesRole;
    });
  }, [transfers, searchTerm, isAdmin, user, showPreviousRecords, dateBounds]);

  const paginatedTransfers = filteredTransfers;

  const handleAddTransfer = async () => {
    if (!formData.fromShowroomId || !formData.toShowroomId) {
      toast.error('Please select both showrooms');
      return;
    }

    if (formData.fromShowroomId === formData.toShowroomId) {
      toast.error('From and To outlets must be different');
      return;
    }

    if (transferItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await transfersApi.create({
        transferDate: formData.transferDate,
        fromOutletId: formData.fromShowroomId,
        toOutletId: formData.toShowroomId,
        notes: formData.notes,
        items: transferItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      toast.success('Transfer created successfully');
      setShowAddModal(false);
      resetForm();
      fetchTransfers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTransfer = async () => {
    if (!selectedTransfer) return;
    
    if (formData.fromShowroomId === formData.toShowroomId) {
      toast.error('From and To outlets must be different');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await transfersApi.update(selectedTransfer.id, {
        transferDate: formData.transferDate,
        fromOutletId: formData.fromShowroomId,
        toOutletId: formData.toShowroomId,
        notes: formData.notes,
        items: selectedTransfer.items?.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
        })) || [],
      });
      toast.success('Transfer updated successfully');
      setShowEditModal(false);
      setSelectedTransfer(null);
      resetForm();
      fetchTransfers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await transfersApi.submit(id);
      toast.success('Transfer submitted for approval');
      fetchTransfers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit transfer');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await transfersApi.approve(id);
      toast.success('Transfer approved successfully');
      fetchTransfers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve transfer');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await transfersApi.reject(id);
      toast.success('Transfer rejected');
      fetchTransfers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject transfer');
    }
  };

  const resetForm = () => {
    setFormData({
      transferDate: todayISO(),
      fromShowroomId: '',
      toShowroomId: '',
      notes: '',
      status: 'Draft',
    });
    setTransferItems([]);
  };

  const openEditModal = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setFormData({
      transferDate: transfer.transferDate,
      fromShowroomId: transfer.fromOutletId,
      toShowroomId: transfer.toOutletId,
      notes: transfer.notes || '',
      status: transfer.status,
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
        <span className="font-mono font-semibold" style={{ color: pageTheme?.secondaryColor || '#C8102E' }}>
          {item.transferNo}
        </span>
      ),
    },
    {
      key: 'fromShowroom',
      label: 'From Showroom',
      render: (item: Transfer) => (
        <span className="font-medium">{item.fromOutletName || item.fromOutlet?.name || '-'}</span>
      ),
    },
    {
      key: 'toShowroom',
      label: 'To Showroom',
      render: (item: Transfer) => (
        <span className="font-medium">{item.toOutletName || item.toOutlet?.name || '-'}</span>
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
      key: 'createdBy',
      label: 'Created By',
      render: (item: Transfer) => (
        <span className="text-sm">{item.createdByName || '-'}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: Transfer) => (
        <span className="text-sm">{item.approvedByName || item.approvedBy?.fullName || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Transfer) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              try {
                const fullTransfer = await transfersApi.getById(item.id);
                setSelectedTransfer(fullTransfer);
                setShowViewModal(true);
              } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to load transfer details');
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

  const renderTransferForm = () => (
    <div className="space-y-6">
      <Input
        label={<span>Transfer Date <span className="text-red-500">*</span></span>}
        type="date"
        value={formData.transferDate}
        onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
        min={dateBounds.min}
        max={dateBounds.max}
        helperText={dateBounds.helperText}
        fullWidth
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label={<span>From Showroom <span className="text-red-500">*</span></span>}
          value={formData.fromShowroomId}
          onChange={(e) => setFormData({ ...formData, fromShowroomId: e.target.value })}
          options={outlets.filter(o => o.id !== formData.toShowroomId).map(o => ({ value: o.id, label: `${o.code} - ${o.name}` }))}
          placeholder="Select source showroom"
          fullWidth
          required
        />
        <Select
          label={<span>To Showroom <span className="text-red-500">*</span></span>}
          value={formData.toShowroomId}
          onChange={(e) => setFormData({ ...formData, toShowroomId: e.target.value })}
          options={outlets.filter(o => o.id !== formData.fromShowroomId).map(o => ({ value: o.id, label: `${o.code} - ${o.name}` }))}
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
      
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Transfer Items <span className="text-red-500">*</span>
        </h3>
        <ItemManagementTable
          products={products}
          items={transferItems}
          onItemsChange={setTransferItems}
          showReason={false}
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Stock Transfer</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Transfer products between showrooms ({filteredTransfers.length} transfers)
          </p>
          <div className="mt-2">
            <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
              <Info className="w-3 h-3 mr-1" />
              {isAdmin
                ? 'Admin: All records visible. Any date allowed.'
                : 'You see your own transfers. Back date up to 3 days, no future date.'}
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
                  { value: 'Rejected', label: 'Rejected' },
                ]}
              />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  placeholder="Search transfers..."
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
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Transfer"
        size="2xl"
      >
        {renderTransferForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddTransfer} disabled={isSubmitting || !isFormValid()}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Transfer'}
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
        size="2xl"
      >
        {renderTransferForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedTransfer(null);
            resetForm();
          }}>Cancel</Button>
          <Button variant="primary" onClick={handleEditTransfer} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedTransfer(null);
        }}
        title="Transfer Details"
        size="2xl"
      >
        {selectedTransfer && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Transfer No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedTransfer.transferNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedTransfer.status)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Transfer Date</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedTransfer.transferDate).toLocaleDateString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>From Showroom</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedTransfer.fromOutletName || selectedTransfer.fromOutlet?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>To Showroom</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedTransfer.toOutletName || selectedTransfer.toOutlet?.name || '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Items</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedTransfer.totalItems || 0}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created / Updated</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedTransfer.createdAt).toLocaleDateString()} • {new Date(selectedTransfer.updatedAt).toLocaleDateString()}
              </p>
            </div>
            {selectedTransfer.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedTransfer.notes}</p>
              </div>
            )}
            
            {/* Transfer Items Table */}
            <div className="border-t pt-4">
              <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Transfer Items</h3>
              {selectedTransfer.items && selectedTransfer.items.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead style={{ backgroundColor: 'var(--muted)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransfer.items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-3 text-sm">
                            {item.productCode || item.product?.code} - {item.productName || item.product?.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">{item.quantity.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t" style={{ backgroundColor: 'var(--muted)' }}>
                      <tr>
                        <td className="px-4 py-3 text-sm font-bold">Total</td>
                        <td className="px-4 py-3 text-sm text-right font-bold">
                          {selectedTransfer.items.reduce((sum, item) => sum + item.quantity, 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-sm text-center text-muted-foreground">
                          {selectedTransfer.items.length} items
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
            setSelectedTransfer(null);
          }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
