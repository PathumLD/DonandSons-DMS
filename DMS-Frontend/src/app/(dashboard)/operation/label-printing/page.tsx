'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Printer, CheckCircle, XCircle, Clock, Plus, Search, Loader2, Sun, Eye, Edit } from 'lucide-react';
import { labelPrintingApi, type LabelPrintRequest } from '@/lib/api/label-printing';
import { productsApi, type Product } from '@/lib/api/products';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, todayISO, isAdminUser } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function LabelPrintingPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('label-printing'));
  const dateBounds = getDateBounds('today-only', user as any, {
    allowBackDatePermission: 'operation.label-printing.allow-back-future',
    allowFutureDatePermission: 'operation.label-printing.allow-back-future',
  });

  const [formData, setFormData] = useState({
    productId: '',
    date: todayISO(),
    labelCount: '1',
    startDate: todayISO(),
    expiryDays: '7',
    priceOverride: '',
  });

  const [labelRequests, setLabelRequests] = useState<LabelPrintRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LabelPrintRequest | null>(null);

  useEffect(() => {
    console.log('Component mounted, fetching products...');
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [currentPage, pageSize]);

  useEffect(() => {
    console.log('Products state updated:', products.length, 'products');
  }, [products]);

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll(1, 1000);
      console.log('Products API response:', response);
      console.log('Total products:', response.products?.length);
      
      const labelPrintProducts = (response.products || []).filter(
        (p: Product) => p.isActive && p.enableLabelPrint,
      );
      
      console.log('Filtered label print products:', labelPrintProducts.length);
      
      setProducts(labelPrintProducts);
      
      if (labelPrintProducts.length === 0) {
        toast.warning('No products available for label printing. Please enable "Label Print" for products in inventory settings.');
      } else {
        console.log('Loaded products with label printing enabled:', labelPrintProducts.map(p => `${p.code} - ${p.name}`));
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error(error.response?.data?.message || 'Failed to load products');
    }
  };

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await labelPrintingApi.getAll(currentPage, pageSize);
      setLabelRequests(response.labelPrintRequests || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load label print requests');
      setLabelRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    const today = todayISO();
    return labelRequests.filter(req => {
      const matchesSearch =
        req.displayNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.productCode || req.product?.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.productName || req.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        isAdmin ||
        (req.createdById === user?.id && (showPreviousRecords || req.date >= today));
      return matchesSearch && matchesRole;
    });
  }, [labelRequests, searchTerm, isAdmin, user, showPreviousRecords]);

  const paginatedRequests = filteredRequests;

  const selectedProduct = products.find(p => p.id === formData.productId);
  const hasAllowFutureLabelPrint = selectedProduct?.allowFutureLabelPrint || false;

  const handleAdd = async () => {
    try {
      setIsSubmitting(true);
      await labelPrintingApi.create({
        date: formData.date,
        productId: formData.productId,
        labelCount: Number(formData.labelCount),
        startDate: formData.startDate,
        expiryDays: Number(formData.expiryDays),
        priceOverride: formData.priceOverride ? Number(formData.priceOverride) : undefined,
      });
      toast.success('Label print request created successfully');
      setShowAddModal(false);
      resetForm();
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create label print request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedRequest) return;
    
    try {
      setIsSubmitting(true);
      await labelPrintingApi.update(selectedRequest.id, {
        date: formData.date,
        productId: formData.productId,
        labelCount: Number(formData.labelCount),
        startDate: formData.startDate,
        expiryDays: Number(formData.expiryDays),
        priceOverride: formData.priceOverride ? Number(formData.priceOverride) : undefined,
      });
      toast.success('Label print request updated successfully');
      setShowEditModal(false);
      setSelectedRequest(null);
      resetForm();
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update label print request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await labelPrintingApi.approve(id);
      toast.success('Label print request approved');
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await labelPrintingApi.reject(id);
      toast.success('Label print request rejected');
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    }
  };

  const handlePrint = async (id: string) => {
    try {
      await labelPrintingApi.generatePrintData(id);
      toast.success('Print data generated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate print data');
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      date: todayISO(),
      labelCount: '1',
      startDate: todayISO(),
      expiryDays: '7',
      priceOverride: '',
    });
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

  const formatApproverCell = (item: LabelPrintRequest) => {
    if (item.status === 'Approved' && item.approvedByName) {
      const date = item.approvedDate
        ? new Date(item.approvedDate).toLocaleDateString()
        : '';
      return (
        <span className="text-sm">
          {item.approvedByName} {date && `- ${date}`}
        </span>
      );
    }
    if (item.status === 'Rejected' && item.rejectedByName) {
      const date = item.rejectedDate
        ? new Date(item.rejectedDate).toLocaleDateString()
        : '';
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
      key: 'date',
      label: 'Date',
      render: (item: LabelPrintRequest) => (
        <span className="font-medium">{new Date(item.date).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'displayNo',
      label: 'Display No',
      render: (item: LabelPrintRequest) => (
        <span className="font-mono font-semibold" style={{ color: pageTheme?.secondaryColor || '#C8102E' }}>
          {item.displayNo}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: LabelPrintRequest) => getStatusBadge(item.status),
    },
    {
      key: 'product',
      label: 'Product',
      render: (item: LabelPrintRequest) => (
        <div>
          <span className="font-medium">{item.productCode || item.product?.code} - {item.productName || item.product?.name || '-'}</span>
          {item.product?.allowFutureLabelPrint && (
            <Sun className="inline w-3 h-3 ml-1" style={{ color: '#F59E0B' }} title="Future label print allowed" />
          )}
        </div>
      ),
    },
    {
      key: 'labelCount',
      label: 'Label Count',
      render: (item: LabelPrintRequest) => (
        <span className="font-semibold">{item.labelCount}</span>
      ),
    },
    {
      key: 'editUser',
      label: 'Edit User',
      render: (item: LabelPrintRequest) => (
        <span className="text-sm">{item.updatedByName || '-'}</span>
      ),
    },
    {
      key: 'editDate',
      label: 'Edit Date',
      render: (item: LabelPrintRequest) => (
        <span className="text-sm">{new Date(item.updatedAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: LabelPrintRequest) => formatApproverCell(item),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: LabelPrintRequest) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              try {
                const detail = await labelPrintingApi.getById(item.id);
                setSelectedRequest(detail.data || detail);
                setShowViewModal(true);
              } catch (error) {
                toast.error('Failed to load label print request details');
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
                onClick={async () => {
                  try {
                    const detail = await labelPrintingApi.getById(item.id);
                    const fullRequest = detail.data || detail;
                    setSelectedRequest(fullRequest);
                    setFormData({
                      productId: fullRequest.productId || '',
                      date: fullRequest.date?.split('T')[0] || todayISO(),
                      labelCount: String(fullRequest.labelCount || 1),
                      startDate: fullRequest.startDate?.split('T')[0] || todayISO(),
                      expiryDays: String(fullRequest.expiryDays || 7),
                      priceOverride: fullRequest.priceOverride ? String(fullRequest.priceOverride) : '',
                    });
                    setShowEditModal(true);
                  } catch (error) {
                    toast.error('Failed to load label print request details');
                  }
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
          {item.status === 'Approved' && (
            <button
              onClick={() => handlePrint(item.id)}
              className="p-1.5 rounded transition-colors"
              style={{ color: 'var(--primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Print Labels"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Label Printing</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage product label printing requests ({filteredRequests.length} requests)
          </p>
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
            New Request
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Label Print Requests</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search requests..."
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
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
            </div>
          ) : (
            <DataTable
              data={paginatedRequests}
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
        title="New Label Print Request"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Select
              label="Product"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              options={products.map(p => ({ 
                value: p.id, 
                label: `${p.code} - ${p.name}${p.allowFutureLabelPrint ? ' ☀️' : ''}` 
              }))}
              placeholder={products.length === 0 ? "No products available" : "Select product"}
              fullWidth
              required
            />
            {products.length === 0 && (
              <p className="text-xs mt-1 text-amber-600">
                No products with label printing enabled. Please enable "Label Print" for products in Inventory settings.
              </p>
            )}
            {products.length > 0 && (
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {products.length} product{products.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            min={dateBounds.min}
            max={dateBounds.max}
            helperText={hasAllowFutureLabelPrint ? 'Future dates allowed for this product' : dateBounds.helperText}
            style={hasAllowFutureLabelPrint ? { backgroundColor: '#FEF3C7' } : {}}
            fullWidth
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Label Count"
              type="number"
              min="1"
              value={formData.labelCount}
              onChange={(e) => setFormData({ ...formData, labelCount: e.target.value })}
              fullWidth
              required
            />
            <Input
              label="Expiry Days"
              type="number"
              min="1"
              value={formData.expiryDays}
              onChange={(e) => setFormData({ ...formData, expiryDays: e.target.value })}
              fullWidth
              required
            />
          </div>
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            fullWidth
            required
          />
          <Input
            label="Price Override (Optional)"
            type="number"
            min="0"
            step="0.01"
            value={formData.priceOverride}
            onChange={(e) => setFormData({ ...formData, priceOverride: e.target.value })}
            placeholder="Leave blank to use product price"
            fullWidth
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Request'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Label Print Request Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRequest(null);
          resetForm();
        }}
        title="Edit Label Print Request"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Select
              label="Product"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              options={products.map(p => ({ 
                value: p.id, 
                label: `${p.code} - ${p.name}${p.allowFutureLabelPrint ? ' ☀️' : ''}` 
              }))}
              placeholder={products.length === 0 ? "No products available" : "Select product"}
              fullWidth
              required
            />
            {products.length === 0 && (
              <p className="text-xs mt-1 text-amber-600">
                No products with label printing enabled. Please enable "Label Print" for products in Inventory settings.
              </p>
            )}
            {products.length > 0 && (
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {products.length} product{products.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            min={dateBounds.min}
            max={dateBounds.max}
            helperText={hasAllowFutureLabelPrint ? 'Future dates allowed for this product' : dateBounds.helperText}
            style={hasAllowFutureLabelPrint ? { backgroundColor: '#FEF3C7' } : {}}
            fullWidth
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Label Count"
              type="number"
              min="1"
              value={formData.labelCount}
              onChange={(e) => setFormData({ ...formData, labelCount: e.target.value })}
              fullWidth
              required
            />
            <Input
              label="Expiry Days"
              type="number"
              min="1"
              value={formData.expiryDays}
              onChange={(e) => setFormData({ ...formData, expiryDays: e.target.value })}
              fullWidth
              required
            />
          </div>
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            fullWidth
            required
          />
          <Input
            label="Price Override (Optional)"
            type="number"
            min="0"
            step="0.01"
            value={formData.priceOverride}
            onChange={(e) => setFormData({ ...formData, priceOverride: e.target.value })}
            placeholder="Leave blank to use product price"
            fullWidth
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedRequest(null);
            resetForm();
          }}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Edit className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* View Label Print Request Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRequest(null);
        }}
        title="Label Print Request Details"
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Request No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedRequest.displayNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedRequest.status)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Date</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedRequest.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Product</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {selectedRequest.productCode || selectedRequest.product?.code} - {selectedRequest.productName || selectedRequest.product?.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Label Count</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedRequest.labelCount}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Start Date</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedRequest.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Expiry Days</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedRequest.expiryDays}</p>
            </div>
            {selectedRequest.priceOverride && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Price Override</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedRequest.priceOverride}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created / Updated</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedRequest.createdAt).toLocaleDateString()} • {new Date(selectedRequest.updatedAt).toLocaleDateString()}
              </p>
            </div>
            {(selectedRequest.approvedByName || selectedRequest.rejectedByName) && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved/Rejected By</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {selectedRequest.status === 'Approved' && selectedRequest.approvedByName && 
                    `${selectedRequest.approvedByName} • ${selectedRequest.approvedDate ? new Date(selectedRequest.approvedDate).toLocaleDateString() : ''}`
                  }
                  {selectedRequest.status === 'Rejected' && selectedRequest.rejectedByName && 
                    `${selectedRequest.rejectedByName} • ${selectedRequest.rejectedDate ? new Date(selectedRequest.rejectedDate).toLocaleDateString() : ''}`
                  }
                </p>
              </div>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowViewModal(false);
            setSelectedRequest(null);
          }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
